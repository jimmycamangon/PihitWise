export interface User {
    id: string
    fullName: string
    email: string
}

export interface LoginResult {
    token: string
    user: User
}