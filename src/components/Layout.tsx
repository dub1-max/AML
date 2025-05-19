import React from 'react';
import {
    Search, FileText, Shield, LogOut, Link, Users, CreditCard, ChevronDown
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
    activeSection?: 'insights' | 'profiles' | 'deepLink' | 'selfService' | 'bulk' | 'activeTracking';
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

    // Default handlers if not provided
    const defaultNavHandler = (section: string) => {
        console.log(`Navigation to: ${section}`);
        navigate('/mainapp');
    };

    const defaultDeepLinkHandler = () => {
        console.log('Deep link clicked');
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

    const handleCreditsClick = () => {
        navigate('/credits');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Fixed Sidebar */}
            <div className="w-64 bg-[#4A1D96] text-white fixed h-screen z-10">
                <div className="p-6 flex flex-col h-full">
                    <h1 className="text-2xl font-bold mb-6">AML Checker</h1>
                    
                    <nav className="space-y-2 mb-24">
                        <button
                            onClick={() => navHandler('insights')}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${
                                activeSection === 'insights' ? 'bg-[#5D2BA8] text-white' : 'hover:bg-[#5D2BA8]'
                            }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span>Insights</span>
                        </button>

                        <button
                            onClick={() => navHandler('activeTracking')}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${
                                activeSection === 'activeTracking' ? 'bg-[#5D2BA8] text-white' : 'hover:bg-[#5D2BA8]'
                            }`}
                        >
                            <Shield className="w-5 h-5" />
                            <span>Screening</span>
                        </button>

                        <button
                            onClick={() => navHandler('profiles')}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${
                                activeSection === 'profiles' ? 'bg-[#5D2BA8] text-white' : 'hover:bg-[#5D2BA8]'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            <span>Search Profiles</span>
                        </button>

                        {/* Deep Link Onboarding Button and Sub-Options */}
                        <div className="relative">
                            <button
                                onClick={deepLinkHandler}
                                className={`flex items-center justify-between w-full p-3 rounded-lg text-gray-300 ${activeSection === 'deepLink'
                                    ? 'bg-[#5D2BA8] text-white'
                                    : 'hover:bg-[#5D2BA8]'
                                    }`}
                                aria-expanded={activeSection === 'deepLink'}
                                aria-controls="deeplink-submenu"
                            >
                                <div className="flex items-center space-x-3">
                                    <Link className="w-5 h-5" />
                                    <span>Deep Link Onboarding</span>
                                </div>
                                <ChevronDown 
                                    className={`w-4 h-4 transition-transform duration-200 ${
                                        activeSection === 'deepLink' ? 'transform rotate-180' : ''
                                    }`} 
                                />
                            </button>
                            
                            {/* Submenu with transition */}
                            <div 
                                id="deeplink-submenu"
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                    activeSection === 'deepLink' ? 'max-h-24 mt-1 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <div className="py-1 pl-4 pr-2 bg-[#421C87] rounded-lg">
                                    <button
                                        onClick={individualHandler}
                                        className={`flex items-center w-full py-2 px-3 text-left text-gray-300 rounded transition-colors duration-150 ${
                                            deepLinkSubSection === 'individual' 
                                                ? 'bg-[#5D2BA8] text-white' 
                                                : 'hover:bg-[#5D2BA8] hover:text-white'
                                        }`}
                                    >
                                        <span className="text-sm">Individual Onboarding</span>
                                    </button>
                                    <button
                                        onClick={companyHandler}
                                        className={`flex items-center w-full py-2 px-3 text-left text-gray-300 rounded transition-colors duration-150 ${
                                            deepLinkSubSection === 'company' 
                                                ? 'bg-[#5D2BA8] text-white' 
                                                : 'hover:bg-[#5D2BA8] hover:text-white'
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
                            className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 hover:bg-[#5D2BA8]"
                        >
                            <CreditCard className="w-5 h-5" />
                            <span>Manage Credits</span>
                        </button>
                    </nav>
                    
                    {/* User profile and credits display - fixed at bottom */}
                    <div className="mt-auto">
                        <div className="bg-[#3D1678] rounded-lg p-3">
                            <div className="flex items-center mb-2">
                                <div className="w-10 h-10 rounded-full bg-purple-300 flex items-center justify-center text-purple-800 font-bold mr-3">
                                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div className="font-medium">{user?.name || user?.email?.split('@')[0] || 'User'}</div>
                                    <div className="text-xs text-purple-300">{user?.email || ''}</div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-purple-300">Credits</span>
                                <span className="font-medium">
                                    {loadingCredits ? "..." : credits}
                                </span>
                            </div>
                            
                            <button
                                onClick={async () => {
                                    await logout();
                                    navigate('/login');
                                }}
                                className="flex items-center space-x-3 w-full p-2 mt-3 rounded-lg text-gray-300 hover:bg-[#4A1D96] text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - with left padding to account for fixed sidebar */}
            <div className="flex-1 pl-64">
                {children}
            </div>
        </div>
    );
};

export default Layout; 