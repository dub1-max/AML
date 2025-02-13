// MainApp.tsx
import React, { useState, useEffect } from 'react';
import {
    Search, FileText, Shield, LogOut, Link, Users, File
} from 'lucide-react';
import type { SearchResult, Tracking } from './types';
import { useAuth } from './AuthContext';
import ActivityDashboard from './Insights';
import Profiles from './Profiles';
import { useNavigate } from 'react-router-dom';
// Import the new components
import IndividualOB from './IndividualOB';
import CompanyOB from './CompanyOB';


const API_BASE_URL = 'http://localhost:3001/api';

interface MainAppProps { }

function MainApp(_props: MainAppProps) {
    const { user, logout } = useAuth();
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchId, setSearchId] = useState('');
    const [tracking, setTracking] = useState<Tracking>({});
    const [trackedResults, setTrackedResults] = useState<SearchResult[]>([]);
    const [showDashboard, setShowDashboard] = useState(true);
    const [activeSection, setActiveSection] = useState<'insights' | 'profiles' | 'deepLink' | 'selfService' | 'bulk'>('insights');
    const [deepLinkSubSection, setDeepLinkSubSection] = useState<'individual' | 'company' | null>(null);
    const [showIndividualOB, setShowIndividualOB] = useState(false); // State for Individual Onboarding page
    const [showCompanyOB, setShowCompanyOB] = useState(false);       // State for Company Onboarding page



    const navigate = useNavigate();

    const fetchTrackedData = async () => {
        if (!user) return;

        try {
            const response = await fetch(`${API_BASE_URL}/tracking`, {
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            const trackingData: any[] = await response.json();
            const transformedTracking: Tracking = {};

            trackingData.forEach(item => {
                transformedTracking[item.name] = {
                    isTracking: item.isTracking === 1,
                    startDate: item.startDate,
                    stopDate: item.stopDate
                };
            });

            setTracking(transformedTracking);
        } catch (error) {
            console.error('Could not fetch tracked data:', error);
            setTracking({});
        }
    };

    useEffect(() => {
        fetchTrackedData();
    }, [user, navigate]);

    useEffect(() => {
        const fetchTracked = async () => {
            if (Object.keys(tracking).length === 0) {
                setTrackedResults([]);
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/persons`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        navigate('/login');
                        return;
                    }
                    throw new Error(`HTTP Error! Status: ${response.status}`);
                }

                const allResults: SearchResult[] = await response.json();
                const tracked = allResults.filter(result => tracking[result.name]?.isTracking);
                setTrackedResults(tracked);
            } catch (error) {
                console.error('Could not fetch tracked results:', error);
                setTrackedResults([]);

            }
        };
        fetchTracked();
    }, [tracking, user, navigate]);

    const handleSearch = async () => {
        if (!searchTerm && !searchId) {
            setSearchResults([]);
            return;
        }
        setIsLoading(true);

        try {
            const url = new URL(`${API_BASE_URL}/persons/search`);
            if (searchTerm) url.searchParams.append('searchTerm', searchTerm);
            if (searchId) url.searchParams.append('searchId', searchId);

            const response = await fetch(url.toString(), {
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SearchResult[] = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };
    const handleDeepLinkClick = () => {
        if (activeSection === 'deepLink') {
            setActiveSection('insights'); // Or any other default section
            setDeepLinkSubSection(null);
            setShowCompanyOB(false);
            setShowIndividualOB(false)
        } else {
            setActiveSection('deepLink');
            setDeepLinkSubSection('individual'); // Set a default sub-section
            setShowIndividualOB(true); //show by default
            setShowCompanyOB(false);
        }
    };

    const handleIndividualOBClick = () => {
        setDeepLinkSubSection('individual');
        setShowIndividualOB(true);
        setShowCompanyOB(false);
        setShowDashboard(false); // Add this to hide dashboard
        setActiveSection('deepLink'); // Add this to ensure correct sidebar highlighting

    }

    const handleCompanyOBClick = () => {
        setDeepLinkSubSection('company');
        setShowCompanyOB(true);
        setShowIndividualOB(false);
        setShowDashboard(false); // Add this to hide dashboard
        setActiveSection('deepLink'); // Add this to ensure correct sidebar highlighting
    }


    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-[#4A1D96] text-white">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-8">AML Checker</h1>
                    <nav className="space-y-2">
                        <button
                            onClick={() => {
                                setShowDashboard(true);
                                setActiveSection('insights');
                                setShowCompanyOB(false);
                                setShowIndividualOB(false);
                            }}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${activeSection === 'insights'
                                ? 'bg-[#5D2BA8] text-white'
                                : 'hover:bg-[#5D2BA8]'
                                }`}
                        >
                            <Shield className="w-5 h-5" />
                            <span>Insights</span>
                        </button>
                        <button
                            onClick={() => {
                                setShowDashboard(false);
                                setActiveSection('profiles');
                                setShowCompanyOB(false);
                                setShowIndividualOB(false);
                            }}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg  text-gray-300 ${activeSection === 'profiles'
                                ? 'bg-[#5D2BA8] text-white'
                                : 'hover:bg-[#5D2BA8]'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span>Profiles</span>
                        </button>

                        {/* Deep Link Onboarding Button and Sub-Options */}
                        <button
                            onClick={handleDeepLinkClick}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${activeSection === 'deepLink'
                                ? 'bg-[#5D2BA8] text-white'
                                : 'hover:bg-[#5D2BA8]'
                                }`}
                        >
                            <Link className="w-5 h-5" />
                            <span>Deep Link Onboarding</span>
                        </button>
                        {activeSection === 'deepLink' && (
                            <div className="ml-8">
                                <button
                                    onClick={handleIndividualOBClick}
                                    className={`block w-full p-2 text-left text-gray-300 hover:bg-[#5D2BA8] rounded ${deepLinkSubSection === 'individual' ? 'bg-[#5D2BA8]' : ''}`}
                                >
                                    Individual Onboarding
                                </button>
                                <button
                                    onClick={handleCompanyOBClick}
                                    className={`block w-full p-2 text-left text-gray-300 hover:bg-[#5D2BA8] rounded ${deepLinkSubSection === 'company' ? 'bg-[#5D2BA8]' : ''}`}

                                >
                                    Company Onboarding
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setActiveSection('selfService');
                                setShowCompanyOB(false);
                                setShowIndividualOB(false);
                                setShowDashboard(false); // Add this to ensure correct view

                            }}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${activeSection === 'selfService'
                                ? 'bg-[#5D2BA8] text-white'
                                : 'hover:bg-[#5D2BA8]'
                                }`}
                        >
                            <Users className="w-5 h-5" />
                            <span>Self Service Onboarding</span>
                        </button>
                        <button
                            onClick={() => {
                                setActiveSection('bulk');
                                setShowCompanyOB(false);
                                setShowIndividualOB(false);
                                setShowDashboard(false); // Add this to ensure correct view
                            }}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${activeSection === 'bulk'
                                ? 'bg-[#5D2BA8] text-white'
                                : 'hover:bg-[#5D2BA8]'
                                }`}
                        >
                            <File className="w-5 h-5" />
                            <span>Bulk Onboarding</span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <header className="bg-white border-b border-gray-200">
                    <div className="flex justify-between items-center px-6 py-4">
                        <h2 className="text-xl font-semibold">
                            {/*Correct Title */}
                            {showDashboard ? 'Activity Dashboard' : 
                             showIndividualOB ? 'Individual Onboarding' :
                             showCompanyOB ? 'Company Onboarding' :
                            'Alerts'}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name}`}
                                    alt={user?.name || 'User'}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="text-sm font-medium">
                                    {user?.name || 'User'}
                                </span>
                                <button
                                    onClick={async () => {
                                        await logout();
                                        navigate('/login');
                                    }}
                                    className="ml-4 text-gray-600 hover:text-gray-800"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {!showDashboard && !showIndividualOB && !showCompanyOB && (
                        <div className="px-6 py-3 flex items-center space-x-4 border-t border-gray-200">
                            <div className="flex space-x-2">
                                <button className="px-4 py-1 rounded-full bg-[#4A1D96] text-white text-sm">
                                    All
                                </button>

                            </div>

                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by name"
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    placeholder="Search by ID"
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-2 bg-[#4A1D96] text-white rounded-lg text-sm"
                                >
                                    APPLY
                                </button>
                            </div>
                        </div>
                    )}
                </header>

                {/* Conditionally render Insights, Profiles, IndividualOB, or CompanyOB */}
                {showDashboard ? (
                    Object.keys(tracking).length > 0 ? (
                        <ActivityDashboard trackedResults={trackedResults} tracking={tracking} />
                    ) : (
                        <div>Loading...</div>
                    )
                ) : showIndividualOB ? (
                    <IndividualOB />
                ) : showCompanyOB ? (
                    <CompanyOB />
                ) : (
                    <Profiles
                        searchResults={searchResults}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );

}

export default MainApp;