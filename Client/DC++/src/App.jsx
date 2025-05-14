import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import theme from './theme';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import OnboardingFlow from './pages/OnboardingFlow';
import Chat from './pages/Chat';
import CreateChat from './pages/CreateChat';
import Discussions from './pages/Discussions';
import Calendar from './pages/Calendar';
import Opportunities from './pages/Opportunities';
import Profile from './pages/Profile'
import Content from './pages/Content'
import FilterOnboarding from './pages/FilterOnboarding';
import Settings from './components/Settings';

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <FilterProvider>
                    <Router>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Main Routes */}
                            <Route path="/" element={<Layout />}>
                                <Route index element={
                                    <FilterOnboarding>
                                        <Home />
                                    </FilterOnboarding>
                                } />
                                {/* <Route path="onboarding" element={
                                    <FilterOnboarding>
                                        <OnboardingFlow />
                                    </FilterOnboarding>
                                } /> */}
                                <Route path="chat" element={
                                        <Chat />
                                } />
                                <Route path="create-chat" element={
                                        <CreateChat />
                                } />
                                <Route path="discussions" element={
                                        <Discussions />
                                } />
                                <Route path='profile' element={
                                        <Profile />
                                }/>
                                <Route path='settings' element={
                                        <Settings/>
                                }/>
                                <Route path='content' element={
                                        <Content />
                                }/>
                                <Route path="calendar" element={
                                        <Calendar />
                                } />
                                <Route path="opportunities" element={
                                        <Opportunities />
                                } />
                            </Route>

                            {/* Catch all route */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </Router>
                </FilterProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
