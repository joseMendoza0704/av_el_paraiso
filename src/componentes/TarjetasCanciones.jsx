import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit, Trash2, Video, ArrowRight } from 'lucide-react'

export default function TarjetasCanciones({
  canciones,
  cargando,
  onEditar,
  onEliminar,
  onIncrementarTocada,
  onVerDetalle,
}) {
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(null)
  const [menuAbiertoId, setMenuAbiertoId] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbiertoId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  function toggleMenu(e, id) {
    e.stopPropagation()
    if (menuAbiertoId === id) {
      setMenuAbiertoId(null)
    } else {
      setMenuAbiertoId(id)
    }
  }

  function manejarEliminar(id) {
    setConfirmandoEliminar(id)
    setMenuAbiertoId(null)
  }

  function confirmarEliminar() {
    if (confirmandoEliminar) {
      onEliminar(confirmandoEliminar)
      setConfirmandoEliminar(null)
    }
  }

  function cancelarEliminar() {
    setConfirmandoEliminar(null)
  }

  if (cargando) {
    return (
      <div className="cargando-contenedor">
        <div className="spinner" />
        <p>Cargando canciones…</p>
      </div>
    )
  }

  if (canciones.length === 0) {
    return (
      <div className="vacio-contenedor">
        <p>No hay canciones registradas.</p>
        <p className="vacio-sub">Crea la primera canción usando el botón "Nueva canción".</p>
      </div>
    )
  }

  return (
    <div>
      <div className="tarjetas-grid">
        {canciones.map((cancion) => (
          <div key={cancion.id} className="tarjeta">
            <div className="tarjeta-header">
              <div className="tarjeta-info">
                <h3 className="tarjeta-titulo">{cancion.titulo}</h3>
                <p className="tarjeta-autor">{cancion.autor || 'Autor Desconocido'}</p>

                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap'}}>
                  {cancion.categoriaLiturgica && (
                    <span className={`tarjeta-categoria tarjeta-categoria--${cancion.categoriaLiturgica.toLowerCase()}`}>
                      {cancion.categoriaLiturgica}
                    </span>
                  )}
                  <div className="tarjeta-contador">
                    <span className="contador-numero">{cancion.vecesTocada || 0}</span>
                    <span className="contador-etiqueta">veces tocada</span>
                    <button
                      type="button"
                      className="btn-contador"
                      onClick={(e) => { e.stopPropagation(); onIncrementarTocada(cancion.id) }}
                      title="Marcar como tocada"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative' }} ref={menuAbiertoId === cancion.id ? menuRef : null}>
                <button
                  className="tarjeta-menu-btn"
                  onClick={(e) => toggleMenu(e, cancion.id)}
                >
                  <MoreVertical size={20} />
                </button>

                {menuAbiertoId === cancion.id && (
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        onEditar(cancion)
                        setMenuAbiertoId(null)
                      }}
                    >
                      <Edit size={16} /> Editar
                    </button>
                    {cancion.enlaceYoutube && (
                      <button
                        className="dropdown-item"
                        onClick={() => window.open(cancion.enlaceYoutube, '_blank')}
                      >
                        <Video size={16} /> YouTube
                      </button>
                    )}
                    <button
                      className="dropdown-item danger"
                      onClick={() => manejarEliminar(cancion.id)}
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="tarjeta-divider" />

            <div className="tarjeta-tags">
              {cancion.tonalidad && (
                <span className="tag tag-tonalidad">{cancion.tonalidad}</span>
              )}
              {cancion.bpm && (
                <span className="tag tag-bpm">{cancion.bpm} BPM</span>
              )}
            </div>

            <div
              className="tarjeta-footer-arrow"
              onClick={() => onVerDetalle && onVerDetalle(cancion)}
            >
              <ArrowRight size={20} />
            </div>
          </div>
        ))}
      </div>

      {confirmandoEliminar && (
        <div className="modal-overlay" onClick={cancelarEliminar}>
          <div className="confirmacion-modal" onClick={(e) => e.stopPropagation()}>
            <p>¿Estás seguro de eliminar esta canción y todos sus archivos?</p>
            <p className="confirmacion-sub">Esta acción no se puede deshacer.</p>
            <div className="confirmacion-acciones">
              <button type="button" className="btn-secundario" onClick={cancelarEliminar}>
                Cancelar
              </button>
              <button type="button" className="btn-peligro" onClick={confirmarEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
