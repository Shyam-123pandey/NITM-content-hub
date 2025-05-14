import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2563eb',
            light: '#60a5fa',
            dark: '#1d4ed8',
            contrastText: '#fff',
        },
        secondary: {
            main: '#7c3aed',
            light: '#a78bfa',
            dark: '#5b21b6',
            contrastText: '#fff',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#000000',
            secondary: '#374151',
        },
    },
    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontSize: '2.5rem',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: '#000000',
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: '#000000',
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: '#000000',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: '#000000',
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: '#000000',
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: '#000000',
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                contained: {
                    background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
                    '&:hover': {
                        background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)',
                    },
                },
                outlined: {
                    borderWidth: 2,
                    '&:hover': {
                        borderWidth: 2,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        '& fieldset': {
                            borderColor: '#e5e7eb',
                        },
                        '&:hover fieldset': {
                            borderColor: '#2563eb',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#2563eb',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: '#374151',
                        '&.Mui-focused': {
                            color: '#2563eb',
                        },
                    },
                    '& .MuiInputBase-input': {
                        color: '#000000',
                    },
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    color: '#000000',
                    '&::placeholder': {
                        color: '#6b7280',
                        opacity: 1,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e5e7eb',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2563eb',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2563eb',
                    },
                },
                input: {
                    color: '#000000',
                    '&::placeholder': {
                        color: '#6b7280',
                        opacity: 1,
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: '#374151',
                    '&.Mui-focused': {
                        color: '#2563eb',
                    },
                },
            },
        },
    },
    shape: {
        borderRadius: 8,
    },
});

export default theme; 