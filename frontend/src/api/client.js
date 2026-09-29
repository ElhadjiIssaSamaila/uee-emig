import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('uee_admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Construit l'URL complète d'une image servie par le backend (/uploads/...)
export function mediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_URL}${path}`
}

export default api
