import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ActivitiesPanel from './admin/ActivitiesPanel.jsx'
import BureauPanel from './admin/BureauPanel.jsx'
import CommentsPanel from './admin/CommentsPanel.jsx'

const ONGLETS = [
  { id: 'activites', label: 'Activités' },
  { id: 'bureau', label: 'Bureau' },
  { id: 'commentaires', label: 'Commentaires' },
]

export default function AdminDashboard() {
  const [onglet, setOnglet] = useState('activites')
  const { logout } = useAuth()
  const navigate = useNavigate()

  function seDeconnecter() {
    logout()
    navigate('/')
  }

  return (
    <div className="enveloppe tableau-de-bord">
      <div className="tdb-entete">
        <h2 style={{ margin: 0 }}>Tableau de bord — UEE</h2>
        <button className="bouton bouton--secondaire bouton--petit" onClick={seDeconnecter}>Se déconnecter</button>
      </div>

      <div className="tdb-onglets">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            className={`tdb-onglet ${onglet === o.id ? 'actif' : ''}`}
            onClick={() => setOnglet(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === 'activites' && <ActivitiesPanel />}
      {onglet === 'bureau' && <BureauPanel />}
      {onglet === 'commentaires' && <CommentsPanel />}
    </div>
  )
}
