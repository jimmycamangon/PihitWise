// An "Other" expense: anything that is not a fill-up or a service.
export interface OtherExpense {
    id: string
    vehicleId: string
    date: string
    label: string
    cost: number
    notes: string | null
    createdAt: string
}

export interface OtherExpenseRequest {
    date: string
    label: string
    cost: number
    notes: string | null
}
