import {jwtDecode} from 'jwt-decode'
import { Navigate } from 'react-router-dom';

function ProtectedRoute({children}){
    const token = localStorage.getItem("token");
    
    if (!token) return <Navigate to="/"/> 

    try {
        const decode = jwtDecode(token);
        if (decode.exp * 1000 < Date.now()){
            localStorage.clear();
            return <Navigate to="/"/>;
        }

    } catch {
        localStorage.clear();
        return <Navigate to="/"/>
    }

    return children
}
export default ProtectedRoute