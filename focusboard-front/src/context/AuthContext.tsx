import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (error) {
                console.log('Invalid/corrupted token', error);
                handleLogout();
            }
        } else {
            setUser(null);
        }
    }, [token]);

    const handleLogin = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    }

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);