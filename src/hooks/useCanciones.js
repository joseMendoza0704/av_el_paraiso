import { useState, useEffect, useCallback } from 'react'
import {
  obtenerCanciones,
  crearCancion,
  actualizarCancion,
  eliminarCancion,
  incrementarVecesTocada,
} from '../servicios/cancionesServicio.js'

export function useCanciones() {
  const [canciones, setCanciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = obtenerCanciones((lista, err) => {
      if (err) {
        setError('No se pudieron cargar las canciones. Revisa tu conexión.')
        setCargando(false)
        return
      }
      setCanciones(lista)
      setCargando(false)
    })
    return unsubscribe
  }, [])

  const crear = useCallback(async (datos, archivos) => {
    try {
      await crearCancion(datos, archivos)
      return { exito: true }
    } catch (err) {
      return { exito: false, error: err.message }
    }
  }, [])

  const actualizar = useCallback(async (id, datos, archivosNuevos, archivosAEliminar, urlsExistentes = {}) => {
    try {
      await actualizarCancion(id, datos, archivosNuevos, archivosAEliminar, urlsExistentes)
      return { exito: true }
    } catch (err) {
      return { exito: false, error: err.message }
    }
  }, [])

  const eliminar = useCallback(async (id) => {
    try {
      await eliminarCancion(id)
      return { exito: true }
    } catch (err) {
      return { exito: false, error: err.message }
    }
  }, [])

  const incrementarTocada = useCallback(async (id) => {
    try {
      await incrementarVecesTocada(id)
    } catch (err) {
      console.error('Error al incrementar veces tocada:', err)
    }
  }, [])

  return {
    canciones,
    cargando,
    error,
    crear,
    actualizar,
    eliminar,
    incrementarTocada,
  }
}
