import { useState } from 'react'
import { CATEGORIAS } from '../utils/constantes.js'

export default function TarjetasCanciones({
  canciones,
  cargando,
  onEditar,
  onEliminar,
  onIncrementarTocada,
}) {
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(null)

  const cancionesFiltradas = filtroCategoria
    ? canciones.filter((c) => c.categoriaLiturgica === filtroCategoria)
    : canciones

  function manejarEliminar(id) {
    setConfirmandoEliminar(id)
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
      <div className="filtros">
        <label htmlFor="filtro-categoria">Filtrar por categoría:</label>
        <select
          id="filtro-categoria"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas</option>
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {cancionesFiltradas.length === 0 ? (
        <div className="vacio-contenedor">
          <p>No hay canciones en la categoría "{filtroCategoria}".</p>
        </div>
      ) : (
        <div className="tarjetas-grid">
          {cancionesFiltradas.map((cancion) => (
            <div key={cancion.id} className="tarjeta">
              <div className="tarjeta-header">
                <h3 className="tarjeta-titulo">{cancion.titulo}</h3>
                <span className={`tarjeta-categoria tarjeta-categoria--${cancion.categoriaLiturgica?.toLowerCase()}`}>
                  {cancion.categoriaLiturgica}
                </span>
              </div>
              <p className="tarjeta-autor">{cancion.autor}</p>

              <div className="tarjeta-contador">
                <span className="contador-numero">{cancion.vecesTocada}</span>
                <span className="contador-etiqueta">
                  {cancion.vecesTocada === 1 ? 'vez tocada' : 'veces tocada'}
                </span>
                <button
                  type="button"
                  className="btn-contador"
                  onClick={() => onIncrementarTocada(cancion.id)}
                  title="Marcar como tocada"
                >
                  +1
                </button>
              </div>

              {cancion.enlaceYoutube && (
                <a
                  href={cancion.enlaceYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tarjeta-enlace"
                >
                  Ver en YouTube
                </a>
              )}

              <div className="tarjeta-acciones">
                <button
                  type="button"
                  className="btn-editar"
                  onClick={() => onEditar(cancion)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-eliminar"
                  onClick={() => manejarEliminar(cancion.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
