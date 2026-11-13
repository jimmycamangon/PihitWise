import { getToken } from '../lib/token'
import { Navigate, Outlet } from "react-router-dom";


export default function ProtectedRoute() {
    const token = getToken();
    if (!token) return <Navigate to="/login" replace />
    return <Outlet />
}