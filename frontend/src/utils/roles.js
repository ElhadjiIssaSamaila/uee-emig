// Intitulés complets des 7 postes du bureau de l'UEE, dans l'ordre protocolaire
export const ROLE_ORDER = ['SG', 'SG/A', 'SCP', 'SCAA', 'SCAS', 'SCACS', 'SCTG']

export const ROLE_LABELS = {
  'SG': 'Secrétaire Général',
  'SG/A': 'Secrétaire Général Adjoint',
  'SCP': 'Secrétaire Chargé des Programmes',
  'SCAA': 'Secrétaire Chargé des Affaires Académiques',
  'SCAS': 'Secrétaire Chargé des Affaires Sociales',
  'SCACS': 'Secrétaire Chargé des Activités Culturelles et Sportives',
  'SCTG': 'Secrétaire Chargé de la Trésorerie Générale',
}

export function sortByRole(members) {
  return [...members].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
  )
}

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

// Formate une date ISO (YYYY-MM-DD) en "12 mars 2026", sans dépendre du fuseau du navigateur
export function formatDateLong(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-').map(Number)
  return `${d} ${MOIS[m - 1]} ${y}`
}

export function formatDayMonth(isoDate) {
  if (!isoDate) return { jour: '', mois: '', annee: '' }
  const [y, m, d] = isoDate.split('-').map(Number)
  return { jour: String(d).padStart(2, '0'), mois: MOIS[m - 1].slice(0, 3), annee: String(y) }
}

export function formatDateTime(isoDateTime) {
  if (!isoDateTime) return ''
  const dt = new Date(isoDateTime)
  return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
