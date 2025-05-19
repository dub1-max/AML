import React, { useState } from 'react';
import {
    Search, FileText, Shield, LogOut, Link, Users, CreditCard, ChevronDown
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
    activeSection?: 'insights' | 'profiles' | 'deepLink' | 'selfService' | 'bulk' | 'activeTracking' | 'credits';
    deepLinkSubSection?: 'individual' | 'company' | null;
    credits?: number;
    loadingCredits?: boolean;
    handleSidebarNavigation?: (section: string) => void;
    handleDeepLinkClick?: () => void;
    handleIndividualOBClick?: () => void;
    handleCompanyOBClick?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
    children,
    activeSection = 'insights',
    deepLinkSubSection = null,
    credits = 0,
    loadingCredits = false,
    handleSidebarNavigation,
    handleDeepLinkClick,
    handleIndividualOBClick,
    handleCompanyOBClick
}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    // Local state to handle dropdown when handleDeepLinkClick is not provided
    const [isDeepLinkOpen, setIsDeepLinkOpen] = useState(activeSection === 'deepLink');

    // Default handlers if not provided
    const defaultNavHandler = (section: string) => {
        console.log(`Navigation to: ${section}`);
        navigate('/mainapp');
    };

    const defaultDeepLinkHandler = () => {
        console.log('Deep link clicked');
        setIsDeepLinkOpen(!isDeepLinkOpen);
    };

    const defaultIndividualHandler = () => {
        console.log('Individual onboarding clicked');
    };

    const defaultCompanyHandler = () => {
        console.log('Company onboarding clicked');
    };

    // Use provided handlers or fallback to defaults
    const navHandler = handleSidebarNavigation || defaultNavHandler;
    const deepLinkHandler = handleDeepLinkClick || defaultDeepLinkHandler;
    const individualHandler = handleIndividualOBClick || defaultIndividualHandler;
    const companyHandler = handleCompanyOBClick || defaultCompanyHandler;

    // Dropdown is expanded either through parent state or local state
    const isDropdownOpen = activeSection === 'deepLink' || isDeepLinkOpen;

    const handleCreditsClick = () => {
        navigate('/credits');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Fixed Sidebar */}
            <div className="w-64 bg-white text-gray-700 fixed h-screen z-10 border-r border-gray-200 shadow-sm">
                <div className="p-6 flex flex-col h-full">
                    <h1 className="text-2xl font-bold mb-8 text-purple-800">AML Checker</h1>
                    
                    <nav className="space-y-1 mb-24">
                        <button
                            onClick={() => navHandler('insights')}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
                                activeSection === 'insights' 
                                ? 'bg-purple-100 text-purple-800 font-medium' 
                                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                            }`}
                        >
                            <FileText className={`w-5 h-5 ${activeSection === 'insights' ? 'text-purple-700' : 'text-gray-500'}`} />
                            <span>Insights</span>
                        </button>

                        <button
                            onClick={() => navHandler('activeTracking')}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
                                activeSection === 'activeTracking' 
                                ? 'bg-purple-100 text-purple-800 font-medium' 
                                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                            }`}
                        >
                            <Shield className={`w-5 h-5 ${activeSection === 'activeTracking' ? 'text-purple-700' : 'text-gray-500'}`} />
                            <span>Screening</span>
                        </button>

                        <button
                            onClick={() => navHandler('profiles')}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
                                activeSection === 'profiles' 
                                ? 'bg-purple-100 text-purple-800 font-medium' 
                                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                            }`}
                        >
                            <Users className={`w-5 h-5 ${activeSection === 'profiles' ? 'text-purple-700' : 'text-gray-500'}`} />
                            <span>Search Profiles</span>
                        </button>

                        {/* Deep Link Onboarding Button and Sub-Options */}
                        <div className="relative">
                            <button
                                onClick={deepLinkHandler}
                                className={`flex items-center justify-between w-full p-3 rounded-lg ${
                                    isDropdownOpen 
                                    ? 'bg-purple-100 text-purple-800 font-medium' 
                                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                                }`}
                                aria-expanded={isDropdownOpen}
                                aria-controls="deeplink-submenu"
                            >
                                <div className="flex items-center space-x-3">
                                    <Link className={`w-5 h-5 ${isDropdownOpen ? 'text-purple-700' : 'text-gray-500'}`} />
                                    <span>Deep Link Onboarding</span>
                                </div>
                                <ChevronDown 
                                    className={`w-4 h-4 transition-transform duration-200 ${
                                        isDropdownOpen ? 'transform rotate-180 text-purple-700' : 'text-gray-500'
                                    }`} 
                                />
                            </button>
                            
                            {/* Submenu with transition */}
                            <div 
                                id="deeplink-submenu"
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                    isDropdownOpen ? 'max-h-24 mt-1 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <div className="py-1 pl-4 pr-2 ml-3 border-l-2 border-purple-200 rounded-lg">
                                    <button
                                        onClick={individualHandler}
                                        className={`flex items-center w-full py-2 px-3 text-left rounded transition-colors duration-150 ${
                                            deepLinkSubSection === 'individual' 
                                                ? 'bg-purple-50 text-purple-800 font-medium' 
                                                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                                        }`}
                                    >
                                        <span className="text-sm">Individual Onboarding</span>
                                    </button>
                                    <button
                                        onClick={companyHandler}
                                        className={`flex items-center w-full py-2 px-3 text-left rounded transition-colors duration-150 ${
                                            deepLinkSubSection === 'company' 
                                                ? 'bg-purple-50 text-purple-800 font-medium' 
                                                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                                        }`}
                                    >
                                        <span className="text-sm">Company Onboarding</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Credits Management */}
                        <button
                            onClick={handleCreditsClick}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
                                activeSection === 'credits' 
                                ? 'bg-purple-100 text-purple-800 font-medium' 
                                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                            }`}
                        >
                            <CreditCard className={`w-5 h-5 ${activeSection === 'credits' ? 'text-purple-700' : 'text-gray-500'}`} />
                            <span>Manage Credits</span>
                        </button>
                    </nav>
                    
                    {/* User profile and credits display - fixed at bottom */}
                    <div className="mt-auto">
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 font-bold mr-3 shadow-sm">
                                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-800">{user?.name || user?.email?.split('@')[0] || 'User'}</div>
                                    <div className="text-xs text-gray-500">{user?.email || ''}</div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center mb-3 px-2 py-2 bg-white rounded-md shadow-sm">
                                <span className="text-xs text-gray-500">Credits</span>
                                <span className="font-medium text-purple-800">
                                    {loadingCredits ? "..." : credits}
                                </span>
                            </div>
                            
                            <button
                                onClick={async () => {
                                    await logout();
                                    navigate('/login');
                                }}
                                className="flex items-center justify-center space-x-2 w-full p-2 mt-2 rounded-lg text-purple-800 hover:bg-purple-100 text-sm border border-purple-200 transition-colors duration-150"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - with left padding to account for fixed sidebar */}
            <div className="flex-1 pl-64 bg-white">
                {children}
            </div>
        </div>
    );
};

export default Layout; 