import kitService from '../services/kitService.js'
import { useAsync } from './useAsync.js'

// Daftar seluruh kit di hangar
export const useKits = () => useAsync(() => kitService.getAll(), [])

// Satu kit berdasarkan id
export const useKitById = (id) => useAsync(() => kitService.getById(id), [id])
