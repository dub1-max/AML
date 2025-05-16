//pages/Login.tsx
import React, { useState, useEffect, memo } from 'react'; 
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

// Preload MainApp for faster transition
const preloadMainApp = () => {
    // This will load the MainApp component in the background
    import('../MainApp').catch(err => console.error('Error preloading MainApp:', err));
};

// Simple memo'd error message component
const ErrorMessage = memo(({ error }: { error: string }) => (
    error ? (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
        </div>
    ) : null
));

// Optimized login form using memo to prevent unnecessary re-renders
const LoginForm = memo(({ 
    email, 
    setEmail, 
    password, 
    setPassword, 
    handleSubmit, 
    loading, 
    error 
}: { 
    email: string, 
    setEmail: (email: string) => void, 
    password: string, 
    setPassword: (password: string) => void, 
    handleSubmit: (e: React.FormEvent) => void, 
    loading: boolean, 
    error: string 
}) => (
    <form className="space-y-6" onSubmit={handleSubmit}>
        <ErrorMessage error={error} />

        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
            </label>
            <div className="mt-1">
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
        </div>

        <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
            </label>
            <div className="mt-1">
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
        </div>

        <div>
            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4A1D96] hover:bg-[#5D2BA8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
                {loading ? 'Signing in...' : 'Sign in'}
            </button>
        </div>
    </form>
));

// Start preloading MainApp as soon as this module loads
if (typeof window !== 'undefined') {
    // Only in browser context
    setTimeout(preloadMainApp, 1000);
}

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    // Use useEffect to redirect after authentication
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/mainapp');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Start preloading MainApp immediately on submit
        preloadMainApp();
        
        const success = await login(email, password);
        if (!success) {
           setError("Invalid Credentials");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">AML Checker</h2>
                <h3 className="mt-6 text-center text-2xl font-bold text-gray-900">
                    Sign in to your account
                </h3>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <LoginForm
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        handleSubmit={handleSubmit}
                        loading={loading}
                        error={error}
                    />

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Don't have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <a
                                href="/register"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#4A1D96] bg-white border-purple-600 hover:bg-gray-50"
                            >
                                Register
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;