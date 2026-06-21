import { useState, lazy, Suspense } from 'react'
import { AuthProvider } from './contexto/AuthContext.jsx'
import { useAuth } from './hooks/useAuth.js'
import { useCanciones } from './hooks/useCanciones.js'
import Login from './componentes/Login.jsx'
import TarjetasCanciones from './componentes/TarjetasCanciones.jsx'

const ModalCancion = lazy(() => import('./componentes/ModalCancion.jsx'))

function PanelAdmin() {
  const { cerrarSesion } = useAuth()
  const { canciones, cargando, error, crear, actualizar, eliminar, incrementarTocada } = useCanciones()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cancionEnEdicion, setCancionEnEdicion] = useState(null)
  const [guardando, setGuardando] = useState(false)

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

  return (
    <div className="panel">
      <header className="panel-header">
        <div>
          <h1>Banco Musical</h1>
          <p className="panel-subtitulo">Av El Paraíso</p>
        </div>
        <div className="panel-acciones">
          <button
            type="button"
            className="btn-primario"
            onClick={abrirModalCrear}
          >
            + Nueva canción
          </button>
          <button
            type="button"
            className="btn-secundario"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="panel-contenido">
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
        />
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
