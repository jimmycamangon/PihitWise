import { getToken } from '../lib/token'
import { Navigate, Outlet } from "react-router-dom";


export default function GuestRoute() {
    const token = getToken();
    if (token) return <Navigate to="/dashboard" replace />
    return <Outlet />
}