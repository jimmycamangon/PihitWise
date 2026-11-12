export type ReminderStatus = 'overdue' | 'soon' | 'ok' | 'done'

export interface Reminder {
    id: string
    vehicleId: string
    title: string
    createdAt: string
    dueOdometer: number | null
    dueDate: string | null
    isDone: boolean
    status: ReminderStatus
    kmLeft: number | null
    daysLeft: number | null
}

export interface ReminderRequest {
    title: string
    dueOdometer: number | null
    dueDate: string | null
}
