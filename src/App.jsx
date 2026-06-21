import { useState, lazy, Suspense } from 'react'
import { AuthProvider } from './contexto/AuthContext.jsx'
import { useAuth } from './hooks/useAuth.js'
import { useCanciones } from './hooks/useCanciones.js'
import Login from './componentes/Login.jsx'
import TarjetasCanciones from './componentes/TarjetasCanciones.jsx'
import VistaDetalleCancion from './componentes/VistaDetalleCancion.jsx'
import { Music, Calendar, Users, Settings, LogOut, Search, Plus, Menu, X, Filter, ArrowUpDown } from 'lucide-react'
import logoSidebar from './assets/images/logo.jpg'

const ModalCancion = lazy(() => import('./componentes/ModalCancion.jsx'))

function PanelAdmin() {
  const { cerrarSesion, rolUsuario, errorAcceso } = useAuth()
  const { canciones, cargando, error, crear, actualizar, eliminar, incrementarTocada } = useCanciones()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cancionEnEdicion, setCancionEnEdicion] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [cancionDetalle, setCancionDetalle] = useState(null)

  const esAdmin = rolUsuario === 'admin'

  function abrirModalCrear() {
    setCancionEnEdicion(null)
    setModalAbierto(true)
  }

  function abrirModalEditar(cancion) {
    setCancionEnEdicion(cancion)
    setModalAbierto(true)
  }

  function cerrarModal() {
    if (!guardando) {
      setModalAbierto(false)
      setCancionEnEdicion(null)
    }
  }

  async function manejarGuardar(datos, archivosNuevos, archivosAEliminar) {
    setGuardando(true)
    try {
      let resultado
      if (cancionEnEdicion) {
        resultado = await actualizar(cancionEnEdicion.id, datos, archivosNuevos, archivosAEliminar, cancionEnEdicion)
      } else {
        resultado = await crear(datos, archivosNuevos)
      }
      if (resultado.exito) {
        cerrarModal()
      } else {
        alert(resultado.error)
      }
    } finally {
      setGuardando(false)
    }
  }

  async function manejarEliminar(id) {
    const resultado = await eliminar(id)
    if (!resultado.exito) {
      alert(resultado.error)
    }
  }

  // Si viene desde vista de detalle, el editar abre el modal y el eliminar vuelve al listado
  function abrirEditarDesdeDetalle(cancion) {
    abrirModalEditar(cancion)
    setCancionDetalle(null)
  }

  return (
    <div className="app-layout">
      {/* Overlay para móviles */}
      {isSidebarOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 40 }} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
            <img src={logoSidebar} alt="Logo" className="sidebar-avatar" />
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <Music size={20} />
            Canciones
          </button>
          <button className="nav-item">
            <Calendar size={20} />
            Boletín
          </button>
          <button className="nav-item">
            <Users size={20} />
            Miembros
          </button>
          <button className="nav-item">
            <Settings size={20} />
            Ajustes
          </button>
          
          <button className="nav-item nav-item-logout" onClick={cerrarSesion}>
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="app-main">

        {/* Vista Detalle */}
        {cancionDetalle ? (
          <VistaDetalleCancion
            cancion={cancionDetalle}
            onVolver={() => setCancionDetalle(null)}
            onEditar={abrirEditarDesdeDetalle}
            onEliminar={manejarEliminar}
          />
        ) : (
          <>
            <header className="app-header">
              <div className="header-actions">
                <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                  <Menu size={24} />
                </button>
              </div>
              
              <div className="search-bar">
                <Search size={20} />
                <input type="text" placeholder="Buscar canciones, artistas..." />
              </div>
              
              {esAdmin && (
                <button type="button" className="btn-primario" onClick={abrirModalCrear} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'}}>
                  <Plus size={20} />
                  Añadir Nueva Canción
                </button>
              )}
            </header>

            <div className="page-header">
              <div className="page-title">
                <h2>Repositorio de Canciones</h2>
                <p>Explora y gestiona el repertorio musical.</p>
              </div>
              <div className="page-actions">
                <button className="btn-icon">
                  <Filter size={16} />
                  Filtros
                </button>
                <button className="btn-icon">
                  <ArrowUpDown size={16} />
                  Ordenar
                </button>
              </div>
            </div>

            {error && (
              <div className="error-banner">
                {error}
                <button type="button" onClick={() => window.location.reload()}>
                  Reintentar
                </button>
              </div>
            )}

            <TarjetasCanciones
              canciones={canciones}
              cargando={cargando}
              onEditar={abrirModalEditar}
              onEliminar={manejarEliminar}
              onIncrementarTocada={incrementarTocada}
              onVerDetalle={setCancionDetalle}
            />
          </>
        )}
      </main>

      {modalAbierto && (
        <Suspense
          fallback={
            <div className="modal-overlay">
              <div className="modal-contenido">
                <p>Cargando formulario…</p>
              </div>
            </div>
          }
        >
          <ModalCancion
            cancionExistente={cancionEnEdicion}
            onGuardar={manejarGuardar}
            onCerrar={cerrarModal}
            guardando={guardando}
          />
        </Suspense>
      )}
    </div>
  )
}

function PantallaCargando() {
  return (
    <div className="login-contenedor">
      <div className="spinner" />
      <p>Cargando…</p>
    </div>
  )
}

function App() {
  const { usuario, cargando } = useAuth()

  if (cargando) return <PantallaCargando />

  return usuario ? <PanelAdmin /> : <Login />
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
