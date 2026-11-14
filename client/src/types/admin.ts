export interface AdminUser {
    id: string
    fullName: string
    email: string
    createdAt: string
    lastActiveAt: string | null
    bikes: number
    fuelLogs: number
    serviceLogs: number
    expenses: number
    reminders: number
}
