from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date
import hashlib
import jwt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'guerrero-academy-secret-key-2024')
JWT_ALGORITHM = "HS256"

app = FastAPI(title="Guerrero Academy API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== UTILITY FUNCTIONS ====================

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(admin_id: str, email: str) -> str:
    payload = {
        "admin_id": admin_id,
        "email": email,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    admin = await db.admins.find_one({"id": payload["admin_id"]}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin no encontrado")
    return admin

# ==================== MODELS ====================

class AdminCreate(BaseModel):
    email: str
    password: str
    nombre: str

class AdminLogin(BaseModel):
    email: str
    password: str

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    nombre: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CategoriaCreate(BaseModel):
    nombre: str
    edad_min: int
    edad_max: int
    cupo_maximo: int
    horario: str = "Sábados 8:00 AM - 12:00 PM"

class Categoria(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    edad_min: int
    edad_max: int
    cupo_maximo: int
    cupo_actual: int = 0
    horario: str
    activa: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class JugadorCreate(BaseModel):
    nombre_jugador: str
    fecha_nacimiento: str
    categoria_id: str
    nombre_tutor: str
    telefono_tutor: str
    email_tutor: Optional[str] = None
    observaciones: Optional[str] = ""

class JugadorUpdate(BaseModel):
    nombre_jugador: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    categoria_id: Optional[str] = None
    nombre_tutor: Optional[str] = None
    telefono_tutor: Optional[str] = None
    email_tutor: Optional[str] = None
    observaciones: Optional[str] = None
    estado: Optional[str] = None

class Jugador(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre_jugador: str
    fecha_nacimiento: str
    edad: int
    categoria_id: str
    categoria_nombre: str
    nombre_tutor: str
    telefono_tutor: str
    email_tutor: Optional[str] = None
    observaciones: str = ""
    estado: str = "activo"
    fecha_inscripcion: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    estado_pago: str = "pendiente"

class InscripcionPublica(BaseModel):
    nombre_jugador: str
    fecha_nacimiento: str
    nombre_tutor: str
    telefono_tutor: str
    email_tutor: Optional[str] = None
    observaciones: Optional[str] = ""

class JornadaCreate(BaseModel):
    fecha: str
    categoria_id: str

class Jornada(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fecha: str
    categoria_id: str
    categoria_nombre: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AsistenciaRegistro(BaseModel):
    jugador_id: str
    estado: str  # presente, ausente, excusado

class AsistenciaUpdate(BaseModel):
    jornada_id: str
    asistencias: List[AsistenciaRegistro]

class PagoCreate(BaseModel):
    jugador_id: str
    monto: float
    mes: str
    metodo: str = "efectivo"
    notas: Optional[str] = ""

class Pago(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    jugador_id: str
    jugador_nombre: str
    monto: float
    mes: str
    metodo: str
    notas: str = ""
    fecha_pago: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== HELPER FUNCTIONS ====================

def calcular_edad(fecha_nacimiento: str) -> int:
    try:
        birth = datetime.strptime(fecha_nacimiento, "%Y-%m-%d")
        today = datetime.now()
        age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
        return age
    except:
        return 0

async def obtener_categoria_por_edad(edad: int):
    categorias = await db.categorias.find({"activa": True}, {"_id": 0}).to_list(100)
    for cat in categorias:
        if cat["edad_min"] <= edad <= cat["edad_max"]:
            return cat
    return None

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/login")
async def login(data: AdminLogin):
    admin = await db.admins.find_one({"email": data.email}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if admin["password_hash"] != hash_password(data.password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    token = create_token(admin["id"], admin["email"])
    return {
        "token": token,
        "admin": {
            "id": admin["id"],
            "email": admin["email"],
            "nombre": admin["nombre"]
        }
    }

@api_router.get("/auth/me")
async def get_me(admin: dict = Depends(get_current_admin)):
    return {"id": admin["id"], "email": admin["email"], "nombre": admin["nombre"]}

# ==================== CATEGORIAS ROUTES ====================

@api_router.get("/categorias", response_model=List[dict])
async def get_categorias():
    categorias = await db.categorias.find({}, {"_id": 0}).to_list(100)
    for cat in categorias:
        count = await db.jugadores.count_documents({"categoria_id": cat["id"], "estado": "activo"})
        cat["cupo_actual"] = count
    return categorias

@api_router.get("/categorias/publicas")
async def get_categorias_publicas():
    categorias = await db.categorias.find({"activa": True}, {"_id": 0}).to_list(100)
    result = []
    for cat in categorias:
        count = await db.jugadores.count_documents({"categoria_id": cat["id"], "estado": "activo"})
        result.append({
            "id": cat["id"],
            "nombre": cat["nombre"],
            "edad_min": cat["edad_min"],
            "edad_max": cat["edad_max"],
            "cupo_maximo": cat["cupo_maximo"],
            "cupo_actual": count,
            "cupos_disponibles": cat["cupo_maximo"] - count,
            "horario": cat["horario"]
        })
    return result

@api_router.post("/categorias", response_model=dict)
async def create_categoria(data: CategoriaCreate, admin: dict = Depends(get_current_admin)):
    categoria = Categoria(**data.model_dump())
    doc = categoria.model_dump()
    await db.categorias.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/categorias/{categoria_id}")
async def update_categoria(categoria_id: str, data: CategoriaCreate, admin: dict = Depends(get_current_admin)):
    result = await db.categorias.update_one(
        {"id": categoria_id},
        {"$set": data.model_dump()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return {"message": "Categoría actualizada"}

@api_router.delete("/categorias/{categoria_id}")
async def delete_categoria(categoria_id: str, admin: dict = Depends(get_current_admin)):
    jugadores = await db.jugadores.count_documents({"categoria_id": categoria_id})
    if jugadores > 0:
        raise HTTPException(status_code=400, detail="No se puede eliminar una categoría con jugadores")
    
    result = await db.categorias.delete_one({"id": categoria_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return {"message": "Categoría eliminada"}

# ==================== JUGADORES ROUTES ====================

@api_router.get("/jugadores", response_model=List[dict])
async def get_jugadores(
    categoria_id: Optional[str] = None,
    estado: Optional[str] = None,
    busqueda: Optional[str] = None,
    admin: dict = Depends(get_current_admin)
):
    query = {}
    if categoria_id:
        query["categoria_id"] = categoria_id
    if estado:
        query["estado"] = estado
    if busqueda:
        query["$or"] = [
            {"nombre_jugador": {"$regex": busqueda, "$options": "i"}},
            {"nombre_tutor": {"$regex": busqueda, "$options": "i"}},
            {"telefono_tutor": {"$regex": busqueda, "$options": "i"}}
        ]
    
    jugadores = await db.jugadores.find(query, {"_id": 0}).sort("fecha_inscripcion", -1).to_list(1000)
    
    # Get last payment status for each player
    for jugador in jugadores:
        ultimo_pago = await db.pagos.find_one(
            {"jugador_id": jugador["id"]},
            {"_id": 0},
            sort=[("fecha_pago", -1)]
        )
        jugador["ultimo_pago"] = ultimo_pago
    
    return jugadores

@api_router.get("/jugadores/{jugador_id}")
async def get_jugador(jugador_id: str, admin: dict = Depends(get_current_admin)):
    jugador = await db.jugadores.find_one({"id": jugador_id}, {"_id": 0})
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    
    # Get payment history
    pagos = await db.pagos.find({"jugador_id": jugador_id}, {"_id": 0}).sort("fecha_pago", -1).to_list(100)
    jugador["pagos"] = pagos
    
    # Get attendance history
    asistencias = await db.asistencias.find({"jugador_id": jugador_id}, {"_id": 0}).sort("fecha", -1).to_list(100)
    jugador["asistencias"] = asistencias
    
    return jugador

@api_router.post("/jugadores", response_model=dict)
async def create_jugador(data: JugadorCreate, admin: dict = Depends(get_current_admin)):
    # Check category exists and has space
    categoria = await db.categorias.find_one({"id": data.categoria_id}, {"_id": 0})
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    cupo_actual = await db.jugadores.count_documents({"categoria_id": data.categoria_id, "estado": "activo"})
    if cupo_actual >= categoria["cupo_maximo"]:
        raise HTTPException(status_code=400, detail="La categoría está llena")
    
    # Check for duplicate
    existing = await db.jugadores.find_one({
        "nombre_jugador": {"$regex": f"^{data.nombre_jugador}$", "$options": "i"},
        "telefono_tutor": data.telefono_tutor
    })
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un jugador con ese nombre y teléfono")
    
    edad = calcular_edad(data.fecha_nacimiento)
    
    jugador_data = data.model_dump()
    jugador_data["edad"] = edad
    jugador_data["categoria_nombre"] = categoria["nombre"]
    
    jugador = Jugador(**jugador_data)
    doc = jugador.model_dump()
    await db.jugadores.insert_one(doc)
    
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/jugadores/{jugador_id}")
async def update_jugador(jugador_id: str, data: JugadorUpdate, admin: dict = Depends(get_current_admin)):
    jugador = await db.jugadores.find_one({"id": jugador_id}, {"_id": 0})
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    # If changing category, verify space
    if "categoria_id" in update_data and update_data["categoria_id"] != jugador["categoria_id"]:
        nueva_cat = await db.categorias.find_one({"id": update_data["categoria_id"]}, {"_id": 0})
        if not nueva_cat:
            raise HTTPException(status_code=404, detail="Nueva categoría no encontrada")
        
        cupo_actual = await db.jugadores.count_documents({"categoria_id": update_data["categoria_id"], "estado": "activo"})
        if cupo_actual >= nueva_cat["cupo_maximo"]:
            raise HTTPException(status_code=400, detail="La nueva categoría está llena")
        
        update_data["categoria_nombre"] = nueva_cat["nombre"]
    
    # Recalculate age if birth date changed
    if "fecha_nacimiento" in update_data:
        update_data["edad"] = calcular_edad(update_data["fecha_nacimiento"])
    
    await db.jugadores.update_one({"id": jugador_id}, {"$set": update_data})
    return {"message": "Jugador actualizado"}

@api_router.delete("/jugadores/{jugador_id}")
async def delete_jugador(jugador_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.jugadores.delete_one({"id": jugador_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    
    # Also delete related records
    await db.asistencias.delete_many({"jugador_id": jugador_id})
    await db.pagos.delete_many({"jugador_id": jugador_id})
    
    return {"message": "Jugador eliminado"}

# ==================== INSCRIPCION PUBLICA ====================

@api_router.post("/inscripcion")
async def inscripcion_publica(data: InscripcionPublica):
    edad = calcular_edad(data.fecha_nacimiento)
    
    if edad < 8 or edad > 17:
        raise HTTPException(status_code=400, detail="La edad debe estar entre 8 y 17 años")
    
    # Find appropriate category
    categoria = await obtener_categoria_por_edad(edad)
    if not categoria:
        raise HTTPException(status_code=400, detail="No hay categoría disponible para esta edad")
    
    # Check capacity
    cupo_actual = await db.jugadores.count_documents({"categoria_id": categoria["id"], "estado": "activo"})
    if cupo_actual >= categoria["cupo_maximo"]:
        raise HTTPException(status_code=400, detail=f"La categoría {categoria['nombre']} está llena")
    
    # Check for duplicate
    existing = await db.jugadores.find_one({
        "nombre_jugador": {"$regex": f"^{data.nombre_jugador}$", "$options": "i"},
        "telefono_tutor": data.telefono_tutor
    })
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una inscripción con estos datos")
    
    jugador_data = data.model_dump()
    jugador_data["edad"] = edad
    jugador_data["categoria_id"] = categoria["id"]
    jugador_data["categoria_nombre"] = categoria["nombre"]
    jugador_data["observaciones"] = data.observaciones or ""
    
    jugador = Jugador(**jugador_data)
    doc = jugador.model_dump()
    await db.jugadores.insert_one(doc)
    
    return {
        "message": "¡Inscripción exitosa!",
        "jugador": {
            "nombre": doc["nombre_jugador"],
            "categoria": doc["categoria_nombre"],
            "edad": doc["edad"]
        },
        "categoria": {
            "nombre": categoria["nombre"],
            "horario": categoria["horario"]
        }
    }

# ==================== ASISTENCIA ROUTES ====================

@api_router.get("/jornadas")
async def get_jornadas(categoria_id: Optional[str] = None, admin: dict = Depends(get_current_admin)):
    query = {}
    if categoria_id:
        query["categoria_id"] = categoria_id
    jornadas = await db.jornadas.find(query, {"_id": 0}).sort("fecha", -1).to_list(100)
    return jornadas

@api_router.post("/jornadas")
async def create_jornada(data: JornadaCreate, admin: dict = Depends(get_current_admin)):
    categoria = await db.categorias.find_one({"id": data.categoria_id}, {"_id": 0})
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Check if jornada already exists
    existing = await db.jornadas.find_one({"fecha": data.fecha, "categoria_id": data.categoria_id})
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una jornada para esta fecha y categoría")
    
    jornada = Jornada(
        fecha=data.fecha,
        categoria_id=data.categoria_id,
        categoria_nombre=categoria["nombre"]
    )
    doc = jornada.model_dump()
    await db.jornadas.insert_one(doc)
    
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.get("/jornadas/{jornada_id}/asistencia")
async def get_asistencia_jornada(jornada_id: str, admin: dict = Depends(get_current_admin)):
    jornada = await db.jornadas.find_one({"id": jornada_id}, {"_id": 0})
    if not jornada:
        raise HTTPException(status_code=404, detail="Jornada no encontrada")
    
    # Get all players in category
    jugadores = await db.jugadores.find(
        {"categoria_id": jornada["categoria_id"], "estado": "activo"},
        {"_id": 0}
    ).to_list(100)
    
    # Get existing attendance records
    asistencias = await db.asistencias.find(
        {"jornada_id": jornada_id},
        {"_id": 0}
    ).to_list(100)
    
    asistencia_map = {a["jugador_id"]: a["estado"] for a in asistencias}
    
    result = []
    for j in jugadores:
        result.append({
            "jugador_id": j["id"],
            "nombre_jugador": j["nombre_jugador"],
            "estado": asistencia_map.get(j["id"], "sin_marcar")
        })
    
    return {
        "jornada": jornada,
        "jugadores": result
    }

@api_router.post("/jornadas/{jornada_id}/asistencia")
async def registrar_asistencia(jornada_id: str, data: AsistenciaUpdate, admin: dict = Depends(get_current_admin)):
    jornada = await db.jornadas.find_one({"id": jornada_id}, {"_id": 0})
    if not jornada:
        raise HTTPException(status_code=404, detail="Jornada no encontrada")
    
    for registro in data.asistencias:
        await db.asistencias.update_one(
            {"jornada_id": jornada_id, "jugador_id": registro.jugador_id},
            {"$set": {
                "jornada_id": jornada_id,
                "jugador_id": registro.jugador_id,
                "estado": registro.estado,
                "fecha": jornada["fecha"],
                "categoria_id": jornada["categoria_id"]
            }},
            upsert=True
        )
    
    return {"message": "Asistencia registrada"}

@api_router.get("/asistencia/reporte")
async def reporte_asistencia(
    categoria_id: Optional[str] = None,
    jugador_id: Optional[str] = None,
    admin: dict = Depends(get_current_admin)
):
    query = {}
    if categoria_id:
        query["categoria_id"] = categoria_id
    if jugador_id:
        query["jugador_id"] = jugador_id
    
    asistencias = await db.asistencias.find(query, {"_id": 0}).sort("fecha", -1).to_list(1000)
    
    # Calculate stats
    total = len(asistencias)
    presentes = len([a for a in asistencias if a["estado"] == "presente"])
    ausentes = len([a for a in asistencias if a["estado"] == "ausente"])
    excusados = len([a for a in asistencias if a["estado"] == "excusado"])
    
    return {
        "asistencias": asistencias,
        "stats": {
            "total": total,
            "presentes": presentes,
            "ausentes": ausentes,
            "excusados": excusados,
            "porcentaje_asistencia": round((presentes / total * 100) if total > 0 else 0, 1)
        }
    }

# ==================== PAGOS ROUTES ====================

@api_router.get("/pagos")
async def get_pagos(
    mes: Optional[str] = None,
    jugador_id: Optional[str] = None,
    admin: dict = Depends(get_current_admin)
):
    query = {}
    if mes:
        query["mes"] = mes
    if jugador_id:
        query["jugador_id"] = jugador_id
    
    pagos = await db.pagos.find(query, {"_id": 0}).sort("fecha_pago", -1).to_list(1000)
    return pagos

@api_router.post("/pagos")
async def registrar_pago(data: PagoCreate, admin: dict = Depends(get_current_admin)):
    jugador = await db.jugadores.find_one({"id": data.jugador_id}, {"_id": 0})
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    
    # Check if payment for this month already exists
    existing = await db.pagos.find_one({
        "jugador_id": data.jugador_id,
        "mes": data.mes
    })
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un pago registrado para este mes")
    
    pago_data = data.model_dump()
    pago_data["jugador_nombre"] = jugador["nombre_jugador"]
    pago_data["notas"] = data.notas or ""
    
    pago = Pago(**pago_data)
    doc = pago.model_dump()
    await db.pagos.insert_one(doc)
    
    # Update player payment status
    await db.jugadores.update_one(
        {"id": data.jugador_id},
        {"$set": {"estado_pago": "al_dia"}}
    )
    
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.get("/pagos/pendientes")
async def get_pagos_pendientes(admin: dict = Depends(get_current_admin)):
    # Get current month
    current_month = datetime.now().strftime("%Y-%m")
    
    # Get all active players
    jugadores = await db.jugadores.find({"estado": "activo"}, {"_id": 0}).to_list(1000)
    
    pendientes = []
    for j in jugadores:
        pago_mes = await db.pagos.find_one({
            "jugador_id": j["id"],
            "mes": current_month
        })
        if not pago_mes:
            pendientes.append({
                "jugador_id": j["id"],
                "nombre_jugador": j["nombre_jugador"],
                "categoria": j["categoria_nombre"],
                "telefono_tutor": j["telefono_tutor"],
                "mes_pendiente": current_month
            })
    
    return pendientes

@api_router.delete("/pagos/{pago_id}")
async def delete_pago(pago_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.pagos.delete_one({"id": pago_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return {"message": "Pago eliminado"}

# ==================== DASHBOARD ROUTES ====================

@api_router.get("/dashboard")
async def get_dashboard(admin: dict = Depends(get_current_admin)):
    # Total players
    total_jugadores = await db.jugadores.count_documents({"estado": "activo"})
    
    # Players by category with capacity
    categorias = await db.categorias.find({"activa": True}, {"_id": 0}).to_list(100)
    categorias_stats = []
    for cat in categorias:
        count = await db.jugadores.count_documents({"categoria_id": cat["id"], "estado": "activo"})
        categorias_stats.append({
            "id": cat["id"],
            "nombre": cat["nombre"],
            "cupo_actual": count,
            "cupo_maximo": cat["cupo_maximo"],
            "porcentaje": round((count / cat["cupo_maximo"] * 100) if cat["cupo_maximo"] > 0 else 0, 1)
        })
    
    # Pending payments this month
    current_month = datetime.now().strftime("%Y-%m")
    jugadores_activos = await db.jugadores.find({"estado": "activo"}, {"_id": 0, "id": 1}).to_list(1000)
    pagos_mes = await db.pagos.find({"mes": current_month}, {"_id": 0, "jugador_id": 1}).to_list(1000)
    jugadores_con_pago = {p["jugador_id"] for p in pagos_mes}
    pagos_pendientes = len([j for j in jugadores_activos if j["id"] not in jugadores_con_pago])
    
    # Last Saturday attendance
    today = datetime.now()
    days_since_saturday = (today.weekday() + 2) % 7
    last_saturday = (today - __import__('datetime').timedelta(days=days_since_saturday)).strftime("%Y-%m-%d")
    
    asistencia_sabado = await db.asistencias.find({"fecha": last_saturday}, {"_id": 0}).to_list(1000)
    presentes_sabado = len([a for a in asistencia_sabado if a["estado"] == "presente"])
    total_sabado = len(asistencia_sabado)
    
    # Recent enrollments
    ultimos_inscritos = await db.jugadores.find(
        {"estado": "activo"},
        {"_id": 0}
    ).sort("fecha_inscripcion", -1).limit(5).to_list(5)
    
    # Total revenue this month
    pagos_mes_total = await db.pagos.find({"mes": current_month}, {"_id": 0, "monto": 1}).to_list(1000)
    ingresos_mes = sum(p["monto"] for p in pagos_mes_total)
    
    return {
        "total_jugadores": total_jugadores,
        "categorias": categorias_stats,
        "pagos_pendientes": pagos_pendientes,
        "asistencia_ultimo_sabado": {
            "fecha": last_saturday,
            "presentes": presentes_sabado,
            "total": total_sabado,
            "porcentaje": round((presentes_sabado / total_sabado * 100) if total_sabado > 0 else 0, 1)
        },
        "ultimos_inscritos": ultimos_inscritos,
        "ingresos_mes": ingresos_mes,
        "mes_actual": current_month
    }

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    admin_exists = await db.admins.find_one({"email": "dgexp"})
    if admin_exists:
        return {"message": "Data already seeded"}
    
    # Create admin
    admin_doc = {
        "id": str(uuid.uuid4()),
        "email": "dgexp",
        "password_hash": hash_password("123456"),
        "nombre": "Administrador",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admins.insert_one(admin_doc)
    
    # Create categories
    categorias_data = [
        {"nombre": "Sub-10", "edad_min": 8, "edad_max": 10, "cupo_maximo": 30, "horario": "Sábados 8:00 AM - 12:00 PM"},
        {"nombre": "Sub-13", "edad_min": 11, "edad_max": 13, "cupo_maximo": 30, "horario": "Sábados 8:00 AM - 12:00 PM"},
        {"nombre": "Sub-17", "edad_min": 14, "edad_max": 17, "cupo_maximo": 30, "horario": "Sábados 8:00 AM - 12:00 PM"},
    ]
    
    for cat_data in categorias_data:
        cat = Categoria(**cat_data)
        await db.categorias.insert_one(cat.model_dump())
    
    return {"message": "Seed data created successfully"}

# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Auto-seed on startup
    admin_exists = await db.admins.find_one({"email": "dgexp"})
    if not admin_exists:
        await seed_data()
        logger.info("Database seeded with initial data")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
