import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import logoSidebar from '../assets/images/logo.jpg'

export default function Login() {
  const { iniciarSesion, errorAcceso } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('El correo y la contraseña son obligatorios.')
      return
    }
    setCargando(true)
    try {
      await iniciarSesion(email.trim(), password)
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.')
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo no es válido.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde.')
      } else {
        setError('Error al iniciar sesión. Revisa tu conexión.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-contenedor">
      <form className="login-formulario" onSubmit={manejarEnvio}>
        <img src={logoSidebar} alt="Logo Av El Paraíso" className="login-logo" />
        <h1>Av El Paraíso</h1>
        <p className="login-subtitulo">Banco Musical</p>
        {errorAcceso && <div className="login-error">{errorAcceso}</div>}
        {error && <div className="login-error">{error}</div>}
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@ejemplo.com"
          disabled={cargando}
          autoFocus
        />
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={cargando}
        />
        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
