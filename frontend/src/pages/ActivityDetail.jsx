import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client.js'
import PhotoCarousel from '../components/PhotoCarousel.jsx'
import { formatDateLong, formatDateTime } from '../utils/roles.js'

export default function ActivityDetail() {
  const { slug } = useParams()
  const [activite, setActivite] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [form, setForm] = useState({ author_name: '', author_email: '', content: '' })
  const [envoi, setEnvoi] = useState('repos') // repos | envoi | succes | erreur

  useEffect(() => {
    setActivite(null)
    api
      .get(`/api/activities/${slug}`)
      .then((res) => setActivite(res.data))
      .catch(() => setErreur("Cette activité est introuvable ou a été retirée."))
  }, [slug])

  async function envoyerCommentaire(e) {
    e.preventDefault()
    setEnvoi('envoi')
    try {
      await api.post(`/api/activities/${activite.id}/comments`, {
        author_name: form.author_name,
        author_email: form.author_email || undefined,
        content: form.content,
      })
      setEnvoi('succes')
      setForm({ author_name: '', author_email: '', content: '' })
    } catch {
      setEnvoi('erreur')
    }
  }

  if (erreur) {
    return (
      <div className="enveloppe section">
        <p className="message-erreur">{erreur}</p>
        <Link to="/">← Retour à l'accueil</Link>
      </div>
    )
  }

  if (!activite) {
    return (
      <div className="enveloppe section">
        <p className="etat-vide">Chargement de l'activité…</p>
      </div>
    )
  }

  return (
    <article className="enveloppe section">
      <div className="fil-ariane">
        <Link to="/">Accueil</Link> / Activités / {activite.title}
      </div>

      <header className="activite-entete">
        <h1>{activite.title}</h1>
        <div className="activite-meta">
          <span>📅 {formatDateLong(activite.activity_date)}</span>
          {activite.location && <span>📍 {activite.location}</span>}
        </div>
      </header>

      <PhotoCarousel photos={activite.photos} altBase={activite.title} />

      <p className="activite-description">{activite.description}</p>

      <section className="commentaires">
        <div className="section__entete">
          <h2>Commentaires {activite.comments.length > 0 ? `(${activite.comments.length})` : ''}</h2>
        </div>

        {activite.comments.length === 0 && (
          <p className="etat-vide">Aucun commentaire publié pour cette activité pour l'instant.</p>
        )}

        {activite.comments.map((c) => (
          <div className="commentaire" key={c.id}>
            <div className="commentaire__entete">
              <span>{c.author_name}</span>
              <span className="commentaire__date">{formatDateTime(c.created_at)}</span>
            </div>
            <p>{c.content}</p>
          </div>
        ))}

        <form className="formulaire" onSubmit={envoyerCommentaire} style={{ marginTop: 36 }}>
          <h3 style={{ marginBottom: 0 }}>Laisser un commentaire</h3>
          <p style={{ color: 'var(--encre-douce)', fontSize: '0.9rem', margin: 0 }}>
            Votre message sera publié directement sur cette page.
          </p>
          <div>
            <label htmlFor="author_name">Nom</label>
            <input
              id="author_name"
              required
              value={form.author_name}
              onChange={(e) => setForm({ ...form, author_name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="author_email">E-mail (optionnel)</label>
            <input
              id="author_email"
              type="email"
              value={form.author_email}
              onChange={(e) => setForm({ ...form, author_email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="content">Message</label>
            <textarea
              id="content"
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <button className="bouton" type="submit" disabled={envoi === 'envoi'}>
            {envoi === 'envoi' ? 'Envoi…' : 'Envoyer le commentaire'}
          </button>
          {envoi === 'succes' && (
            <p className="message-succes">Merci ! Votre commentaire a bien été publié.</p>
          )}
          {envoi === 'erreur' && (
            <p className="message-erreur">Une erreur est survenue. Merci de réessayer.</p>
          )}
        </form>
      </section>
    </article>
  )
}
