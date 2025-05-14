import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const GoogleAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithGoogle } = useAuth();

    useEffect(() => {
        const handleGoogleCallback = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const token = params.get('token');
                
                if (token) {
                    await loginWithGoogle(token);
                    navigate('/');
                } else {
                    console.error('No token found in URL');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Google auth callback error:', error);
                navigate('/login');
            }
        };

        handleGoogleCallback();
    }, [location, navigate, loginWithGoogle]);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            }}
        >
            <CircularProgress />
        </Box>
    );
};

export default GoogleAuthCallback; 