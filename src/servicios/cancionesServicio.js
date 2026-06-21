import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage'
import { db, storage } from '../firebase/config.js'
import { ROLES_LETRAS, RUTAS_STORAGE } from '../utils/constantes.js'
import { validarCamposObligatorios, validarEnlaceYoutube } from '../utils/validaciones.js'

const coleccion = collection(db, 'canciones')

export function obtenerCanciones(callback) {
  const q = query(coleccion, orderBy('titulo'))
  return onSnapshot(
    q,
    (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      callback(lista)
    },
    (error) => {
      console.error('Error al obtener canciones:', error)
      callback(null, error)
    }
  )
}

function subirArchivo(rutaStorage, archivo) {
  return new Promise((resolve, reject) => {
    const referencia = ref(storage, rutaStorage)
    const tarea = uploadBytesResumable(referencia, archivo)

    tarea.on(
      'state_changed',
      () => {},
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(tarea.snapshot.ref)
          resolve(url)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

async function subirArchivosCancion(idCancion, archivos, urlsExistentes = {}) {
  const urls = {}

  if (archivos.urlPdfLetra) {
    if (urlsExistentes.urlPdfLetra) {
      await deleteObject(ref(storage, urlsExistentes.urlPdfLetra)).catch(() => {})
    }
    urls.urlPdfLetra = await subirArchivo(RUTAS_STORAGE.PDF_LETRA(idCancion), archivos.urlPdfLetra)
  }

  if (archivos.urlMp3Secuencia) {
    if (urlsExistentes.urlMp3Secuencia) {
      await deleteObject(ref(storage, urlsExistentes.urlMp3Secuencia)).catch(() => {})
    }
    urls.urlMp3Secuencia = await subirArchivo(RUTAS_STORAGE.MP3_SECUENCIA(idCancion), archivos.urlMp3Secuencia)
  }

  const promesasRoles = []
  for (const rol of ROLES_LETRAS) {
    const archivo = archivos[`letras.${rol.clave}`]
    if (archivo) {
      promesasRoles.push(
        (async () => {
          if (urlsExistentes.letras?.[rol.clave]) {
            await deleteObject(ref(storage, urlsExistentes.letras[rol.clave])).catch(() => {})
          }
          const extension = archivo.name.split('.').pop()
          const url = await subirArchivo(
            RUTAS_STORAGE.LETRA_ROL(idCancion, `${rol.clave}.${extension}`),
            archivo
          )
          urls[`letras.${rol.clave}`] = url
        })()
      )
    }
  }
  await Promise.all(promesasRoles)

  return urls
}

export async function crearCancion(datos, archivos) {
  const errores = validarCamposObligatorios(datos)
  if (datos.enlaceYoutube && !validarEnlaceYoutube(datos.enlaceYoutube)) {
    errores.push('El enlace de YouTube no es válido.')
  }
  if (errores.length > 0) {
    throw new Error(errores.join(' '))
  }

  const docRef = await addDoc(coleccion, {
    titulo: datos.titulo.trim(),
    autor: datos.autor.trim(),
    enlaceYoutube: datos.enlaceYoutube?.trim() || '',
    categoriaLiturgica: datos.categoriaLiturgica,
    vecesTocada: 0,
    urlPdfLetra: null,
    urlMp3Secuencia: null,
    letras: {
      baterista: null,
      coros: null,
      bajista: null,
      pianista: null,
      guitarrista: null,
      trompetista: null,
      saxofonistaAlto: null,
      saxofonistaTenor: null,
      proyeccion: null,
    },
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  })

  const urlsSubidas = await subirArchivosCancion(docRef.id, archivos)

  if (Object.keys(urlsSubidas).length > 0) {
    const actualizacion = { actualizadoEn: serverTimestamp() }
    for (const [campo, url] of Object.entries(urlsSubidas)) {
      actualizacion[campo] = url
    }
    await updateDoc(doc(db, 'canciones', docRef.id), actualizacion)
  }

  return docRef.id
}

export async function actualizarCancion(id, datos, archivosNuevos, archivosAEliminar = [], urlsExistentes = {}) {
  const errores = validarCamposObligatorios(datos)
  if (datos.enlaceYoutube && !validarEnlaceYoutube(datos.enlaceYoutube)) {
    errores.push('El enlace de YouTube no es válido.')
  }
  if (errores.length > 0) {
    throw new Error(errores.join(' '))
  }

  const urlsSubidas = await subirArchivosCancion(id, archivosNuevos, urlsExistentes)

  const actualizacion = { actualizadoEn: serverTimestamp() }
  const promesasEliminar = []

  for (const { campo, url } of archivosAEliminar) {
    if (url) {
      promesasEliminar.push(
        deleteObject(ref(storage, url)).catch(() => {})
      )
    }
    actualizacion[campo] = null
  }
  await Promise.all(promesasEliminar)

  if (datos.titulo !== undefined) actualizacion.titulo = datos.titulo.trim()
  if (datos.autor !== undefined) actualizacion.autor = datos.autor.trim()
  if (datos.enlaceYoutube !== undefined) actualizacion.enlaceYoutube = datos.enlaceYoutube?.trim() || ''
  if (datos.categoriaLiturgica !== undefined) actualizacion.categoriaLiturgica = datos.categoriaLiturgica

  for (const [campo, url] of Object.entries(urlsSubidas)) {
    if (campo.startsWith('letras.')) {
      actualizacion[campo] = url
    } else {
      actualizacion[campo] = url
    }
  }

  await updateDoc(doc(db, 'canciones', id), actualizacion)
}

export async function eliminarCancion(id) {
  const promesasEliminar = []

  const carpetas = [
    RUTAS_STORAGE.CARPETA(id),
    RUTAS_STORAGE.CARPETA_LETRAS(id),
  ]

  for (const carpeta of carpetas) {
    try {
      const resultado = await listAll(ref(storage, carpeta))
      for (const item of resultado.items) {
        promesasEliminar.push(deleteObject(item))
      }
      for (const prefijo of resultado.prefixes) {
        const subResultado = await listAll(prefijo)
        for (const item of subResultado.items) {
          promesasEliminar.push(deleteObject(item))
        }
      }
    } catch (err) {
      if (err.code !== 'storage/object-not-found') throw err
    }
  }

  await Promise.all(promesasEliminar)
  await deleteDoc(doc(db, 'canciones', id))
}

export async function incrementarVecesTocada(id) {
  await updateDoc(doc(db, 'canciones', id), {
    vecesTocada: increment(1),
    actualizadoEn: serverTimestamp(),
  })
}
