import { createContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [rolUsuario, setRolUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorAcceso, setErrorAcceso] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUsuario(null)
        setRolUsuario(null)
        setErrorAcceso(null)
        setCargando(false)
        return
      }

      // Verificar si el usuario tiene un documento en /usuarios/{email}
      try {
        const docRef = doc(db, 'usuarios', user.email)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          // No tiene acceso — cerrar sesión automáticamente
          setErrorAcceso('Tu cuenta no tiene acceso a esta aplicación. Contacta al administrador.')
          await signOut(auth)
          setUsuario(null)
          setRolUsuario(null)
          setCargando(false)
          return
        }

        const rol = docSnap.data().rol
        if (!rol) {
          setErrorAcceso('Tu cuenta no tiene un rol asignado. Contacta al administrador.')
          await signOut(auth)
          setUsuario(null)
          setRolUsuario(null)
          setCargando(false)
          return
        }

        setUsuario(user)
        setRolUsuario(rol)
        setErrorAcceso(null)
      } catch (err) {
        console.error('Error al verificar rol:', err)
        setErrorAcceso('Error al verificar permisos. Intenta de nuevo.')
        await signOut(auth)
        setUsuario(null)
        setRolUsuario(null)
      }

      setCargando(false)
    })
    return unsubscribe
  }, [])

  async function iniciarSesion(email, password) {
    setErrorAcceso(null)
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function cerrarSesion() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ usuario, rolUsuario, cargando, errorAcceso, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}
