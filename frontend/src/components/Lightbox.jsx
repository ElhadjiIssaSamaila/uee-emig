import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { mediaUrl } from '../api/client.js'

export default function Lightbox({ photos, index, onClose, onNavigate }) {
  const photo = photos[index]

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNavigate((index + 1) % photos.length)
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, photos.length, onClose, onNavigate])

  if (!photo) return null

  return (
    <div className="lightbox" role="dialog" aria-modal="true">
      <button className="lightbox__fermer" onClick={onClose} aria-label="Fermer">×</button>
      {photos.length > 1 && (
        <>
          <button
            className="lightbox__nav lightbox__nav--precedent"
            onClick={() => onNavigate((index - 1 + photos.length) % photos.length)}
            aria-label="Photo précédente"
          >‹</button>
          <button
            className="lightbox__nav lightbox__nav--suivant"
            onClick={() => onNavigate((index + 1) % photos.length)}
            aria-label="Photo suivante"
          >›</button>
        </>
      )}
      <img src={mediaUrl(photo.file_path)} alt={photo.caption || photo.activity_title || ''} />
      <div className="lightbox__legende">
        {photo.activity_title && (
          <Link to={`/activites/${photo.activity_slug}`} onClick={onClose}>
            {photo.activity_title}
          </Link>
        )}
      </div>
    </div>
  )
}
