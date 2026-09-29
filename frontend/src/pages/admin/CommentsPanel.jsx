import { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { formatDateTime } from '../../utils/roles.js'

export default function CommentsPanel() {
  const [commentaires, setCommentaires] = useState(null)

  async function charger() {
    const res = await api.get('/api/comments')
    setCommentaires(res.data)
  }

  useEffect(() => { charger() }, [])

  async function supprimer(id) {
    if (!window.confirm('Supprimer définitivement ce commentaire du site ?')) return
    await api.delete(`/api/comments/${id}`)
    charger()
  }

  if (!commentaires) return <p className="etat-vide">Chargement…</p>

  return (
    <div className="panneau">
      <h3>Commentaires publiés sur le site ({commentaires.length})</h3>
      <p style={{ color: 'var(--encre-douce)', fontSize: '0.9rem', marginTop: -10 }}>
        Les commentaires des visiteurs apparaissent directement sur la page de l'activité.
        Vous pouvez en supprimer un ici s'il n'est pas approprié.
      </p>
      {commentaires.length === 0 && <p className="etat-vide">Aucun commentaire pour le moment.</p>}
      <div className="liste-admin">
        {commentaires.map((c) => (
          <div className="ligne-admin" key={c.id}>
            <div className="ligne-admin__infos">
              <span className="ligne-admin__titre">{c.author_name}</span>
              <span className="ligne-admin__detail">sur « {c.activity_title} » · {formatDateTime(c.created_at)}</span>
              <p style={{ margin: '6px 0 0' }}>{c.content}</p>
            </div>
            <div className="ligne-admin__actions">
              <button className="bouton bouton--danger bouton--petit" onClick={() => supprimer(c.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
