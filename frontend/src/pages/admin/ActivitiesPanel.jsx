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

  const [editionId, setEditionId] = useState(null)
  const [editForm, setEditForm] = useState(VIDE)
  const [editPhotos, setEditPhotos] = useState([])
  const [editStatut, setEditStatut] = useState('repos')

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

  async function ouvrirEdition(activite) {
    setEditionId(activite.id)
    setEditForm({
      title: activite.title,
      description: activite.description,
      location: activite.location || '',
      activity_date: activite.activity_date,
    })
    setEditStatut('repos')
    const res = await api.get(`/api/activities/${activite.slug}`)
    setEditPhotos(res.data.photos)
  }

  function fermerEdition() {
    setEditionId(null)
    setEditPhotos([])
  }

  async function enregistrerEdition() {
    setEditStatut('envoi')
    try {
      await api.put(`/api/activities/${editionId}`, editForm)
      setEditStatut('repos')
      fermerEdition()
      charger()
    } catch {
      setEditStatut('erreur')
    }
  }

  async function ajouterPhotosEdition(fileList) {
    for (const fichier of fileList) {
      const donnees = new FormData()
      donnees.append('file', fichier)
      const televerse = await api.post('/api/upload/activities', donnees, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await api.post(`/api/activities/${editionId}/photos`, null, {
        params: { file_path: televerse.data.file_path },
      })
    }
    const res = await api.get(`/api/activities/${activites.find((a) => a.id === editionId).slug}`)
    setEditPhotos(res.data.photos)
  }

  async function supprimerPhotoEdition(photoId) {
    await api.delete(`/api/activities/photos/${photoId}`)
    setEditPhotos((photos) => photos.filter((p) => p.id !== photoId))
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
            <div key={a.id}>
              {editionId !== a.id ? (
                <div className="ligne-admin">
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
                    <button className="bouton bouton--secondaire bouton--petit" onClick={() => ouvrirEdition(a)}>Modifier</button>
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
              ) : (
                <div className="panneau" style={{ margin: '14px 0', background: 'var(--papier)' }}>
                  <h3>Modifier l'activité</h3>
                  <div className="grille-form">
                    <div className="pleine">
                      <label>Titre de l'activité</label>
                      <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label>Date</label>
                      <input type="date" value={editForm.activity_date} onChange={(e) => setEditForm({ ...editForm, activity_date: e.target.value })} />
                    </div>
                    <div>
                      <label>Lieu (optionnel)</label>
                      <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                    </div>
                    <div className="pleine">
                      <label>Description</label>
                      <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                    </div>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <label style={{ fontFamily: 'var(--police-titre)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--bleu-nuit)' }}>
                      Photos actuelles
                    </label>
                    <div className="miniatures-televerses" style={{ marginTop: 10 }}>
                      {editPhotos.map((p) => (
                        <div key={p.id} style={{ position: 'relative' }}>
                          <img src={mediaUrl(p.file_path)} alt="" />
                          <button
                            type="button"
                            onClick={() => supprimerPhotoEdition(p.id)}
                            title="Supprimer cette photo"
                            style={{
                              position: 'absolute', top: -8, right: -8, width: 22, height: 22,
                              borderRadius: '50%', border: 'none', background: 'var(--rouge-emig)',
                              color: 'white', fontSize: '0.8rem', cursor: 'pointer', lineHeight: 1,
                            }}
                          >×</button>
                        </div>
                      ))}
                      {editPhotos.length === 0 && <span style={{ color: 'var(--encre-douce)', fontSize: '0.9rem' }}>Aucune photo.</span>}
                    </div>
                    <label className="bouton bouton--secondaire bouton--petit" style={{ cursor: 'pointer', marginTop: 12, display: 'inline-block' }}>
                      + Ajouter des photos
                      <input
                        type="file" accept="image/*" multiple style={{ display: 'none' }}
                        onChange={(e) => ajouterPhotosEdition(Array.from(e.target.files))}
                      />
                    </label>
                  </div>

                  {editStatut === 'erreur' && <p className="message-erreur">La modification a échoué.</p>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button className="bouton" onClick={enregistrerEdition} disabled={editStatut === 'envoi'}>
                      {editStatut === 'envoi' ? 'Enregistrement…' : 'Enregistrer les modifications'}
                    </button>
                    <button className="bouton bouton--secondaire" onClick={fermerEdition}>Annuler</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
