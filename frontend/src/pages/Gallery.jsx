import { useEffect, useState } from 'react'
import api, { mediaUrl } from '../api/client.js'
import Lightbox from '../components/Lightbox.jsx'

export default function Gallery() {
  const [photos, setPhotos] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [ouverte, setOuverte] = useState(null) // index de la photo ouverte dans la lightbox

  useEffect(() => {
    api
      .get('/api/activities/gallery')
      .then((res) => setPhotos(res.data))
      .catch(() => setErreur('Impossible de charger la galerie pour le moment.'))
  }, [])

  return (
    <div className="enveloppe section">
      <div className="section__entete">
        <h2>Galerie photo</h2>
        <span style={{ color: 'var(--encre-douce)', fontFamily: 'var(--police-titre)', fontSize: '0.85rem' }}>
          {photos ? `${photos.length} photo${photos.length > 1 ? 's' : ''}` : ''}
        </span>
      </div>

      {erreur && <p className="message-erreur">{erreur}</p>}
      {!photos && !erreur && <p className="etat-vide">Chargement de la galerie…</p>}
      {photos && photos.length === 0 && <p className="etat-vide">Aucune photo publiée pour le moment.</p>}

      {photos && photos.length > 0 && (
        <div className="grille-galerie">
          {photos.map((p, i) => (
            <button key={p.id} onClick={() => setOuverte(i)} aria-label={`Agrandir : ${p.activity_title}`}>
              <img src={mediaUrl(p.file_path)} alt={p.caption || p.activity_title} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {photos && ouverte !== null && (
        <Lightbox
          photos={photos}
          index={ouverte}
          onClose={() => setOuverte(null)}
          onNavigate={(i) => setOuverte(i)}
        />
      )}
    </div>
  )
}
