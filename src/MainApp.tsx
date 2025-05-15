// MainApp.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, FileText, Shield, LogOut, Link, Users, File,
    Plus, Loader2
} from 'lucide-react';
import type { SearchResult, Tracking } from './types';
import { useAuth } from './AuthContext';
import ActivityDashboard from './Insights';
import Profiles from './Profiles';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
// Import the new components
import IndividualOB from './IndividualOB';
import CompanyOB from './CompanyOB';
import Insights from './Insights';
import { getApiBaseUrl } from './config';
import ActiveTracking from './ActiveTracking';
import ErrorBoundary from './components/ErrorBoundary';
import CustomerProfiles from './CustomerProfiles';

const API_BASE_URL = getApiBaseUrl();

// Cache interface
interface SearchCache {
    [key: string]: {
        results: SearchResult[];
        timestamp: number;
    };
}

// Cache interface for tracking data
interface TrackingCache {
    data: Tracking;
    persons: SearchResult[];
    timestamp: number;
}

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
    const [activeSection, setActiveSection] = useState<'insights' | 'profiles' | 'deepLink' | 'selfService' | 'bulk' | 'activeTracking' | 'customerProfiles'>('insights');
    const [deepLinkSubSection, setDeepLinkSubSection] = useState<'individual' | 'company' | null>(null);
    const [showIndividualOB, setShowIndividualOB] = useState(false);
    const [showCompanyOB, setShowCompanyOB] = useState(false);
    
    // Add search cache
    const [searchCache] = useState<SearchCache>({});
    
    // Add tracking cache
    const [trackingCache, setTrackingCache] = useState<TrackingCache | null>(null);
    
    const navigate = useNavigate();

    // Cache duration in milliseconds (5 minutes)
    const CACHE_DURATION = 5 * 60 * 1000;
    
    // Minimum search term length
    const MIN_SEARCH_LENGTH = 2;

    // Cache duration for tracking data (2 minutes)
    const TRACKING_CACHE_DURATION = 2 * 60 * 1000;

    const fetchTrackedData = useCallback(async () => {
        if (!user) return;

        // Check cache first
        if (trackingCache && Date.now() - trackingCache.timestamp < TRACKING_CACHE_DURATION) {
            setTracking(trackingCache.data);
            setTrackedResults(trackingCache.persons);
            return;
        }

        setIsLoading(true);

        try {
            // Use Promise.all to fetch tracking and persons data in parallel
            const [trackingResponse, personsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/tracking`, { credentials: 'include' }),
                fetch(`${API_BASE_URL}/persons?limit=1000`, { credentials: 'include' })
            ]);

            // Handle authentication errors
            if (trackingResponse.status === 401 || personsResponse.status === 401) {
                navigate('/login');
                return;
            }

            if (!trackingResponse.ok || !personsResponse.ok) {
                throw new Error('Network response was not ok');
            }

            // Parse both responses
            const trackingData = await trackingResponse.json();
            const personsResult = await personsResponse.json();

            // Transform tracking data
            const transformedTracking: Tracking = {};
            trackingData.forEach((item: any) => {
                transformedTracking[item.name] = {
                    isTracking: item.isTracking === 1,
                    startDate: item.startDate,
                    stopDate: item.stopDate
                };
            });

            // Get persons data from the paginated response
            const allPersonsData = personsResult.data || [];
            
            // Filter tracked persons
            const tracked = allPersonsData.filter((result: SearchResult) => 
                transformedTracking[result.name]?.isTracking
            );

            // Update cache
            setTrackingCache({
                data: transformedTracking,
                persons: tracked,
                timestamp: Date.now()
            });

            // Update state
            setTracking(transformedTracking);
            setTrackedResults(tracked);

        } catch (error) {
            console.error('Could not fetch tracked data:', error);
            setTracking({});
            setTrackedResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [user, navigate]);

    // Refresh tracking data periodically
    useEffect(() => {
        fetchTrackedData();
        
        // Set up periodic refresh every 2 minutes
        const refreshInterval = setInterval(fetchTrackedData, TRACKING_CACHE_DURATION);
        
        return () => clearInterval(refreshInterval);
    }, [fetchTrackedData]);

    // Update tracking with optimistic updates
    const updateTracking = useCallback(async (name: string, newTrackingStatus: boolean) => {
        try {
            // Optimistically update UI
            const updatedTracking = { ...tracking };
            updatedTracking[name] = {
                ...updatedTracking[name],
                isTracking: newTrackingStatus,
                startDate: newTrackingStatus ? new Date().toISOString() : undefined,
                stopDate: !newTrackingStatus ? new Date().toISOString() : undefined
            };
            setTracking(updatedTracking);

            // Update tracked results immediately
            const updatedResults = trackedResults.filter(result => 
                updatedTracking[result.name]?.isTracking
            );
            setTrackedResults(updatedResults);

            // Make API call
            const response = await fetch(`${API_BASE_URL}/tracking/${name}`, {
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
                throw new Error(`Server error: ${response.status}`);
            }

            // Update cache
            if (trackingCache) {
                setTrackingCache({
                    ...trackingCache,
                    data: updatedTracking,
                    persons: updatedResults,
                    timestamp: Date.now()
                });
            }

        } catch (error) {
            console.error('Error updating tracking:', error);
            // Revert optimistic update on error
            await fetchTrackedData();
        }
    }, [tracking, trackedResults, trackingCache, navigate]);

    const handleSearch = useCallback(async () => {
        if ((!searchTerm && !searchId) || (searchTerm && searchTerm.length < MIN_SEARCH_LENGTH)) {
            setSearchResults([]);
            return;
        }

        // Create cache key from search parameters
        const cacheKey = `${searchTerm}-${searchId}`;

        // Check cache first
        const cachedData = searchCache[cacheKey];
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            setSearchResults(cachedData.results || []);
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

            const responseData = await response.json();
            const results = Array.isArray(responseData.data) ? responseData.data : [];
            
            // Update cache
            searchCache[cacheKey] = {
                results,
                timestamp: Date.now()
            };
            
            setSearchResults(results);
            console.log('Search results:', results.length); // Debug log
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, searchId, searchCache, navigate]);

    // Create debounced search function
    const debouncedSearch = useCallback(
        debounce(handleSearch, 300),
        [handleSearch]
    );

    // Update search when terms change
    useEffect(() => {
        debouncedSearch();
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm, searchId, debouncedSearch]);

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
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${
                                activeSection === 'insights' ? 'bg-[#5D2BA8] text-white' : 'hover:bg-[#5D2BA8]'
                            }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span>Insights</span>
                        </button>

                        <button
                            onClick={() => {
                                setShowDashboard(false);
                                setActiveSection('activeTracking');
                                setShowCompanyOB(false);
                                setShowIndividualOB(false);
                            }}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${
                                activeSection === 'activeTracking' ? 'bg-[#5D2BA8] text-white' : 'hover:bg-[#5D2BA8]'
                            }`}
                        >
                            <Shield className="w-5 h-5" />
                            <span>Active Tracking</span>
                        </button>

                        <button
                            onClick={() => {
                                setShowDashboard(false);
                                setActiveSection('customerProfiles');
                                setShowCompanyOB(false);
                                setShowIndividualOB(false);
                            }}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${
                                activeSection === 'customerProfiles' ? 'bg-[#5D2BA8] text-white' : 'hover:bg-[#5D2BA8]'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            <span>Customer Profiles</span>
                        </button>

                        <button
                            onClick={() => {
                                setShowDashboard(false);
                                setActiveSection('profiles');
                                setShowCompanyOB(false);
                                setShowIndividualOB(false);
                            }}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 ${
                                activeSection === 'profiles' ? 'bg-[#5D2BA8] text-white' : 'hover:bg-[#5D2BA8]'
                            }`}
                        >
                            <Users className="w-5 h-5" />
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
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <header className="bg-white border-b border-gray-200">
                    <div className="flex justify-between items-center px-6 py-4">
                        <h2 className="text-xl font-semibold">
                            {showDashboard ? 'Activity Dashboard' : 
                             showIndividualOB ? 'Individual Onboarding' :
                             showCompanyOB ? 'Company Onboarding' :
                             activeSection === 'activeTracking' ? 'Active Tracking' :
                             activeSection === 'customerProfiles' ? 'Customer Profiles' :
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

                    {!showDashboard && !showIndividualOB && !showCompanyOB && 
                     activeSection !== 'activeTracking' && activeSection !== 'customerProfiles' && (
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
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSearchTerm(value);
                                            if (value.length < MIN_SEARCH_LENGTH) {
                                                setSearchResults([]);
                                            }
                                        }}
                                        placeholder={`