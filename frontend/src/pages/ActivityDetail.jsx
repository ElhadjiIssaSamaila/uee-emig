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

  function partagerSurWhatsApp() {
    const texte = `${activite.title} — à voir sur le site de l'UEE : ${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank', 'noopener')
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
          {activite.location && <span>{activite.location}</span>}
        </div>
        <button className="bouton bouton--whatsapp" onClick={partagerSurWhatsApp}>
          <span className="bouton--whatsapp__icone">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.26 4.9L2 22l5.25-1.38a9.96 9.96 0 0 0 4.79 1.22h.01c5.52 0 10-4.48 10-10s-4.48-10-10.01-10zm0 18.17h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.12.82.84-3.04-.2-.31a8.27 8.27 0 0 1-1.27-4.4c0-4.58 3.73-8.3 8.3-8.3 2.22 0 4.3.86 5.87 2.43a8.24 8.24 0 0 1 2.43 5.88c0 4.58-3.73 8.3-8.31 8.3zm4.55-6.21c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.48-.28z" />
            </svg>
          </span>
          Partager sur WhatsApp
        </button>
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
