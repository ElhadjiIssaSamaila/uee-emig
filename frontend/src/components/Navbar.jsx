import { NavLink } from 'react-router-dom'

const liens = [
  { to: '/', label: 'Accueil', fin: true },
  { to: '/galerie', label: 'Galerie' },
  { to: '/bureau', label: 'Bureau' },
]

export default function Navbar() {
  return (
    <header className="masthead">
      <div className="enveloppe masthead__barre">
        <NavLink to="/" className="masthead__identite" style={{ textDecoration: 'none' }}>
          <img src="/logo-emig.png" alt="Logo de l'EMIG" />
          <div>
            <div className="masthead__ecole">École des Mines, de l'Industrie et de la Géologie</div>
            <div className="masthead__nom">Union des Élèves de l'EMIG (UEE)</div>
          </div>
        </NavLink>
        <nav className="masthead__nav">
          {liens.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.fin}
              className={({ isActive }) => (isActive ? 'actif' : undefined)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
