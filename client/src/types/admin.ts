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

export interface AdminUsersPage {
    items: AdminUser[]
    total: number           // users matching the search
    page: number
    pageSize: number
    totalUsers: number
    newThisMonth: number
    activeLast30Days: number
}
