import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Add response interceptor for CORS errors
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 0) {
            console.error('CORS Error:', error);
            // You might want to show a user-friendly error message here
        }
        return Promise.reject(error);
    }
);

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    // Fetch user data when token changes
    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching user data with token:', token);
                const response = await axios.get('/api/auth/me');
                console.log('User data received:', response.data);
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
                // If token is invalid, clear it
                if (error.response?.status === 401) {
                    setToken(null);
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            console.log('Attempting login with:', { email });
            const response = await axios.post('/api/auth/login', { email, password });
            console.log('Login response:', response.data);
            setToken(response.data.token);
            setUser(response.data.user);
            return response.data;
        } catch (error) {
            console.error('Login error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                config: error.config
            });
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            console.log('Registering user with data:', userData);
            const response = await axios.post('/api/auth/register', userData);
            console.log('Registration response:', response.data);
            setToken(response.data.token);
            setUser(response.data.user);
            return response.data;
        } catch (error) {
            console.error('Registration error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                config: error.config
            });
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        setToken,
        setUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 