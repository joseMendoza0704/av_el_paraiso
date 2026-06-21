const REGEX_YOUTUBE = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&\S*)?$/

export function validarEnlaceYoutube(url) {
  if (!url || url.trim() === '') return true
  return REGEX_YOUTUBE.test(url.trim())
}

export function validarCamposObligatorios({ titulo, autor, categoriaLiturgica }) {
  const errores = []
  if (!titulo || titulo.trim() === '') {
    errores.push('El título es obligatorio.')
  }
  if (!autor || autor.trim() === '') {
    errores.push('El autor es obligatorio.')
  }
  if (!categoriaLiturgica || !['Alabanza', 'Adoración'].includes(categoriaLiturgica)) {
    errores.push('La categoría litúrgica debe ser "Alabanza" o "Adoración".')
  }
  return errores
}

const EXTENSIONES_PERMITIDAS = {
  documento: ['pdf', 'doc', 'docx'],
  pdf: ['pdf'],
  mp3: ['mp3'],
}

const TIPOS_PERMITIDOS = {
  documento: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  pdf: ['application/pdf'],
  mp3: ['audio/mpeg'],
}

function obtenerExtension(nombre) {
  const partes = nombre.split('.')
  return partes.length > 1 ? partes.pop().toLowerCase() : ''
}

export function validarArchivo(archivo, tipo, tamañoMaximoMB = 15) {
  const errores = []
  if (!archivo) return errores

  const extension = obtenerExtension(archivo.name)
  const extensionesValidas = EXTENSIONES_PERMITIDAS[tipo] || []
  const tiposValidos = TIPOS_PERMITIDOS[tipo] || []

  const mimeValido = tiposValidos.length === 0 || tiposValidos.includes(archivo.type)
  const extensionValida = extensionesValidas.length === 0 || extensionesValidas.includes(extension)

  if (!mimeValido && !extensionValida) {
    errores.push(`El archivo "${archivo.name}" no es un tipo válido. Se esperaba: ${tiposValidos.join(', ')}.`)
  } else if (!mimeValido && extensionValida) {
    const nombreTipo = tipo === 'documento' ? 'PDF o Word' : tipo.toUpperCase()
    errores.push(`El archivo "${archivo.name}" parece ser un ${nombreTipo} válido, pero el tipo MIME "${archivo.type}" no se reconoce. Se intentará subir de todas formas.`)
  }

  if (archivo.size > tamañoMaximoMB * 1024 * 1024) {
    errores.push(`El archivo "${archivo.name}" supera el tamaño máximo de ${tamañoMaximoMB} MB.`)
  }

  return errores
}
