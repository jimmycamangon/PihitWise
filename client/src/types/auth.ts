export interface User {
    id: string
    fullName: string
    email: string
}

export interface LoginResult {
    token: string
    user: User
}

export interface Me {
    id: string
    email: string
    name: string
}