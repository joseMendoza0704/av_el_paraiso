import { useState } from 'react'
import { ROLES_LETRAS, CATEGORIAS } from '../utils/constantes.js'
import { validarCamposObligatorios, validarEnlaceYoutube, validarArchivo } from '../utils/validaciones.js'
import SubirArchivo from './SubirArchivo.jsx'

const ESTADO_INICIAL = {
  titulo: '',
  autor: '',
  enlaceYoutube: '',
  categoriaLiturgica: '',
  tonalidad: '',
  bpm: '',
}

export default function ModalCancion({
  cancionExistente,
  onGuardar,
  onCerrar,
  guardando,
}) {
  const [formulario, setFormulario] = useState(
    cancionExistente
      ? {
          titulo: cancionExistente.titulo || '',
          autor: cancionExistente.autor || '',
          enlaceYoutube: cancionExistente.enlaceYoutube || '',
          categoriaLiturgica: cancionExistente.categoriaLiturgica || '',
          tonalidad: cancionExistente.tonalidad || '',
          bpm: cancionExistente.bpm || '',
        }
      : { ...ESTADO_INICIAL }
  )

  const [archivosNuevos, setArchivosNuevos] = useState({})
  const [archivosAEliminar, setArchivosAEliminar] = useState([])
  const [errores, setErrores] = useState([])

  function manejarCambio(e) {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
  }

  function manejarArchivo(clave, file) {
    setArchivosNuevos((prev) => ({ ...prev, [clave]: file }))
    setArchivosAEliminar((prev) => prev.filter((item) => item.campo !== clave))
  }

  function manejarQuitarArchivo(campo, url) {
    setArchivosNuevos((prev) => {
      const copia = { ...prev }
      delete copia[campo]
      return copia
    })
    setArchivosAEliminar((prev) => [...prev, { campo, url }])
  }

  function manejarClickFuera(e) {
    if (e.target === e.currentTarget) onCerrar()
  }

  function manejarTeclaEscape(e) {
    if (e.key === 'Escape') onCerrar()
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setErrores([])

    const erroresValidacion = validarCamposObligatorios(formulario)

    if (formulario.enlaceYoutube && !validarEnlaceYoutube(formulario.enlaceYoutube)) {
      erroresValidacion.push('El enlace de YouTube no tiene un formato válido.')
    }

    const erroresArchivos = []
    if (archivosNuevos.urlPdfLetra) {
      erroresArchivos.push(...validarArchivo(archivosNuevos.urlPdfLetra, 'pdf'))
    }
    if (archivosNuevos.urlMp3Secuencia) {
      erroresArchivos.push(...validarArchivo(archivosNuevos.urlMp3Secuencia, 'mp3'))
    }
    for (const rol of ROLES_LETRAS) {
      const claveRol = `letras.${rol.clave}`
      if (archivosNuevos[claveRol]) {
        erroresArchivos.push(...validarArchivo(archivosNuevos[claveRol], 'documento'))
      }
    }

    const todosErrores = [...erroresValidacion, ...erroresArchivos]
    if (todosErrores.length > 0) {
      setErrores(todosErrores)
      return
    }

    const datosGuardar = {
      titulo: formulario.titulo,
      autor: formulario.autor,
      enlaceYoutube: formulario.enlaceYoutube,
      categoriaLiturgica: formulario.categoriaLiturgica,
      tonalidad: formulario.tonalidad,
      bpm: formulario.bpm,
    }

    await onGuardar(datosGuardar, archivosNuevos, archivosAEliminar)
  }

  return (
    <div
      className="modal-overlay"
      onClick={manejarClickFuera}
      onKeyDown={manejarTeclaEscape}
      tabIndex={-1}
    >
      <div className="modal-contenido">
        <div className="modal-header">
          <h2>{cancionExistente ? 'Editar canción' : 'Nueva canción'}</h2>
          <button type="button" className="btn-cerrar" onClick={onCerrar}>
            ✕
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="modal-formulario">
          {errores.length > 0 && (
            <div className="errores-lista">
              {errores.map((err, i) => (
                <p key={i} className="error-item">{err}</p>
              ))}
            </div>
          )}

          <fieldset>
            <legend>Datos generales</legend>
            <div className="campo">
              <label htmlFor="titulo">Título *</label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                value={formulario.titulo}
                onChange={manejarCambio}
                required
                disabled={guardando}
              />
            </div>
            <div className="campo">
              <label htmlFor="autor">Autor *</label>
              <input
                id="autor"
                name="autor"
                type="text"
                value={formulario.autor}
                onChange={manejarCambio}
                required
                disabled={guardando}
              />
            </div>
            <div className="campo">
              <label htmlFor="enlaceYoutube">Enlace de YouTube</label>
              <input
                id="enlaceYoutube"
                name="enlaceYoutube"
                type="url"
                value={formulario.enlaceYoutube}
                onChange={manejarCambio}
                placeholder="https://youtube.com/watch?v=..."
                disabled={guardando}
              />
            </div>
            <div className="campo">
              <label htmlFor="categoriaLiturgica">Categoría litúrgica *</label>
              <select
                id="categoriaLiturgica"
                name="categoriaLiturgica"
                value={formulario.categoriaLiturgica}
                onChange={manejarCambio}
                required
                disabled={guardando}
              >
                <option value="">Seleccionar…</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="tonalidad">Tonalidad</label>
              <input
                id="tonalidad"
                name="tonalidad"
                type="text"
                value={formulario.tonalidad}
                onChange={manejarCambio}
                placeholder="Ej. G MAJOR"
                disabled={guardando}
              />
            </div>
            <div className="campo">
              <label htmlFor="bpm">BPM</label>
              <input
                id="bpm"
                name="bpm"
                type="number"
                value={formulario.bpm}
                onChange={manejarCambio}
                placeholder="Ej. 72"
                disabled={guardando}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Archivos generales</legend>
            <SubirArchivo
              id="pdfLetra"
              etiqueta="PDF de letra"
              archivo={archivosNuevos.urlPdfLetra}
              onArchivoSeleccionado={(file) => manejarArchivo('urlPdfLetra', file)}
              onQuitar={() => manejarQuitarArchivo('urlPdfLetra', cancionExistente?.urlPdfLetra)}
              aceptar=".pdf,application/pdf"
              urlExistente={
                cancionExistente?.urlPdfLetra && !archivosNuevos.urlPdfLetra
                  ? cancionExistente.urlPdfLetra
                  : null
              }
            />
            <SubirArchivo
              id="mp3Secuencia"
              etiqueta="MP3 de secuencia"
              archivo={archivosNuevos.urlMp3Secuencia}
              onArchivoSeleccionado={(file) => manejarArchivo('urlMp3Secuencia', file)}
              onQuitar={() => manejarQuitarArchivo('urlMp3Secuencia', cancionExistente?.urlMp3Secuencia)}
              aceptar=".mp3,audio/mpeg"
              urlExistente={
                cancionExistente?.urlMp3Secuencia && !archivosNuevos.urlMp3Secuencia
                  ? cancionExistente.urlMp3Secuencia
                  : null
              }
            />
          </fieldset>

          <fieldset>
            <legend>Letras por instrumento/rol</legend>
            <div className="grilla-letras">
              {ROLES_LETRAS.map((rol) => {
                const claveRol = `letras.${rol.clave}`
                return (
                  <SubirArchivo
                    key={rol.clave}
                    id={rol.clave}
                    etiqueta={rol.etiqueta}
                    archivo={archivosNuevos[claveRol]}
                    onArchivoSeleccionado={(file) => manejarArchivo(claveRol, file)}
                    onQuitar={() => manejarQuitarArchivo(
                      claveRol,
                      cancionExistente?.letras?.[rol.clave]
                    )}
                    aceptar=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    urlExistente={
                      cancionExistente?.letras?.[rol.clave] && !archivosNuevos[claveRol]
                        ? cancionExistente.letras[rol.clave]
                        : null
                    }
                  />
                )
              })}
            </div>
          </fieldset>

          <div className="modal-acciones">
            <button
              type="button"
              className="btn-secundario"
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={guardando}>
              {guardando
                ? 'Guardando…'
                : cancionExistente
                  ? 'Guardar cambios'
                  : 'Crear canción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
