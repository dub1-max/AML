// src/App.tsx
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

// Import MainApp directly for faster loading
import MainApp from './MainApp';

// Only lazy-load components that aren't critical for the main user flow
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const EditProfile = lazy(() => import('./EditProfile'));
const Credits = lazy(() => import('./pages/Credits'));
// KycBox component removed in favor of static KYCSync page

// Loading component with minimal footprint
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

// Preload helper
const preloadComponent = (importFn: () => Promise<any>) => {
    importFn();
};

// Preload the EditProfile component when authenticated
const PreloadEditProfile = () => {
    const { isAuthenticated } = useAuth();
    
    useEffect(() => {
        if (isAuthenticated) {
            // Preload EditProfile after a delay when user is authenticated
            const timer = setTimeout(() => {
                preloadComponent(() => import('./EditProfile'));
            }, 2000); // 2-second delay
            
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);
    
    return null;
};

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
                <PreloadEditProfile />
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/mainapp" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
                        <Route path="/edit-profile/:id" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                        <Route path="/credits" element={<ProtectedRoute><Credits /></ProtectedRoute>} />
                        {/* Direct to KYCSync documentation without a double redirect */}
                        <Route path="/" element={<Navigate to="/kycbox/index.html" replace />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </Router>
    );
}

export default App;