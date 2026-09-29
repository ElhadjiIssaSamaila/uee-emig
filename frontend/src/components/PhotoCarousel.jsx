import { useEffect, useRef, useState } from 'react'
import { mediaUrl } from '../api/client.js'

// Carrousel de photos qui défile automatiquement (et via les flèches/puces).
// C'est le composant qui répond au besoin de photos "qui bougent" sur la fiche activité.
export default function PhotoCarousel({ photos, altBase }) {
  const [index, setIndex] = useState(0)
  const minuteur = useRef(null)

  const total = photos.length

  useEffect(() => {
    if (total <= 1) return undefined
    minuteur.current = setInterval(() => {
      setIndex((i) => (i + 1) % total)
    }, 4500)
    return () => clearInterval(minuteur.current)
  }, [total])

  function allerA(i) {
    clearInterval(minuteur.current)
    setIndex((i + total) % total)
  }

  if (total === 0) {
    return null
  }

  return (
    <div className="carrousel">
      <div
        className="carrousel__piste"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {photos.map((photo, i) => (
          <div className="carrousel__diapo" key={photo.id ?? i}>
            <img src={mediaUrl(photo.file_path)} alt={photo.caption || `${altBase} — photo ${i + 1}`} />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            className="carrousel__bouton carrousel__bouton--precedent"
            onClick={() => allerA(index - 1)}
            aria-label="Photo précédente"
          >
            ‹
          </button>
          <button
            type="button"
            className="carrousel__bouton carrousel__bouton--suivant"
            onClick={() => allerA(index + 1)}
            aria-label="Photo suivante"
          >
            ›
          </button>
          <div className="carrousel__puces">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`carrousel__puce ${i === index ? 'actif' : ''}`}
                onClick={() => allerA(i)}
                aria-label={`Aller à la photo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
