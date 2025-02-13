// MainApp.tsx
import React, { useState, useEffect } from 'react';
import {
    Search, AlertCircle, FileText, Shield, LogOut, Loader2, XCircle, Link, Users, File
} from 'lucide-react';
import type { SearchResult, Tracking } from './types';
import { useAuth } from './AuthContext';
import ActivityDashboard from './Profiles';
import { useNavigate } from 'react-router-dom';

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
    const [showDashboard, setShowDashboard] = useState(false);
    const [activeSection, setActiveSection] = useState<'insights' | 'profiles' | 'deepLink' | 'selfService' | 'bulk'>('insights'); // Track active section

    const navigate = useNavigate();

    // Fetch tracked data (corrected headers)
    const fetchTrackedData = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/tracking`, {
                credentials: 'include', // Removed unnecessary headers
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
        } finally {
            setIsLoading(false);
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
            setIsLoading(true);
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
            } finally {
                setIsLoading(false);
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

    // Update tracking (corrected URL and error handling)
    const updateTracking = async (name: string, newTrackingStatus: boolean) => {
        try {
            const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/tracking/</span>{name}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isTracking: newTrackingStatus }),
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                let errorMessage = `Server error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage += ` - ${errorData.message}`;
                } catch (e) {
                    const text = await response.text();
                    errorMessage += ` - ${text}`;
                }
                throw new Error(errorMessage);
            }

            await fetchTrackedData();
        } catch (error: any) {
            console.error('Error updating tracking:', error.message);
        }
    };

    const toggleTracking = (name: string) => {
        const currentTrackingStatus = tracking[name]?.isTracking ?? false;
        updateTracking(name, !currentTrackingStatus);

        setTracking((prevTracking) => {
            const newTracking = { ...prevTracking };
            if (newTracking[name]) {
                newTracking[name] = {
                    ...newTracking[name],
                    isTracking: !newTracking[name].isTracking,
                    stopDate: newTracking[name].isTracking ? new Date().toISOString() : undefined,
                    startDate: newTracking[name].isTracking ? undefined : newTracking[name].startDate
                }
            } else {
                newTracking[name] = {
                    isTracking: true,
                    startDate: new Date().toISOString()
                }
            }
            return newTracking;
        });
    };

    const calculateAging = (result: SearchResult): string => {
        const trackingInfo = tracking[result.name];

        if (trackingInfo?.isTracking) {
            if (trackingInfo.startDate) {
                const startDate = new Date(trackingInfo.startDate);
                const diffInDays = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                return `${diffInDays}D`;
            }
            return '0D';
        } else if (trackingInfo?.stopDate) {
            if (trackingInfo.startDate) {
                const startDate = new Date(trackingInfo.startDate);
                const stopDate = new Date(trackingInfo.stopDate);
                const diffInDays = Math.floor((stopDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                return `<span style="color: red;">${diffInDays}D</span>`;
            }
            return '<span style="color: red;">0D</span>';
        } else {
            return 'None';
        }
    };

    const getRiskColor = (percentage: number): string => {
        if (percentage >= 85) return 'text-red-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-green-600';
    };


    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-[#4A1D96] text-white">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-8">AML Checker</h1>
                    <nav className="space-y-2">
                        
                        <button
                            onClick={() => { setShowDashboard(true); setActiveSection('insights'); }}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${activeSection === 'insights'
                                ? 'bg-[#5D2BA8] text-white'
                                : 'hover:bg-[#5D2BA8]'
                                }`}
                        >
                            <Shield className="w-5 h-5" />
                            <span>Insights</span>
                        </button>
                        <button
                            onClick={() => { setShowDashboard(false); setActiveSection('profiles'); }}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg  text-gray-300 ${activeSection === 'profiles'
                                ? 'bg-[#5D2BA8] text-white'
                                : 'hover:bg-[#5D2BA8]'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span>Profiles</span>
                        </button>
                        {/* New Buttons */}
                        <button
                            onClick={() => setActiveSection('deepLink')}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${activeSection === 'deepLink'
                                ? 'bg-[#5D2BA8] text-white'
                                : 'hover:bg-[#5D2BA8]'
                                }`}
                        >
                            <Link className="w-5 h-5" />
                            <span>Deep Link Onboarding</span>
                        </button>
                        <button
                            onClick={() => setActiveSection('selfService')}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${activeSection === 'selfService'
                                ? 'bg-[#5D2BA8] text-white'
                                : 'hover:bg-[#5D2BA8]'
                                }`}
                        >
                            <Users className="w-5 h-5" />
                            <span>Self Service Onboarding</span>
                        </button>
                        <button
                            onClick={() => setActiveSection('bulk')}
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
                {/* Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="flex justify-between items-center px-6 py-4">
                        <h2 className="text-xl font-semibold">
                            {showDashboard ? 'Activity Dashboard' : 'Alerts'}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name}`}
                                    alt={user?.name || 'User'}  // Use optional chaining
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="text-sm font-medium">
                                    {user?.name || 'User'}  {/* Use optional chaining */}
                                </span>
                                <button
                                    onClick={async () => { // Make this onClick async
                                        await logout();      // Wait for logout to complete
                                        navigate('/login'); // Then navigate
                                    }}
                                    className="ml-4 text-gray-600 hover:text-gray-800"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    {!showDashboard && (
                        <div className="px-6 py-3 flex items-center space-x-4 border-t border-gray-200">
                            <div className="flex space-x-2">
                                <button className="px-4 py-1 rounded-full bg-[#4A1D96] text-white text-sm">
                                    All
                                </button>
                                <button className="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
                                    Pending
                                </button>
                                <button className="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
                                    In Review
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
                {/* Conditionally Render Dashboard or Table */}
                {showDashboard ? (
                    <ActivityDashboard
                        tracking={tracking}
                        trackedResults={trackedResults}
                    />
                ) : (
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-gray-500">
                                        <th className="pb-4">TYPE</th>
                                        <th className="pb-4">CUSTOMER</th>
                                        <th className="pb-4">FULL NAME</th>
                                        <th className="pb-4">NATIONALITY</th>
                                        <th className="pb-4">AGING</th>
                                        <th className="pb-4">NAME SCREENING</th>
                                        <th className="pb-4">DOCUMENTATION</th>
                                        <th className="pb-4">RISK RATING</th>
                                        <th className="pb-4">STATUS</th>
                                        <th className="pb-4">TRACKING</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(trackedResults.length > 0 ? trackedResults : searchResults).map(
                                        (result, index) => {
                                            const isTracking =
                                                tracking[result.name]?.isTracking ?? false;
                                            const agingContent = calculateAging(result);
                                            return (
                                                <tr
                                                    key={index}
                                                    className="border-t border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="py-4">
                                                        <div
                                                            className={`w-1 h-6 ${result.riskLevel >= 85
                                                                ? 'bg-red-500'
                                                                : result.riskLevel >= 60
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-green-500'
                                                                } rounded-full`}
                                                        ></div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center space-x-3">
                                                            <img
                                                                src={`https://ui-avatars.com/api/?name=${result.name}`}
                                                                alt={result.name}
                                                                className="w-8 h-8 rounded-full"
                                                            />
                                                            <span className="text-sm">
                                                                {result.identifiers}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="text-sm">{result.name}</td>
                                                    <td className="text-sm">{result.country}</td>
                                                    <td className="text-sm" dangerouslySetInnerHTML={{ __html: agingContent }} />

                                                    <td>
                                                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                                            <XCircle className="w-4 h-4 text-red-500" />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`text-sm ${getRiskColor(
                                                                result.riskLevel
                                                            )}`}
                                                        >
                                                            {result.riskLevel}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                                            Review
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => toggleTracking(result.name)}
                                                            className={`w-8 h-5 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${isTracking ? 'bg-purple-500' : 'bg-gray-300'
                                                                }`}
                                                        >
                                                            <div
                                                                className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isTracking
                                                                    ? 'translate-x-3'
                                                                    : 'translate-x-0'
                                                                    }`}
                                                            ></div>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MainApp;