import { useEffect, useState } from 'react'
import api, { mediaUrl } from '../api/client.js'
import { ROLE_LABELS, sortByRole } from '../utils/roles.js'

function initiales(prenom, nom) {
  return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase()
}

export default function Bureau() {
  const [gestions, setGestions] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [selection, setSelection] = useState(null)

  useEffect(() => {
    api
      .get('/api/mandates')
      .then((res) => {
        setGestions(res.data)
        if (res.data.length > 0) setSelection(res.data[0].id)
      })
      .catch(() => setErreur('Impossible de charger le bureau pour le moment.'))
  }, [])

  const gestionActive = gestions?.find((g) => g.id === selection)

  return (
    <div className="enveloppe section">
      <div className="section__entete">
        <h2>Le bureau de l'UEE</h2>
      </div>

      {erreur && <p className="message-erreur">{erreur}</p>}
      {!gestions && !erreur && <p className="etat-vide">Chargement du bureau…</p>}
      {gestions && gestions.length === 0 && (
        <p className="etat-vide">Aucune gestion n'a encore été enregistrée.</p>
      )}

      {gestions && gestions.length > 0 && (
        <>
          <div className="onglets-gestion">
            {gestions.map((g) => (
              <button
                key={g.id}
                className={`onglet-gestion ${g.id === selection ? 'actif' : ''}`}
                onClick={() => setSelection(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>

          {gestionActive && (
            <div className="grille-membres">
              {sortByRole(gestionActive.members).map((m) => (
                <div className="carte-membre" key={m.id}>
                  <div className="carte-membre__photo">
                    {m.photo_path ? (
                      <img src={mediaUrl(m.photo_path)} alt={`${m.first_name} ${m.last_name}`} />
                    ) : (
                      <div className="carte-membre__photo--vide">{initiales(m.first_name, m.last_name)}</div>
                    )}
                  </div>
                  <div className="carte-membre__corps">
                    <div className="carte-membre__poste">{m.role} — {ROLE_LABELS[m.role]}</div>
                    <div className="carte-membre__nom">{m.first_name} {m.last_name}</div>
                    {m.option && <div className="carte-membre__option">{m.option}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
