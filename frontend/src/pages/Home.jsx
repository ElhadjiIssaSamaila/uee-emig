import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { mediaUrl } from '../api/client.js'
import { formatDayMonth } from '../utils/roles.js'

const PHOTOS_HERO = ['/hero-aag.jpg', '/hero-conference.jpg', '/hero-plein-air.jpg', '/hero-sport.jpg']

export default function Home() {
  const [activites, setActivites] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [indexHero, setIndexHero] = useState(0)
  const minuteurHero = useRef(null)

  useEffect(() => {
    api
      .get('/api/activities', { params: { limit: 20 } })
      .then((res) => setActivites(res.data))
      .catch(() => setErreur("Impossible de charger les activités pour le moment."))
  }, [])

  useEffect(() => {
    minuteurHero.current = setInterval(() => {
      setIndexHero((i) => (i + 1) % PHOTOS_HERO.length)
    }, 5500)
    return () => clearInterval(minuteurHero.current)
  }, [])

  function allerAHero(i) {
    clearInterval(minuteurHero.current)
    setIndexHero((i + PHOTOS_HERO.length) % PHOTOS_HERO.length)
  }

  return (
    <>
      <section className="hero-photo">
        <div className="hero-photo__piste" style={{ transform: `translateX(-${indexHero * 100}%)` }}>
          {PHOTOS_HERO.map((src, i) => (
            <div className="hero-photo__diapo" key={src}>
              <img src={src} alt={`Activité de l'Union des Élèves de l'EMIG — photo ${i + 1}`} />
            </div>
          ))}
        </div>
        <div className="hero-photo__voile" />

        <button className="hero-photo__fleche hero-photo__fleche--gauche" onClick={() => allerAHero(indexHero - 1)} aria-label="Photo précédente">‹</button>
        <button className="hero-photo__fleche hero-photo__fleche--droite" onClick={() => allerAHero(indexHero + 1)} aria-label="Photo suivante">›</button>

        <div className="enveloppe hero-photo__contenu">
          <div className="hero-photo__etiquette">Union des Élèves de l'EMIG</div>
          <h1 className="hero-photo__titre">La vie associative des étudiants de l'EMIG, activité après activité.</h1>
          <p className="hero-photo__texte">
            Assemblées, conférences, rencontres et compétitions sportives : chaque
            activité de l'UEE est publiée ici, avec ses photos, pour toute la communauté étudiante.
          </p>
          <a href="#dernieres-activites" className="bouton bouton--clair">Découvrir les activités ↓</a>

          <div className="hero-photo__puces">
            {PHOTOS_HERO.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`hero-photo__puce ${i === indexHero ? 'actif' : ''}`}
                onClick={() => allerAHero(i)}
                aria-label={`Aller à la photo ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="dernieres-activites">
        <div className="enveloppe">
          <div className="section__entete">
            <h2>Dernières activités</h2>
            <Link to="/galerie">Voir toutes les photos →</Link>
          </div>

          {erreur && <p className="message-erreur">{erreur}</p>}

          {!activites && !erreur && <p className="etat-vide">Chargement des activités…</p>}

          {activites && activites.length === 0 && (
            <p className="etat-vide">Aucune activité publiée pour le moment. Revenez bientôt.</p>
          )}

          {activites && activites.length > 0 && (
            <div className="flux-activite">
              {activites.map((a) => {
                const d = formatDayMonth(a.activity_date)
                return (
                  <Link to={`/activites/${a.slug}`} className="billet" key={a.id}>
                    <div className="billet__image">
                      {a.cover_photo ? (
                        <img src={mediaUrl(a.cover_photo)} alt="" />
                      ) : (
                        <div className="billet__image--vide" />
                      )}
                      <span className="billet__date-badge">
                        <span className="jour">{d.jour}</span>
                        <span className="mois">{d.mois} {d.annee}</span>
                      </span>
                    </div>
                    <div className="billet__corps">
                      {a.location && <div className="billet__lieu">{a.location}</div>}
                      <h3>{a.title}</h3>
                      <p className="billet__extrait">{a.description.slice(0, 110)}{a.description.length > 110 ? '…' : ''}</p>
                      <span className="billet__lire">Lire l'article →</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
