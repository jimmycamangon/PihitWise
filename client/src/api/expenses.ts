import type { OtherExpense, OtherExpenseRequest } from '../types/expenses'
import { loggable } from './loggable'

const expenses = loggable<OtherExpense, OtherExpenseRequest>('expense', (v) => `/api/vehicles/${v}/expenses`, (id) => `/api/expenses/${id}`)

export const getOtherExpenses = expenses.list
export const createOtherExpense = expenses.create
export const updateOtherExpense = expenses.update
export const deleteOtherExpense = expenses.remove
