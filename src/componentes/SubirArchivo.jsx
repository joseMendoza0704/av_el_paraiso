import { useState } from 'react'

export default function SubirArchivo({
  id,
  etiqueta,
  archivo,
  onArchivoSeleccionado,
  onQuitar,
  progreso,
  aceptar,
  urlExistente,
}) {
  const [archivoLocal, setArchivoLocal] = useState(null)

  function manejarCambio(e) {
    const file = e.target.files[0]
    if (file) {
      setArchivoLocal(file)
      onArchivoSeleccionado(file)
    }
  }

  function manejarQuitar() {
    setArchivoLocal(null)
    if (onQuitar) onQuitar()
  }

  const tieneArchivo = archivo || archivoLocal
  const mostrarProgreso = progreso !== undefined && progreso > 0 && progreso < 100

  return (
    <div className="subir-archivo">
      <label className="subir-archivo-etiqueta" htmlFor={id}>
        {etiqueta}
      </label>

      {!archivoLocal && urlExistente && (
        <div className="subir-archivo-existente">
          <a
            href={urlExistente}
            target="_blank"
            rel="noopener noreferrer"
            className="subir-archivo-enlace"
          >
            Ver archivo actual
          </a>
          <button
            type="button"
            className="btn-quitar"
            onClick={manejarQuitar}
            title="Quitar archivo"
          >
            ✕
          </button>
        </div>
      )}

      {!archivoLocal && !urlExistente && (
        <input
          id={id}
          type="file"
          accept={aceptar}
          onChange={manejarCambio}
          className="subir-archivo-input"
        />
      )}

      {archivoLocal && (
        <div className="subir-archivo-seleccionado">
          <span className="subir-archivo-nombre">{archivoLocal.name}</span>
          <button
            type="button"
            className="btn-quitar"
            onClick={manejarQuitar}
            title="Quitar archivo"
          >
            ✕
          </button>
        </div>
      )}

      {mostrarProgreso && (
        <div className="subir-archivo-barra-contenedor">
          <div
            className="subir-archivo-barra"
            style={{ width: `${progreso}%` }}
          />
        </div>
      )}
    </div>
  )
}
