// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

// Replace direct imports with lazy loading
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const MainApp = lazy(() => import('./MainApp'));
const EditProfile = lazy(() => import('./EditProfile'));

// Loading component with minimal footprint
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

interface ProtectedRouteProps {
    children: JSX.Element;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/mainapp" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
                        <Route path="/edit-profile/:id" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                        <Route path="/" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </Router>
    );
}

export default App;