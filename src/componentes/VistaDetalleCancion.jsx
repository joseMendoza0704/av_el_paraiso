import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Clock,
  Calendar,
  PlayCircle,
  Download,
  Edit,
  Trash2,
  Music2,
  FileText,
  Plus,
  ChevronDown,
  Loader,
} from 'lucide-react'
import { ROLES_LETRAS } from '../utils/constantes.js'
import { useAuth } from '../hooks/useAuth.js'

function obtenerExtension(url) {
  if (!url) return null
  const sinQuery = url.split('?')[0]
  return decodeURIComponent(sinQuery).split('.').pop().toLowerCase()
}


function VisorLetra({ url }) {
  if (!url) {
    return (
      <div className="letra-vacia">
        <FileText size={40} />
        <p>No hay letra cargada para este instrumento.</p>
      </div>
    )
  }

  const ext = obtenerExtension(url)
  const esPdf = ext === 'pdf'
  const esWord = ext === 'doc' || ext === 'docx'

  if (esPdf) {
    return (
      <div className="letra-pdf-contenedor">
        <iframe
          src={url}
          className="letra-iframe"
          title="Letra PDF"
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="letra-abrir-link"
        >
          Abrir en nueva pestaña ↗
        </a>
      </div>
    )
  }

  const etiqueta = esWord ? 'WORD' : 'DESCONOCIDO'

  return (
    <div className="letra-doc-tarjeta">
      <FileText size={40} className="letra-doc-icono" />
      <p className="letra-doc-titulo">Vista previa no disponible</p>
      <p className="letra-doc-sub">
        El archivo es de tipo <strong>.{etiqueta}</strong>.{esWord
          ? ' Los documentos de Word no pueden visualizarse en el navegador.'
          : ' No es posible previsualizar este tipo de archivo.'}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primario"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <Download size={18} /> Descargar archivo
      </a>
    </div>
  )
}

function formatearFecha(timestamp) {
  if (!timestamp) return null
  const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const ahora = new Date()
  const diffMs = ahora - fecha
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} sem`
  if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} meses`
  return `Hace ${Math.floor(diffDias / 365)} años`
}

