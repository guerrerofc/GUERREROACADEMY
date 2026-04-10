import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { 
  Users, Calendar, DollarSign, ClipboardCheck, LayoutDashboard, 
  LogOut, Menu, X, ChevronRight, Phone, MapPin, Clock, 
  UserPlus, TrendingUp, AlertCircle, Check, Search, Filter,
  Edit, Trash2, Eye, Plus, ArrowLeft, Save
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.get(`${API}/auth/me`)
        .then(res => setAdmin(res.data))
        .catch(() => { localStorage.removeItem("token"); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
    setToken(res.data.token);
    setAdmin(res.data.admin);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500"
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg animate-slideInRight flex items-center gap-2`}>
      {type === "success" && <Check size={20} />}
      {type === "error" && <AlertCircle size={20} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={18} />
      </button>
    </div>
  );
};

// ==================== LANDING PAGE ====================

const LandingPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre_jugador: "",
    fecha_nacimiento: "",
    nombre_tutor: "",
    telefono_tutor: "",
    email_tutor: "",
    observaciones: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API}/categorias/publicas`)
      .then(res => setCategorias(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      const res = await axios.post(`${API}/inscripcion`, formData);
      setResult(res.data);
      setFormData({
        nombre_jugador: "",
        fecha_nacimiento: "",
        nombre_tutor: "",
        telefono_tutor: "",
        email_tutor: "",
        observaciones: ""
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Error al procesar la inscripción");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappNumber = "8296396001";
  const whatsappMessage = encodeURIComponent("Hola, estoy interesado en inscribir a mi hijo en Guerrero Academy");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80')"
          }}
        />
        <div className="absolute inset-0 hero-overlay" />
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto stagger-children">
            <p className="text-highlight font-heading text-lg tracking-widest uppercase mb-4">
              Academia de Fútbol
            </p>
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white uppercase tracking-tight mb-6">
              Guerrero<br />Academy
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto font-light">
              Formando a los futuros campeones de República Dominicana con disciplina, pasión y entrenamiento de élite.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setShowForm(true)}
                data-testid="inscribir-btn"
                className="btn-accent px-10 py-4 rounded-md text-lg"
              >
                Inscribir Ahora
              </button>
              <a 
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="whatsapp-hero-btn"
                className="whatsapp-btn px-10 py-4 rounded-md text-lg font-heading uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Phone size={20} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight size={32} className="text-white rotate-90" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 md:py-32 bg-secondary" id="categorias">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-accent font-heading text-sm tracking-widest uppercase mb-2">
              Nuestras Categorías
            </p>
            <h2 className="font-heading text-4xl md:text-5xl text-primary uppercase">
              Encuentra tu Categoría
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {categorias.map((cat, idx) => (
              <div 
                key={cat.id}
                data-testid={`categoria-card-${idx}`}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-center">
                  <span className="inline-block bg-primary text-white font-heading text-3xl px-6 py-3 rounded-lg mb-4">
                    {cat.nombre}
                  </span>
                  <p className="text-muted text-lg mb-4">
                    {cat.edad_min} - {cat.edad_max} años
                  </p>
                  <div className="flex items-center justify-center gap-2 text-muted mb-4">
                    <Clock size={18} />
                    <span>{cat.horario}</span>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-sm text-muted uppercase tracking-wide mb-1">Cupos Disponibles</p>
                    <p className={`font-heading text-3xl ${cat.cupos_disponibles > 5 ? 'text-accent' : cat.cupos_disponibles > 0 ? 'text-highlight' : 'text-destructive'}`}>
                      {cat.cupos_disponibles} / {cat.cupo_maximo}
                    </p>
                    {cat.cupos_disponibles <= 5 && cat.cupos_disponibles > 0 && (
                      <p className="text-highlight text-sm mt-1 animate-pulse-slow">¡Últimos cupos!</p>
                    )}
                    {cat.cupos_disponibles === 0 && (
                      <p className="text-destructive text-sm mt-1">Categoría llena</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <p className="text-accent font-heading text-sm tracking-widest uppercase mb-2">
                Por qué elegirnos
              </p>
              <h2 className="font-heading text-4xl md:text-5xl text-primary uppercase mb-6">
                Más que una Academia
              </h2>
              <p className="text-muted text-lg leading-relaxed mb-8">
                En Guerrero Academy no solo enseñamos fútbol. Formamos jóvenes con valores, disciplina y pasión por el deporte. Nuestro enfoque integral desarrolla habilidades técnicas mientras construimos el carácter de los futuros campeones.
              </p>
              
              <div className="space-y-4">
                {[
                  "Entrenadores certificados y con experiencia",
                  "Metodología profesional adaptada por edad",
                  "Grupos reducidos para atención personalizada",
                  "Instalaciones de primer nivel"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </span>
                    <span className="text-primary">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80"
                alt="Entrenamiento"
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-xl shadow-xl">
                <p className="font-heading text-4xl text-highlight">RD$ 3,500</p>
                <p className="text-sm text-gray-300 uppercase tracking-wide">Mensualidad</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-highlight font-heading text-sm tracking-widest uppercase mb-2">
              Ubicación
            </p>
            <h2 className="font-heading text-4xl md:text-5xl uppercase mb-8">
              Dónde Encontrarnos
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <MapPin size={40} className="mx-auto mb-4 text-highlight" />
                <h3 className="font-heading text-xl uppercase mb-2">Dirección</h3>
                <p className="text-gray-300">Colegio Loyola<br />Santo Domingo, RD</p>
              </div>
              <div className="p-6">
                <Clock size={40} className="mx-auto mb-4 text-highlight" />
                <h3 className="font-heading text-xl uppercase mb-2">Horario</h3>
                <p className="text-gray-300">Sábados<br />8:00 AM - 12:00 PM</p>
              </div>
              <div className="p-6">
                <Phone size={40} className="mx-auto mb-4 text-highlight" />
                <h3 className="font-heading text-xl uppercase mb-2">Contacto</h3>
                <p className="text-gray-300">829-639-6001</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl md:text-5xl text-primary uppercase mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="text-muted text-lg mb-8 max-w-xl mx-auto">
            Inscribe a tu hijo hoy y dale la oportunidad de convertirse en un verdadero guerrero del fútbol.
          </p>
          <button 
            onClick={() => setShowForm(true)}
            data-testid="inscribir-cta-btn"
            className="btn-accent px-12 py-5 rounded-md text-xl"
          >
            Inscribir Ahora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-heading text-2xl uppercase">Guerrero Academy</p>
            <p className="text-gray-400 text-sm">© 2026 Todos los derechos reservados</p>
            <Link to="/admin" className="text-gray-400 hover:text-white transition-colors text-sm">
              Acceso Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="whatsapp-float-btn"
        className="fixed bottom-6 right-6 z-40 whatsapp-btn w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
      >
        <Phone size={28} />
      </a>

      {/* Inscription Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h3 className="font-heading text-2xl uppercase text-primary">Formulario de Inscripción</h3>
                <p className="text-muted text-sm">Complete los datos del jugador</p>
              </div>
              <button onClick={() => { setShowForm(false); setResult(null); setError(""); }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {result ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-white" />
                </div>
                <h4 className="font-heading text-3xl text-primary uppercase mb-4">¡Inscripción Exitosa!</h4>
                <p className="text-muted mb-6">
                  <strong>{result.jugador.nombre}</strong> ha sido inscrito en la categoría <strong>{result.categoria.nombre}</strong>
                </p>
                <p className="text-sm text-muted mb-8">
                  Horario: {result.categoria.horario}
                </p>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola, acabo de inscribir a ${result.jugador.nombre} en Guerrero Academy`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn w-full py-4 rounded-md font-heading uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Phone size={20} />
                    Contactar por WhatsApp
                  </a>
                  <button
                    onClick={() => { setShowForm(false); setResult(null); }}
                    className="w-full py-4 rounded-md border-2 border-primary text-primary font-heading uppercase tracking-wider hover:bg-primary hover:text-white transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5" data-testid="inscription-form">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Nombre completo del niño/a *
                  </label>
                  <input
                    type="text"
                    required
                    data-testid="input-nombre-jugador"
                    value={formData.nombre_jugador}
                    onChange={(e) => setFormData({...formData, nombre_jugador: e.target.value})}
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Fecha de nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    data-testid="input-fecha-nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white"
                  />
                  <p className="text-xs text-muted mt-1">Edad permitida: 8 - 17 años</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Nombre del padre/madre/tutor *
                  </label>
                  <input
                    type="text"
                    required
                    data-testid="input-nombre-tutor"
                    value={formData.nombre_tutor}
                    onChange={(e) => setFormData({...formData, nombre_tutor: e.target.value})}
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white"
                    placeholder="Ej: María García"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Teléfono de contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    data-testid="input-telefono"
                    value={formData.telefono_tutor}
                    onChange={(e) => setFormData({...formData, telefono_tutor: e.target.value})}
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white"
                    placeholder="Ej: 809-555-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Correo electrónico (opcional)
                  </label>
                  <input
                    type="email"
                    data-testid="input-email"
                    value={formData.email_tutor}
                    onChange={(e) => setFormData({...formData, email_tutor: e.target.value})}
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white"
                    placeholder="Ej: ejemplo@correo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    data-testid="input-observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white resize-none"
                    rows={3}
                    placeholder="Alergias, condiciones médicas, etc."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="submit-inscription-btn"
                  className="w-full btn-accent py-4 rounded-md text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="spinner" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      Completar Inscripción
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== ADMIN LOGIN ====================

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl text-primary uppercase">Guerrero Academy</h1>
          <p className="text-muted mt-2">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Usuario</label>
            <input
              type="text"
              required
              data-testid="input-login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white"
              placeholder="Ingrese su usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Contraseña</label>
            <input
              type="password"
              required
              data-testid="input-login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white"
              placeholder="Ingrese su contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit-btn"
            className="w-full btn-primary py-4 rounded-md text-lg disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-muted hover:text-primary text-sm">
            ← Volver al sitio público
          </Link>
        </div>
      </div>
    </div>
  );
};

// ==================== ADMIN LAYOUT ====================

const AdminLayout = ({ children }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/jugadores", icon: Users, label: "Jugadores" },
    { path: "/admin/categorias", icon: Calendar, label: "Categorías" },
    { path: "/admin/asistencia", icon: ClipboardCheck, label: "Asistencia" },
    { path: "/admin/pagos", icon: DollarSign, label: "Pagos" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-primary text-white p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="font-heading text-xl uppercase">Guerrero Academy</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} data-testid="mobile-menu-btn">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-primary text-white
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-transform duration-300 ease-in-out
        `}>
          <div className="p-6 border-b border-white/10 hidden lg:block">
            <h1 className="font-heading text-2xl uppercase">Guerrero Academy</h1>
            <p className="text-gray-400 text-sm mt-1">Panel Admin</p>
          </div>

          <nav className="p-4 space-y-1 mt-16 lg:mt-0">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${location.pathname === item.path 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4 px-4">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <span className="font-heading text-white">{admin?.nombre?.[0] || 'A'}</span>
              </div>
              <div>
                <p className="font-medium text-white">{admin?.nombre}</p>
                <p className="text-xs text-gray-400">{admin?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              data-testid="logout-btn"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

// ==================== DASHBOARD ====================

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/dashboard`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <div>
        <h1 className="font-heading text-3xl text-primary uppercase">Dashboard</h1>
        <p className="text-muted">Resumen general de la academia</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" data-testid="stat-total-jugadores">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Users className="text-accent" size={24} />
            </div>
            <TrendingUp className="text-accent" size={20} />
          </div>
          <p className="text-3xl font-heading text-primary">{data?.total_jugadores || 0}</p>
          <p className="text-sm text-muted">Jugadores Activos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" data-testid="stat-pagos-pendientes">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-highlight/10 rounded-lg flex items-center justify-center">
              <DollarSign className="text-highlight" size={24} />
            </div>
            {data?.pagos_pendientes > 0 && <AlertCircle className="text-highlight" size={20} />}
          </div>
          <p className="text-3xl font-heading text-primary">{data?.pagos_pendientes || 0}</p>
          <p className="text-sm text-muted">Pagos Pendientes</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" data-testid="stat-ingresos">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-heading text-primary">RD$ {(data?.ingresos_mes || 0).toLocaleString()}</p>
          <p className="text-sm text-muted">Ingresos del Mes</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" data-testid="stat-asistencia">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-heading text-primary">{data?.asistencia_ultimo_sabado?.porcentaje || 0}%</p>
          <p className="text-sm text-muted">Asistencia Último Sábado</p>
        </div>
      </div>

      {/* Categories and Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Categories Capacity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-heading text-xl text-primary uppercase mb-4">Cupos por Categoría</h3>
          <div className="space-y-4">
            {data?.categorias?.map((cat) => (
              <div key={cat.id} data-testid={`categoria-progress-${cat.nombre}`}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{cat.nombre}</span>
                  <span className="text-muted">{cat.cupo_actual} / {cat.cupo_maximo}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      cat.porcentaje >= 90 ? 'bg-destructive' : 
                      cat.porcentaje >= 70 ? 'bg-highlight' : 'bg-accent'
                    }`}
                    style={{ width: `${cat.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-heading text-xl text-primary uppercase mb-4">Últimos Inscritos</h3>
          <div className="space-y-3">
            {data?.ultimos_inscritos?.length === 0 ? (
              <p className="text-muted text-center py-4">No hay inscripciones recientes</p>
            ) : (
              data?.ultimos_inscritos?.map((jugador) => (
                <div key={jugador.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{jugador.nombre_jugador}</p>
                    <p className="text-sm text-muted">{jugador.categoria_nombre}</p>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(jugador.fecha_inscripcion).toLocaleDateString('es-DO')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== JUGADORES ====================

const JugadoresPage = () => {
  const [jugadores, setJugadores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingJugador, setEditingJugador] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchJugadores = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("busqueda", search);
      if (filterCategoria) params.append("categoria_id", filterCategoria);
      if (filterEstado) params.append("estado", filterEstado);
      
      const res = await axios.get(`${API}/jugadores?${params}`);
      setJugadores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/jugadores`),
      axios.get(`${API}/categorias`)
    ]).then(([jugRes, catRes]) => {
      setJugadores(jugRes.data);
      setCategorias(catRes.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchJugadores, 300);
    return () => clearTimeout(timer);
  }, [search, filterCategoria, filterEstado]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este jugador?")) return;
    try {
      await axios.delete(`${API}/jugadores/${id}`);
      setJugadores(jugadores.filter(j => j.id !== id));
      setToast({ message: "Jugador eliminado", type: "success" });
    } catch (err) {
      setToast({ message: "Error al eliminar", type: "error" });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6" data-testid="jugadores-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl text-primary uppercase">Jugadores</h1>
          <p className="text-muted">{jugadores.length} jugadores registrados</p>
        </div>
        <button
          onClick={() => { setEditingJugador(null); setShowModal(true); }}
          data-testid="add-jugador-btn"
          className="btn-accent px-6 py-3 rounded-md flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Jugador
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar jugador, tutor o teléfono..."
            data-testid="search-jugadores"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg"
          />
        </div>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          data-testid="filter-categoria"
          className="h-11 px-4 border border-gray-200 rounded-lg bg-white"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          data-testid="filter-estado"
          className="h-11 px-4 border border-gray-200 rounded-lg bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4">Jugador</th>
                <th className="text-left p-4">Categoría</th>
                <th className="text-left p-4">Tutor</th>
                <th className="text-left p-4">Teléfono</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-left p-4">Pago</th>
                <th className="text-right p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {jugadores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No se encontraron jugadores
                  </td>
                </tr>
              ) : (
                jugadores.map((j) => (
                  <tr key={j.id} className="border-t border-gray-100 hover:bg-gray-50" data-testid={`jugador-row-${j.id}`}>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{j.nombre_jugador}</p>
                        <p className="text-sm text-muted">{j.edad} años</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="badge-info px-3 py-1 rounded-full text-sm">{j.categoria_nombre}</span>
                    </td>
                    <td className="p-4">{j.nombre_tutor}</td>
                    <td className="p-4">{j.telefono_tutor}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${j.estado === 'activo' ? 'badge-success' : 'badge-danger'}`}>
                        {j.estado}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${j.estado_pago === 'al_dia' ? 'badge-success' : 'badge-warning'}`}>
                        {j.estado_pago === 'al_dia' ? 'Al día' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingJugador(j); setShowModal(true); }}
                          data-testid={`edit-jugador-${j.id}`}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(j.id)}
                          data-testid={`delete-jugador-${j.id}`}
                          className="p-2 text-gray-500 hover:text-destructive hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <JugadorModal
          jugador={editingJugador}
          categorias={categorias}
          onClose={() => setShowModal(false)}
          onSave={(updated) => {
            if (editingJugador) {
              setJugadores(jugadores.map(j => j.id === updated.id ? updated : j));
            } else {
              setJugadores([updated, ...jugadores]);
            }
            setShowModal(false);
            setToast({ message: editingJugador ? "Jugador actualizado" : "Jugador creado", type: "success" });
          }}
        />
      )}
    </div>
  );
};

const JugadorModal = ({ jugador, categorias, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre_jugador: jugador?.nombre_jugador || "",
    fecha_nacimiento: jugador?.fecha_nacimiento || "",
    categoria_id: jugador?.categoria_id || categorias[0]?.id || "",
    nombre_tutor: jugador?.nombre_tutor || "",
    telefono_tutor: jugador?.telefono_tutor || "",
    email_tutor: jugador?.email_tutor || "",
    observaciones: jugador?.observaciones || "",
    estado: jugador?.estado || "activo"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (jugador) {
        await axios.put(`${API}/jugadores/${jugador.id}`, formData);
        const res = await axios.get(`${API}/jugadores/${jugador.id}`);
        onSave(res.data);
      } else {
        const res = await axios.post(`${API}/jugadores`, formData);
        onSave(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="font-heading text-xl uppercase text-primary">
            {jugador ? "Editar Jugador" : "Nuevo Jugador"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-testid="jugador-form">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Nombre del jugador *</label>
            <input
              type="text"
              required
              value={formData.nombre_jugador}
              onChange={(e) => setFormData({...formData, nombre_jugador: e.target.value})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Fecha de nacimiento *</label>
            <input
              type="date"
              required
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Categoría *</label>
            <select
              required
              value={formData.categoria_id}
              onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            >
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Nombre del tutor *</label>
            <input
              type="text"
              required
              value={formData.nombre_tutor}
              onChange={(e) => setFormData({...formData, nombre_tutor: e.target.value})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Teléfono *</label>
            <input
              type="tel"
              required
              value={formData.telefono_tutor}
              onChange={(e) => setFormData({...formData, telefono_tutor: e.target.value})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email (opcional)</label>
            <input
              type="email"
              value={formData.email_tutor}
              onChange={(e) => setFormData({...formData, email_tutor: e.target.value})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            />
          </div>

          {jugador && (
            <div>
              <label className="block text-sm font-semibold mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full h-11 px-4 border border-gray-200 rounded-lg"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-accent py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== CATEGORIAS ====================

const CategoriasPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    axios.get(`${API}/categorias`)
      .then(res => setCategorias(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta categoría?")) return;
    try {
      await axios.delete(`${API}/categorias/${id}`);
      setCategorias(categorias.filter(c => c.id !== id));
      setToast({ message: "Categoría eliminada", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.detail || "Error al eliminar", type: "error" });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6" data-testid="categorias-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading text-3xl text-primary uppercase">Categorías</h1>
          <p className="text-muted">Gestión de categorías y cupos</p>
        </div>
        <button
          onClick={() => { setEditingCategoria(null); setShowModal(true); }}
          data-testid="add-categoria-btn"
          className="btn-accent px-6 py-3 rounded-md flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map((cat) => (
          <div key={cat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-premium" data-testid={`categoria-card-admin-${cat.id}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-heading text-2xl text-primary">{cat.nombre}</h3>
                <p className="text-muted">{cat.edad_min} - {cat.edad_max} años</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${cat.activa ? 'badge-success' : 'badge-danger'}`}>
                {cat.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Cupos</span>
                <span className="font-medium">{cat.cupo_actual} / {cat.cupo_maximo}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    (cat.cupo_actual / cat.cupo_maximo) >= 0.9 ? 'bg-destructive' : 
                    (cat.cupo_actual / cat.cupo_maximo) >= 0.7 ? 'bg-highlight' : 'bg-accent'
                  }`}
                  style={{ width: `${(cat.cupo_actual / cat.cupo_maximo) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-muted flex items-center gap-2 mb-4">
              <Clock size={16} />
              {cat.horario}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => { setEditingCategoria(cat); setShowModal(true); }}
                data-testid={`edit-categoria-${cat.id}`}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                data-testid={`delete-categoria-${cat.id}`}
                className="py-2 px-4 border border-gray-200 rounded-lg text-destructive hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <CategoriaModal
          categoria={editingCategoria}
          onClose={() => setShowModal(false)}
          onSave={(saved) => {
            if (editingCategoria) {
              setCategorias(categorias.map(c => c.id === saved.id ? saved : c));
            } else {
              setCategorias([...categorias, saved]);
            }
            setShowModal(false);
            setToast({ message: editingCategoria ? "Categoría actualizada" : "Categoría creada", type: "success" });
          }}
        />
      )}
    </div>
  );
};

const CategoriaModal = ({ categoria, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: categoria?.nombre || "",
    edad_min: categoria?.edad_min || 8,
    edad_max: categoria?.edad_max || 10,
    cupo_maximo: categoria?.cupo_maximo || 30,
    horario: categoria?.horario || "Sábados 8:00 AM - 12:00 PM"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (categoria) {
        await axios.put(`${API}/categorias/${categoria.id}`, formData);
        onSave({ ...categoria, ...formData });
      } else {
        const res = await axios.post(`${API}/categorias`, formData);
        onSave(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-heading text-xl uppercase text-primary">
            {categoria ? "Editar Categoría" : "Nueva Categoría"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-testid="categoria-form">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Nombre *</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
              placeholder="Ej: Sub-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Edad mínima *</label>
              <input
                type="number"
                required
                min={4}
                max={20}
                value={formData.edad_min}
                onChange={(e) => setFormData({...formData, edad_min: parseInt(e.target.value)})}
                className="w-full h-11 px-4 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Edad máxima *</label>
              <input
                type="number"
                required
                min={4}
                max={20}
                value={formData.edad_max}
                onChange={(e) => setFormData({...formData, edad_max: parseInt(e.target.value)})}
                className="w-full h-11 px-4 border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Cupo máximo *</label>
            <input
              type="number"
              required
              min={1}
              value={formData.cupo_maximo}
              onChange={(e) => setFormData({...formData, cupo_maximo: parseInt(e.target.value)})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Horario</label>
            <input
              type="text"
              value={formData.horario}
              onChange={(e) => setFormData({...formData, horario: e.target.value})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
              placeholder="Ej: Sábados 8:00 AM - 12:00 PM"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 rounded-lg font-medium hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-accent py-3 rounded-lg disabled:opacity-50">
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== ASISTENCIA ====================

const AsistenciaPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [jornadas, setJornadas] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedJornada, setSelectedJornada] = useState(null);
  const [asistenciaData, setAsistenciaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [newJornadaDate, setNewJornadaDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    axios.get(`${API}/categorias`)
      .then(res => {
        setCategorias(res.data);
        if (res.data.length > 0) {
          setSelectedCategoria(res.data[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCategoria) {
      axios.get(`${API}/jornadas?categoria_id=${selectedCategoria}`)
        .then(res => setJornadas(res.data));
    }
  }, [selectedCategoria]);

  const loadAsistencia = async (jornadaId) => {
    const res = await axios.get(`${API}/jornadas/${jornadaId}/asistencia`);
    setAsistenciaData(res.data);
    setSelectedJornada(jornadaId);
  };

  const createJornada = async () => {
    try {
      const res = await axios.post(`${API}/jornadas`, {
        fecha: newJornadaDate,
        categoria_id: selectedCategoria
      });
      setJornadas([res.data, ...jornadas]);
      loadAsistencia(res.data.id);
      setToast({ message: "Jornada creada", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.detail || "Error al crear jornada", type: "error" });
    }
  };

  const updateAsistencia = async (jugadorId, estado) => {
    const newJugadores = asistenciaData.jugadores.map(j => 
      j.jugador_id === jugadorId ? { ...j, estado } : j
    );
    setAsistenciaData({ ...asistenciaData, jugadores: newJugadores });
  };

  const saveAsistencia = async () => {
    try {
      await axios.post(`${API}/jornadas/${selectedJornada}/asistencia`, {
        jornada_id: selectedJornada,
        asistencias: asistenciaData.jugadores.map(j => ({
          jugador_id: j.jugador_id,
          estado: j.estado
        }))
      });
      setToast({ message: "Asistencia guardada", type: "success" });
    } catch (err) {
      setToast({ message: "Error al guardar", type: "error" });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6" data-testid="asistencia-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="font-heading text-3xl text-primary uppercase">Asistencia</h1>
        <p className="text-muted">Registro de asistencia por jornada</p>
      </div>

      {/* Category and Date Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Categoría</label>
            <select
              value={selectedCategoria}
              onChange={(e) => { setSelectedCategoria(e.target.value); setSelectedJornada(null); setAsistenciaData(null); }}
              data-testid="select-categoria-asistencia"
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            >
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Jornada</label>
            <select
              value={selectedJornada || ""}
              onChange={(e) => e.target.value && loadAsistencia(e.target.value)}
              data-testid="select-jornada"
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            >
              <option value="">Seleccionar jornada</option>
              {jornadas.map(j => (
                <option key={j.id} value={j.id}>{new Date(j.fecha).toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Nueva Jornada</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={newJornadaDate}
                onChange={(e) => setNewJornadaDate(e.target.value)}
                className="flex-1 h-11 px-4 border border-gray-200 rounded-lg"
              />
              <button
                onClick={createJornada}
                data-testid="create-jornada-btn"
                className="btn-accent px-4 rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      {asistenciaData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-heading text-lg text-primary uppercase">{asistenciaData.jornada.categoria_nombre}</h3>
              <p className="text-sm text-muted">{new Date(asistenciaData.jornada.fecha).toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button
              onClick={saveAsistencia}
              data-testid="save-asistencia-btn"
              className="btn-accent px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Save size={18} />
              Guardar
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {asistenciaData.jugadores.length === 0 ? (
              <p className="p-8 text-center text-muted">No hay jugadores en esta categoría</p>
            ) : (
              asistenciaData.jugadores.map((j) => (
                <div key={j.jugador_id} className="p-4 flex items-center justify-between" data-testid={`asistencia-row-${j.jugador_id}`}>
                  <span className="font-medium">{j.nombre_jugador}</span>
                  <div className="flex gap-2">
                    {['presente', 'ausente', 'excusado'].map((estado) => (
                      <button
                        key={estado}
                        onClick={() => updateAsistencia(j.jugador_id, estado)}
                        data-testid={`asistencia-${j.jugador_id}-${estado}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          j.estado === estado
                            ? estado === 'presente' ? 'bg-accent text-white' :
                              estado === 'ausente' ? 'bg-destructive text-white' : 'bg-highlight text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {estado.charAt(0).toUpperCase() + estado.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== PAGOS ====================

const PagosPage = () => {
  const [pagos, setPagos] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('pendientes');

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/pagos?mes=${selectedMonth}`),
      axios.get(`${API}/pagos/pendientes`),
      axios.get(`${API}/jugadores`)
    ]).then(([pagosRes, pendRes, jugRes]) => {
      setPagos(pagosRes.data);
      setPendientes(pendRes.data);
      setJugadores(jugRes.data);
    }).finally(() => setLoading(false));
  }, [selectedMonth]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este pago?")) return;
    try {
      await axios.delete(`${API}/pagos/${id}`);
      setPagos(pagos.filter(p => p.id !== id));
      setToast({ message: "Pago eliminado", type: "success" });
    } catch (err) {
      setToast({ message: "Error al eliminar", type: "error" });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6" data-testid="pagos-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl text-primary uppercase">Pagos</h1>
          <p className="text-muted">Control de mensualidades</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          data-testid="registrar-pago-btn"
          className="btn-accent px-6 py-3 rounded-md flex items-center gap-2"
        >
          <Plus size={20} />
          Registrar Pago
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-muted mb-1">Pagos del Mes</p>
          <p className="text-2xl font-heading text-primary">{pagos.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-muted mb-1">Pendientes</p>
          <p className="text-2xl font-heading text-highlight">{pendientes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-muted mb-1">Total Recaudado</p>
          <p className="text-2xl font-heading text-accent">RD$ {pagos.reduce((sum, p) => sum + p.monto, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-muted mb-1">Mensualidad</p>
          <p className="text-2xl font-heading text-primary">RD$ 3,500</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('pendientes')}
            data-testid="tab-pendientes"
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'pendientes' ? 'bg-highlight/10 text-highlight border-b-2 border-highlight' : 'text-muted hover:bg-gray-50'}`}
          >
            Pendientes ({pendientes.length})
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            data-testid="tab-historial"
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'historial' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-muted hover:bg-gray-50'}`}
          >
            Historial
          </button>
        </div>

        {activeTab === 'pendientes' ? (
          <div className="divide-y divide-gray-100">
            {pendientes.length === 0 ? (
              <p className="p-8 text-center text-muted">¡Todos los pagos al día!</p>
            ) : (
              pendientes.map((p) => (
                <div key={p.jugador_id} className="p-4 flex items-center justify-between" data-testid={`pendiente-row-${p.jugador_id}`}>
                  <div>
                    <p className="font-medium">{p.nombre_jugador}</p>
                    <p className="text-sm text-muted">{p.categoria} • {p.telefono_tutor}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="badge-warning px-3 py-1 rounded-full text-sm">Pendiente</span>
                    <a
                      href={`https://wa.me/1${p.telefono_tutor.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, le recordamos que tiene pendiente el pago de la mensualidad de ${p.nombre_jugador} en Guerrero Academy`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <Phone size={18} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            <div className="p-4 border-b border-gray-100">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                data-testid="filter-mes"
                className="h-10 px-4 border border-gray-200 rounded-lg"
              />
            </div>
            <div className="divide-y divide-gray-100">
              {pagos.length === 0 ? (
                <p className="p-8 text-center text-muted">No hay pagos registrados este mes</p>
              ) : (
                pagos.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between" data-testid={`pago-row-${p.id}`}>
                    <div>
                      <p className="font-medium">{p.jugador_nombre}</p>
                      <p className="text-sm text-muted">{new Date(p.fecha_pago).toLocaleDateString('es-DO')} • {p.metodo}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-heading text-lg text-accent">RD$ {p.monto.toLocaleString()}</span>
                      <button
                        onClick={() => handleDelete(p.id)}
                        data-testid={`delete-pago-${p.id}`}
                        className="p-2 text-gray-400 hover:text-destructive hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <PagoModal
          jugadores={jugadores}
          onClose={() => setShowModal(false)}
          onSave={(pago) => {
            setPagos([pago, ...pagos]);
            setPendientes(pendientes.filter(p => p.jugador_id !== pago.jugador_id));
            setShowModal(false);
            setToast({ message: "Pago registrado", type: "success" });
          }}
        />
      )}
    </div>
  );
};

const PagoModal = ({ jugadores, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    jugador_id: "",
    monto: 3500,
    mes: new Date().toISOString().slice(0, 7),
    metodo: "efectivo",
    notas: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post(`${API}/pagos`, formData);
      onSave(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al registrar pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-heading text-xl uppercase text-primary">Registrar Pago</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-testid="pago-form">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Jugador *</label>
            <select
              required
              value={formData.jugador_id}
              onChange={(e) => setFormData({...formData, jugador_id: e.target.value})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            >
              <option value="">Seleccionar jugador</option>
              {jugadores.filter(j => j.estado === 'activo').map(j => (
                <option key={j.id} value={j.id}>{j.nombre_jugador} - {j.categoria_nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Mes *</label>
            <input
              type="month"
              required
              value={formData.mes}
              onChange={(e) => setFormData({...formData, mes: e.target.value})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Monto (RD$) *</label>
            <input
              type="number"
              required
              min={0}
              value={formData.monto}
              onChange={(e) => setFormData({...formData, monto: parseFloat(e.target.value)})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Método de pago</label>
            <select
              value={formData.metodo}
              onChange={(e) => setFormData({...formData, metodo: e.target.value})}
              className="w-full h-11 px-4 border border-gray-200 rounded-lg"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Notas</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({...formData, notas: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 rounded-lg font-medium hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-accent py-3 rounded-lg disabled:opacity-50">
              {loading ? "Registrando..." : "Registrar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== PROTECTED ROUTE ====================

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

// ==================== MAIN APP ====================

// Redirect to the optimized HTML landing page
const LandingRedirect = () => {
  useEffect(() => {
    window.location.href = '/guerrero_uploaded/landing-optimizado.html';
  }, []);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingRedirect />} />
          <Route path="/admin" element={<LoginPage />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin/jugadores" element={<ProtectedRoute><JugadoresPage /></ProtectedRoute>} />
          <Route path="/admin/categorias" element={<ProtectedRoute><CategoriasPage /></ProtectedRoute>} />
          <Route path="/admin/asistencia" element={<ProtectedRoute><AsistenciaPage /></ProtectedRoute>} />
          <Route path="/admin/pagos" element={<ProtectedRoute><PagosPage /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
