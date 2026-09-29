import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErreur(null)
    setEnvoi(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch {
      setErreur('E-mail ou mot de passe incorrect.')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="enveloppe page-connexion">
      <div className="carte-connexion">
        <img src="/logo-emig.png" alt="Logo de l'EMIG" />
        <h2>Espace administrateur</h2>
        <p style={{ color: 'var(--encre-douce)', marginTop: -8, marginBottom: 24 }}>
          Gestion des activités, du bureau et des commentaires de l'UEE.
        </p>
        <form className="formulaire" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {erreur && <p className="message-erreur">{erreur}</p>}
          <button className="bouton" type="submit" disabled={envoi}>
            {envoi ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
