import { useEffect, useState } from 'react'
import api, { mediaUrl } from '../../api/client.js'
import { ROLE_ORDER, ROLE_LABELS } from '../../utils/roles.js'

const GESTION_VIDE = { label: '', start_date: '', end_date: '', is_current: true }
const MEMBRE_VIDE = { first_name: '', last_name: '', option: '' }

export default function BureauPanel() {
  const [gestions, setGestions] = useState(null)
  const [ouverte, setOuverte] = useState(null)
  const [formGestion, setFormGestion] = useState(GESTION_VIDE)
  const [erreur, setErreur] = useState(null)

  async function charger() {
    const res = await api.get('/api/mandates')
    setGestions(res.data)
    if (ouverte === null && res.data.length > 0) setOuverte(res.data[0].id)
  }

  useEffect(() => { charger() }, [])

  async function creerGestion(e) {
    e.preventDefault()
    setErreur(null)
    try {
      await api.post('/api/mandates', {
        ...formGestion,
        end_date: formGestion.end_date || null,
      })
      setFormGestion(GESTION_VIDE)
      charger()
    } catch (err) {
      setErreur(err?.response?.data?.detail || "La création de la gestion a échoué.")
    }
  }

  async function supprimerGestion(id) {
    if (!window.confirm('Supprimer cette gestion et tous ses membres ?')) return
    await api.delete(`/api/mandates/${id}`)
    charger()
  }

  return (
    <>
      <div className="panneau">
        <h3>Nouvelle gestion (mandat)</h3>
        <form onSubmit={creerGestion}>
          <div className="grille-form">
            <div className="pleine">
              <label htmlFor="label">Intitulé</label>
              <input
                id="label" required placeholder="Ex. : Gestion 2026 - 2027" value={formGestion.label}
                onChange={(e) => setFormGestion({ ...formGestion, label: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="start_date">Début</label>
              <input
                id="start_date" type="date" required value={formGestion.start_date}
                onChange={(e) => setFormGestion({ ...formGestion, start_date: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="end_date">Fin (optionnel)</label>
              <input
                id="end_date" type="date" value={formGestion.end_date}
                onChange={(e) => setFormGestion({ ...formGestion, end_date: e.target.value })}
              />
            </div>
            <div className="pleine" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                id="is_current" type="checkbox" style={{ width: 'auto' }} checked={formGestion.is_current}
                onChange={(e) => setFormGestion({ ...formGestion, is_current: e.target.checked })}
              />
              <label htmlFor="is_current" style={{ margin: 0 }}>Gestion actuellement en fonction</label>
            </div>
          </div>
          {erreur && <p className="message-erreur">{erreur}</p>}
          <button className="bouton" type="submit" style={{ marginTop: 16 }}>Créer la gestion</button>
        </form>
      </div>

      {gestions?.map((g) => (
        <div className="panneau" key={g.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ cursor: 'pointer' }} onClick={() => setOuverte(ouverte === g.id ? null : g.id)}>
              {g.label} {g.is_current && <span className="etiquette-ok">en fonction</span>}
            </h3>
            <button className="bouton bouton--danger bouton--petit" onClick={() => supprimerGestion(g.id)}>Supprimer</button>
          </div>
          {ouverte === g.id && <SlotsMembres gestion={g} onChange={charger} />}
        </div>
      ))}
    </>
  )
}

function SlotsMembres({ gestion, onChange }) {
  const [editionRole, setEditionRole] = useState(null)
  const [form, setForm] = useState(MEMBRE_VIDE)
  const [fichier, setFichier] = useState(null)

  function ouvrirEdition(role, membre) {
    setEditionRole(role)
    setForm(membre ? { first_name: membre.first_name, last_name: membre.last_name, option: membre.option || '', id: membre.id } : MEMBRE_VIDE)
    setFichier(null)
  }

  async function enregistrer(role) {
    let membre
    if (form.id) {
      const res = await api.put(`/api/members/${form.id}`, {
        first_name: form.first_name, last_name: form.last_name, option: form.option, role,
      })
      membre = res.data
    } else {
      const res = await api.post('/api/members', {
        mandate_id: gestion.id, role,
        first_name: form.first_name, last_name: form.last_name, option: form.option,
      })
      membre = res.data
    }
    if (fichier) {
      const donnees = new FormData()
      donnees.append('file', fichier)
      const televerse = await api.post('/api/upload/members', donnees, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await api.put(`/api/members/${membre.id}/photo`, null, { params: { file_path: televerse.data.file_path } })
    }
    setEditionRole(null)
    onChange()
  }

  async function supprimerMembre(id) {
    if (!window.confirm('Retirer ce membre du bureau ?')) return
    await api.delete(`/api/members/${id}`)
    onChange()
  }

  return (
    <div className="grille-membres" style={{ marginTop: 18 }}>
      {ROLE_ORDER.map((role) => {
        const membre = gestion.members.find((m) => m.role === role)
        const enEdition = editionRole === role
        return (
          <div className="carte-membre" key={role}>
            <div className="carte-membre__corps">
              <div className="carte-membre__poste">{role} — {ROLE_LABELS[role]}</div>

              {!enEdition && membre && (
                <>
                  {membre.photo_path && (
                    <div className="miniatures-televerses"><img src={mediaUrl(membre.photo_path)} alt="" /></div>
                  )}
                  <div className="carte-membre__nom">{membre.first_name} {membre.last_name}</div>
                  {membre.option && <div className="carte-membre__option">{membre.option}</div>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="bouton bouton--secondaire bouton--petit" onClick={() => ouvrirEdition(role, membre)}>Modifier</button>
                    <button className="bouton bouton--danger bouton--petit" onClick={() => supprimerMembre(membre.id)}>Retirer</button>
                  </div>
                </>
              )}

              {!enEdition && !membre && (
                <button className="bouton bouton--secondaire bouton--petit" style={{ marginTop: 10 }} onClick={() => ouvrirEdition(role, null)}>
                  + Ajouter un membre
                </button>
              )}

              {enEdition && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  <input placeholder="Prénom" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                  <input placeholder="Nom" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                  <input placeholder="Option / filière" value={form.option} onChange={(e) => setForm({ ...form, option: e.target.value })} />
                  <input type="file" accept="image/*" onChange={(e) => setFichier(e.target.files[0])} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="bouton bouton--petit" onClick={() => enregistrer(role)}>Enregistrer</button>
                    <button className="bouton bouton--secondaire bouton--petit" onClick={() => setEditionRole(null)}>Annuler</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
