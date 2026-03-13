#!/usr/bin/env python3
"""
Backend API Testing for Guerrero Academy
Tests all endpoints for functionality, validation, and error handling
"""

import requests
import sys
from datetime import datetime, date, timedelta
import json

class GuerreroAcademyAPITester:
    def __init__(self, base_url="https://guerrero-academy.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, response_data=None, error_msg=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {error_msg}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "response_data": response_data,
            "error": error_msg
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            response_data = response.json() if response.content else {}
            
            if success:
                self.log_test(name, True, response_data)
                return True, response_data
            else:
                self.log_test(name, False, error_msg=f"Expected {expected_status}, got {response.status_code}")
                return False, response_data

        except Exception as e:
            self.log_test(name, False, error_msg=str(e))
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, data = self.run_test("Health Check", "GET", "health", 200)
        if success and "status" in data:
            return data.get("status") == "healthy"
        return False

    def test_public_categories(self):
        """Test public categories endpoint"""
        success, data = self.run_test("Get Public Categories", "GET", "categorias/publicas", 200)
        if success and isinstance(data, list):
            # Verify category structure
            if len(data) > 0:
                cat = data[0]
                required_fields = ["id", "nombre", "edad_min", "edad_max", "cupo_maximo", "cupo_actual"]
                return all(field in cat for field in required_fields)
            return True
        return False

    def test_public_inscription_valid(self):
        """Test valid public inscription"""
        # Kid born in 2016 = 10 years old = Sub-10 category
        inscription_data = {
            "nombre_jugador": "Carlos Test Guerrero",
            "fecha_nacimiento": "2016-05-15",  # 10 years old
            "nombre_tutor": "Maria Test Tutor",
            "telefono_tutor": "829-555-1234",
            "email_tutor": "test@example.com",
            "observaciones": "Test inscription"
        }
        
        success, data = self.run_test("Public Inscription (Valid)", "POST", "inscripcion", 200, inscription_data)
        if success:
            # Verify response structure
            return "message" in data and "jugador" in data and "categoria" in data
        return False

    def test_public_inscription_age_validation(self):
        """Test age validation in public inscription"""
        # Test with invalid age (too young)
        invalid_data = {
            "nombre_jugador": "Test Invalid Age",
            "fecha_nacimiento": "2020-01-01",  # 6 years old - invalid
            "nombre_tutor": "Test Tutor",
            "telefono_tutor": "829-555-9999",
        }
        
        success, data = self.run_test("Public Inscription (Invalid Age)", "POST", "inscripcion", 400, invalid_data)
        return not success  # Should fail with 400

    def test_public_inscription_duplicate(self):
        """Test duplicate registration prevention"""
        duplicate_data = {
            "nombre_jugador": "Carlos Test Guerrero",  # Same as previous test
            "fecha_nacimiento": "2016-05-15",
            "nombre_tutor": "Maria Test Tutor", 
            "telefono_tutor": "829-555-1234",
        }
        
        success, data = self.run_test("Public Inscription (Duplicate)", "POST", "inscripcion", 400, duplicate_data)
        return not success  # Should fail with 400

    def test_admin_login(self):
        """Test admin login"""
        login_data = {"email": "dgexp", "password": "123456"}
        success, data = self.run_test("Admin Login", "POST", "auth/login", 200, login_data)
        
        if success and "token" in data:
            self.token = data["token"]
            return "admin" in data and data["admin"]["email"] == "dgexp"
        return False

    def test_admin_invalid_login(self):
        """Test invalid admin login"""
        invalid_login = {"email": "wrong", "password": "wrong"}
        success, data = self.run_test("Admin Invalid Login", "POST", "auth/login", 401, invalid_login)
        return not success  # Should fail

    def test_dashboard_data(self):
        """Test dashboard endpoint (requires auth)"""
        if not self.token:
            self.log_test("Dashboard Data", False, error_msg="No auth token")
            return False
            
        success, data = self.run_test("Dashboard Data", "GET", "dashboard", 200)
        if success:
            required_fields = ["total_jugadores", "categorias", "pagos_pendientes", "ingresos_mes"]
            return all(field in data for field in required_fields)
        return False

    def test_players_crud(self):
        """Test players CRUD operations"""
        if not self.token:
            self.log_test("Players CRUD", False, error_msg="No auth token")
            return False

        # Get categories first
        success, categories = self.run_test("Get Categories for CRUD", "GET", "categorias", 200)
        if not success or not categories:
            return False

        categoria_id = categories[0]["id"]

        # Create player
        player_data = {
            "nombre_jugador": "Test Player CRUD",
            "fecha_nacimiento": "2015-03-10",
            "categoria_id": categoria_id,
            "nombre_tutor": "Test CRUD Tutor",
            "telefono_tutor": "829-555-CRUD",
            "email_tutor": "crud@test.com"
        }

        success, created_player = self.run_test("Create Player", "POST", "jugadores", 200, player_data)
        if not success:
            return False

        player_id = created_player["id"]

        # Read player
        success, read_player = self.run_test("Read Player", "GET", f"jugadores/{player_id}", 200)
        if not success:
            return False

        # Update player
        update_data = {"nombre_jugador": "Updated Test Player"}
        success, _ = self.run_test("Update Player", "PUT", f"jugadores/{player_id}", 200, update_data)
        if not success:
            return False

        # Delete player
        success, _ = self.run_test("Delete Player", "DELETE", f"jugadores/{player_id}", 200)
        return success

    def test_attendance_flow(self):
        """Test attendance jornada creation and management"""
        if not self.token:
            self.log_test("Attendance Flow", False, error_msg="No auth token")
            return False

        # Get categories
        success, categories = self.run_test("Get Categories for Attendance", "GET", "categorias", 200)
        if not success or not categories:
            return False

        categoria_id = categories[0]["id"]
        today = date.today().isoformat()

        # Create jornada
        jornada_data = {"fecha": today, "categoria_id": categoria_id}
        success, jornada = self.run_test("Create Jornada", "POST", "jornadas", 200, jornada_data)
        if not success:
            return False

        jornada_id = jornada["id"]

        # Get jornada attendance
        success, attendance_data = self.run_test("Get Jornada Attendance", "GET", f"jornadas/{jornada_id}/asistencia", 200)
        return success and "jornada" in attendance_data and "jugadores" in attendance_data

    def test_payments_flow(self):
        """Test payments registration"""
        if not self.token:
            self.log_test("Payments Flow", False, error_msg="No auth token")
            return False

        # Get players first
        success, players = self.run_test("Get Players for Payment", "GET", "jugadores", 200)
        if not success or not players:
            self.log_test("Payments Flow", False, error_msg="No players found for payment test")
            return True  # Skip if no players

        player_id = players[0]["id"]
        current_month = datetime.now().strftime("%Y-%m")

        # Register payment
        payment_data = {
            "jugador_id": player_id,
            "monto": 3500.0,
            "mes": current_month,
            "metodo": "efectivo"
        }

        success, payment = self.run_test("Register Payment", "POST", "pagos", 200, payment_data)
        if not success:
            return False

        # Get pending payments
        success, pending = self.run_test("Get Pending Payments", "GET", "pagos/pendientes", 200)
        return success

    def run_all_tests(self):
        """Run complete test suite"""
        print("🔍 Starting Guerrero Academy Backend API Tests")
        print("=" * 60)

        # Public endpoints (no auth required)
        print("\n📋 Testing Public Endpoints...")
        self.test_health_check()
        self.test_public_categories()
        self.test_public_inscription_valid()
        self.test_public_inscription_age_validation()
        self.test_public_inscription_duplicate()

        # Authentication
        print("\n🔐 Testing Authentication...")
        self.test_admin_invalid_login()
        login_success = self.test_admin_login()

        if login_success:
            print("\n👤 Testing Admin Endpoints...")
            self.test_dashboard_data()
            self.test_players_crud()
            self.test_attendance_flow()
            self.test_payments_flow()
        else:
            print("❌ Cannot continue with admin tests - login failed")

        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")

        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1

if __name__ == "__main__":
    tester = GuerreroAcademyAPITester()
    sys.exit(tester.run_all_tests())