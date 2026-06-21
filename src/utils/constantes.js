export const ROLES_LETRAS = [
  { clave: 'baterista', nombreBase: 'baterista', etiqueta: 'Baterista' },
  { clave: 'coros', nombreBase: 'coros', etiqueta: 'Coros' },
  { clave: 'bajista', nombreBase: 'bajista', etiqueta: 'Bajista' },
  { clave: 'pianista', nombreBase: 'pianista', etiqueta: 'Pianista' },
  { clave: 'guitarrista', nombreBase: 'guitarrista', etiqueta: 'Guitarrista' },
  { clave: 'trompetista', nombreBase: 'trompetista', etiqueta: 'Trompetista' },
  { clave: 'saxofonistaAlto', nombreBase: 'saxofonista_alto', etiqueta: 'Saxofonista Alto' },
  { clave: 'saxofonistaTenor', nombreBase: 'saxofonista_tenor', etiqueta: 'Saxofonista Tenor' },
  { clave: 'proyeccion', nombreBase: 'proyeccion', etiqueta: 'Proyección' },
]

export const CATEGORIAS = ['Alabanza', 'Adoración']

const BASE_STORAGE = 'canciones'

export const RUTAS_STORAGE = {
  PDF_LETRA: (idCancion) => `${BASE_STORAGE}/${idCancion}/pdfLetra.pdf`,
  MP3_SECUENCIA: (idCancion) => `${BASE_STORAGE}/${idCancion}/mp3Secuencia.mp3`,
  LETRA_ROL: (idCancion, nombreArchivo) => `${BASE_STORAGE}/${idCancion}/letras/${nombreArchivo}`,
  CARPETA: (idCancion) => `${BASE_STORAGE}/${idCancion}`,
  CARPETA_LETRAS: (idCancion) => `${BASE_STORAGE}/${idCancion}/letras`,
}
