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
    isAdmin?: boolean   // email is in the server's Admin:Emails setting
}