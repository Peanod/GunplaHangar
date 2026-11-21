import logService from '../services/logService.js'
import { useAsync } from './useAsync.js'

export const useLogs = () => useAsync(() => logService.getAll(), [])
export const useLogById = (id) => useAsync(() => logService.getById(id), [id])
