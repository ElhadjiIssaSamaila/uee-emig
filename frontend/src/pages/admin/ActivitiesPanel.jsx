import { useEffect, useRef, useState } from 'react'
import api, { mediaUrl } from '../../api/client.js'
import { formatDateLong } from '../../utils/roles.js'

const VIDE = { title: '', description: '', location: '', activity_date: '' }

export default function ActivitiesPanel() {
  const [activites, setActivites] = useState(null)
  const [form, setForm] = useState(VIDE)
  const [fichiers, setFichiers] = useState([])
  const [statut, setStatut] = useState('repos') // repos | envoi | erreur
  const [erreur, setErreur] = useState(null)
  const inputFichierRef = useRef(null)

  async function charger() {
    const res = await api.get('/api/activities', { params: { limit: 200 } })
    setActivites(res.data)
  }

  useEffect(() => { charger() }, [])

  async function creerActivite(e) {
    e.preventDefault()
    setStatut('envoi')
    setErreur(null)
    try {
      const res = await api.post('/api/activities', form)
      const activite = res.data

      for (const fichier of fichiers) {
        const donnees = new FormData()
        donnees.append('file', fichier)
        const televerse = await api.post('/api/upload/activities', donnees, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        await api.post(`/api/activities/${activite.id}/photos`, null, {
          params: { file_path: televerse.data.file_path },
        })
      }

      setForm(VIDE)
      setFichiers([])
      if (inputFichierRef.current) inputFichierRef.current.value = ''
      setStatut('repos')
      charger()
    } catch (err) {
      setErreur(err?.response?.data?.detail || "La publication de l'activité a échoué.")
      setStatut('erreur')
    }
  }

  async function ajouterPhotos(activiteId, fileList) {
    for (const fichier of fileList) {
      const donnees = new FormData()
      donnees.append('file', fichier)
      const televerse = await api.post('/api/upload/activities', donnees, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await api.post(`/api/activities/${activiteId}/photos`, null, {
        params: { file_path: televerse.data.file_path },
      })
    }
    charger()
  }

  async function supprimerActivite(id) {
    if (!window.confirm('Supprimer définitivement cette activité et ses photos ?')) return
    await api.delete(`/api/activities/${id}`)
    charger()
  }

  return (
    <>
      <div className="panneau">
        <h3>Publier une nouvelle activité</h3>
        <form onSubmit={creerActivite}>
          <div className="grille-form">
            <div className="pleine">
              <label htmlFor="title">Titre de l'activité</label>
              <input
                id="title" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="activity_date">Date</label>
              <input
                id="activity_date" type="date" required value={form.activity_date}
                onChange={(e) => setForm({ ...form, activity_date: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="location">Lieu (optionnel)</label>
              <input
                id="location" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="pleine">
              <label htmlFor="description">Description</label>
              <textarea
                id="description" required value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="pleine">
              <label htmlFor="photos">Photos de l'activité</label>
              <input
                id="photos" type="file" accept="image/*" multiple ref={inputFichierRef}
                onChange={(e) => setFichiers(Array.from(e.target.files))}
              />
            </div>
          </div>
          {erreur && <p className="message-erreur">{erreur}</p>}
          <button className="bouton" type="submit" disabled={statut === 'envoi'} style={{ marginTop: 16 }}>
            {statut === 'envoi' ? 'Publication…' : "Publier l'activité"}
          </button>
        </form>
      </div>

      <div className="panneau">
        <h3>Activités publiées ({activites?.length ?? '…'})</h3>
        {!activites && <p className="etat-vide">Chargement…</p>}
        {activites && activites.length === 0 && <p className="etat-vide">Aucune activité pour le moment.</p>}
        <div className="liste-admin">
          {activites?.map((a) => (
            <div className="ligne-admin" key={a.id}>
              <div className="ligne-admin__infos">
                <span className="ligne-admin__titre">{a.title}</span>
                <span className="ligne-admin__detail">{formatDateLong(a.activity_date)}{a.location ? ` · ${a.location}` : ''}</span>
                {a.cover_photo && (
                  <div className="miniatures-televerses">
                    <img src={mediaUrl(a.cover_photo)} alt="" />
                  </div>
                )}
              </div>
              <div className="ligne-admin__actions">
                <label className="bouton bouton--secondaire bouton--petit" style={{ cursor: 'pointer' }}>
                  + Photos
                  <input
                    type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={(e) => ajouterPhotos(a.id, Array.from(e.target.files))}
                  />
                </label>
                <button className="bouton bouton--danger bouton--petit" onClick={() => supprimerActivite(a.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
