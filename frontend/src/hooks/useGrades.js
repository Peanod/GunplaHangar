import gradeService from '../services/gradeService.js'
import { useAsync } from './useAsync.js'

export const useGrades = () => useAsync(() => gradeService.getAll(), [])
