import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="pied-de-page">
      <div className="enveloppe pied-de-page__lignes">
        <div>
          <strong>Union des Élèves de l'EMIG</strong>
          <div>École des Mines, de l'Industrie et de la Géologie</div>
        </div>
        <div>
          <div>Une activité à partager ? Contactez le bureau de l'UEE.</div>
          <Link to="/admin/connexion">Espace administrateur</Link>
        </div>
      </div>
    </footer>
  )
}