export default function VistaDetalleCancion({ cancion, onVolver, onEditar, onEliminar }) {
  const { rolUsuario } = useAuth()
  const esAdmin = rolUsuario === 'admin'

  // El admin puede cambiar el instrumento; el músico queda fijo en su rol
  const instrumentoInicial = esAdmin
    ? (ROLES_LETRAS[0]?.clave || '')
    : rolUsuario

  const [instrumentoActivo, setInstrumentoActivo] = useState(instrumentoInicial)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)

  const urlLetraActiva = cancion.letras?.[instrumentoActivo] || null

  const rolLabel = ROLES_LETRAS.find((r) => r.clave === instrumentoActivo)?.etiqueta || instrumentoActivo

  function manejarEliminar() {
    onEliminar(cancion.id)
    onVolver()
  }

  return (
    <div className="detalle-contenedor">
      {/* Cabecera de navegación */}
      <button className="detalle-volver" onClick={onVolver}>
        <ArrowLeft size={18} /> Volver a Repertorio
      </button>

      {/* Hero */}
      <div className="detalle-hero">
        <div className="detalle-hero-info">
          <h1 className="detalle-titulo">{cancion.titulo}</h1>
          <p className="detalle-autor">{cancion.autor}</p>
          <div className="detalle-meta">
            {cancion.categoriaLiturgica && (
              <span className={`tarjeta-categoria tarjeta-categoria--${cancion.categoriaLiturgica.toLowerCase()}`}>
                {cancion.categoriaLiturgica}
              </span>
            )}
            {cancion.tonalidad && (
              <span className="detalle-meta-item">
                <Music2 size={14} /> Tono: {cancion.tonalidad}
              </span>
            )}
            {cancion.bpm && (
              <span className="detalle-meta-item">
                🥁 {cancion.bpm} BPM
              </span>
            )}
          </div>
        </div>
        <button className="btn-primario" disabled style={{ opacity: 0.5, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed' }}>
          <Plus size={18} /> Añadir a Set
        </button>
      </div>

      {/* Layout de 2 columnas */}
      <div className="detalle-layout">

        {/* Columna principal — Letra y Acordes */}
        <div className="detalle-columna-principal">
          <div className="detalle-card">
            <div className="detalle-card-header">
              <span className="detalle-card-titulo">
                <Music2 size={18} /> Letra y Acordes
              </span>

              {esAdmin ? (
                <div className="instrumento-selector">
                  <select
                    value={instrumentoActivo}
                    onChange={(e) => setInstrumentoActivo(e.target.value)}
                    className="instrumento-select"
                  >
                    {ROLES_LETRAS.map((rol) => (
                      <option key={rol.clave} value={rol.clave}>
                        {rol.etiqueta}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="instrumento-chevron" />
                </div>
              ) : (
                <span className="instrumento-fijo">{rolLabel}</span>
              )}
            </div>

            <div className="detalle-card-divider" />

            <VisorLetra url={urlLetraActiva} />
          </div>
        </div>

        {/* Columna lateral */}
        <div className="detalle-columna-lateral">

          {/* Detalles */}
          <div className="detalle-card-lateral">
            <h3 className="detalle-lateral-titulo">Detalles</h3>
            <div className="detalle-lateral-fila">
              <span className="detalle-lateral-label">
                <Clock size={16} /> Veces Tocada
              </span>
              <span className="detalle-lateral-valor">{cancion.vecesTocada || 0}</span>
            </div>
            {cancion.ultimaVezTocada && (
              <div className="detalle-lateral-fila">
                <span className="detalle-lateral-label">
                  <Calendar size={16} /> Última Vez
                </span>
                <span className="detalle-lateral-valor">
                  {formatearFecha(cancion.ultimaVezTocada)}
                </span>
              </div>
            )}
            {cancion.enlaceYoutube && (
              <a
                href={cancion.enlaceYoutube}
                target="_blank"
                rel="noopener noreferrer"
                className="detalle-btn-yt"
              >
                <PlayCircle size={18} /> Ver en YouTube
              </a>
            )}
          </div>

          {/* Archivos */}
          {(cancion.urlPdfLetra || cancion.urlMp3Secuencia) && (
            <div className="detalle-card-lateral">
              <h3 className="detalle-lateral-titulo">Archivos</h3>

              {cancion.urlPdfLetra && (
                <a
                  href={cancion.urlPdfLetra}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detalle-archivo-fila"
                >
                  <div className="detalle-archivo-icono detalle-archivo-icono--pdf">
                    <FileText size={18} />
                  </div>
                  <div className="detalle-archivo-info">
                    <span className="detalle-archivo-nombre">Partitura General</span>
                    <span className="detalle-archivo-tipo">PDF</span>
                  </div>
                  <Download size={16} className="detalle-archivo-download" />
                </a>
              )}

              {cancion.urlMp3Secuencia && (
                <a
                  href={cancion.urlMp3Secuencia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detalle-archivo-fila"
                >
                  <div className="detalle-archivo-icono detalle-archivo-icono--mp3">
                    <Music2 size={18} />
                  </div>
                  <div className="detalle-archivo-info">
                    <span className="detalle-archivo-nombre">Secuencia</span>
                    <span className="detalle-archivo-tipo">
                      MP3{cancion.bpm ? ` • ${cancion.bpm} BPM` : ''}
                    </span>
                  </div>
                  <Download size={16} className="detalle-archivo-download" />
                </a>
              )}
            </div>
          )}

          {/* Administración — solo admin */}
          {esAdmin && (
            <div className="detalle-card-lateral detalle-card-admin">
              <h3 className="detalle-lateral-titulo detalle-lateral-titulo--admin">Administración</h3>
              <button
                className="detalle-admin-btn"
                onClick={() => onEditar(cancion)}
              >
                <Edit size={18} /> Editar Canción
              </button>
              <button
                className="detalle-admin-btn detalle-admin-btn--danger"
                onClick={() => setConfirmandoEliminar(true)}
              >
                <Trash2 size={18} /> Eliminar del Repertorio
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminar */}
      {confirmandoEliminar && (
        <div className="modal-overlay" onClick={() => setConfirmandoEliminar(false)}>
          <div className="confirmacion-modal" onClick={(e) => e.stopPropagation()}>
            <p>¿Estás seguro de eliminar <strong>"{cancion.titulo}"</strong>?</p>
            <p className="confirmacion-sub">Esta acción eliminará todos los archivos y no se puede deshacer.</p>
            <div className="confirmacion-acciones">
              <button type="button" className="btn-secundario" onClick={() => setConfirmandoEliminar(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-peligro" onClick={manejarEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
