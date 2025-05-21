// MainApp.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, FileText, Shield, LogOut, Link, Users, File,
    Plus, Loader2, CheckCircle, XCircle, Eye, CreditCard
} from 'lucide-react';
import type { SearchResult, Tracking, TrackingItem } from './types';
import { useAuth } from './AuthContext';
import ActivityDashboard from './Insights';
import Profiles from './Profiles';
import { useNavigate, useLocation } from 'react-router-dom';
import debounce from 'lodash/debounce';
import IndividualOB from './IndividualOB';
import CompanyOB from './CompanyOB';
import Insights from './Insights';
import { getApiBaseUrl } from './config';
import ActiveTracking from './ActiveTracking';
import ErrorBoundary from './components/ErrorBoundary';
import DebugLog, { addLog } from './components/DebugLog';
import EditProfile from './EditProfile';
import Layout from './components/Layout';

const API_BASE_URL = getApiBaseUrl();

// Cache interface
interface SearchCache {
    [key: string]: {
        results: SearchResult[];
        timestamp: number;
        totalPages?: number;
        totalResults?: number;
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
    const [activeSection, setActiveSection] = useState<'insights' | 'profiles' | 'deepLink' | 'selfService' | 'bulk' | 'activeTracking'>('insights');
    const [deepLinkSubSection, setDeepLinkSubSection] = useState<'individual' | 'company' | null>(null);
    const [showIndividualOB, setShowIndividualOB] = useState(false);
    const [showCompanyOB, setShowCompanyOB] = useState(false);
    
    // Add state for pending approvals
    const [pendingApprovals, setPendingApprovals] = useState<{
        id: number, 
        name: string, 
        type: string, 
        isMatched: boolean,
        matches?: SearchResult[],
        processedMatches?: {[matchId: number]: 'approved' | 'rejected'}, // Track which matches have been processed
        status: string | null | undefined
    }[]>([]);
    
    // Add search cache
    const [searchCache] = useState<SearchCache>({});
    
    // Add tracking cache
    const [trackingCache, setTrackingCache] = useState<TrackingCache | null>(null);
    
    // Add last refresh timestamp to prevent multiple refreshes
    const [lastRefreshTimestamp, setLastRefreshTimestamp] = useState<number>(0);
    
    // Add state for user credits
    const [credits, setCredits] = useState<number>(0);
    const [loadingCredits, setLoadingCredits] = useState<boolean>(false);
    
    // Inside MainApp, add state for pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalResults, setTotalResults] = useState<number>(0);
    
    const navigate = useNavigate();
    const location = useLocation();

    // Cache duration in milliseconds (5 minutes)
    const CACHE_DURATION = 5 * 60 * 1000;
    
    // Minimum search term length
    const MIN_SEARCH_LENGTH = 2;

    // Cache duration for tracking data (2 minutes)
    const TRACKING_CACHE_DURATION = 2 * 60 * 1000;
    
    // Minimum time between refreshes (3 seconds)
    const REFRESH_COOLDOWN = 3000;

    const fetchTrackedData = useCallback(async () => {
        if (!user) return;
        
        // Check if we're within the cooldown period
        const now = Date.now();
        if (now - lastRefreshTimestamp < REFRESH_COOLDOWN) {
            console.log('🔍 Refresh cooldown active, skipping fetch');
            return;
        }
        
        console.log('🔍 Starting fetchTrackedData');
        setLastRefreshTimestamp(now);

        // Check cache first
        if (trackingCache && Date.now() - trackingCache.timestamp < TRACKING_CACHE_DURATION) {
            console.log('🔍 Using cached tracking data');
            setTracking(trackingCache.data);
            setTrackedResults(trackingCache.persons);
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔍 Fetching tracked persons data from new endpoint...');
            // Use the new endpoint that returns complete information in one request
            // Don't include additional headers that might trigger CORS issues
            const trackedPersonsResponse = await fetch(
                `${API_BASE_URL}/tracked-persons`, 
                { credentials: 'include' }
            );

            if (trackedPersonsResponse.status === 401) {
                console.error('🔍 Authentication error - redirecting to login');
                navigate('/login');
                return;
            }

            if (!trackedPersonsResponse.ok) {
                console.error(`🔍 Tracked persons response error: ${trackedPersonsResponse.status}`);
                throw new Error('Network response was not ok for tracked persons');
            }

            const responseData = await trackedPersonsResponse.json();
            console.log('🔍 Tracked persons data from server:', responseData);

            // Get the tracked results array
            const trackedPersons = Array.isArray(responseData.data) ? responseData.data : [];
            console.log('🔍 Tracked persons array length:', trackedPersons.length);

            // Transform tracking data into the expected format
            const transformedTracking: Tracking = {};
            trackedPersons.forEach((person: any) => {
                transformedTracking[person.name] = {
                    isTracking: person.isTracking === 1,
                    startDate: person.startDate,
                    stopDate: person.stopDate
                };
            });

            console.log('🔍 Transformed tracking data:', transformedTracking);

            // Create SearchResult objects from the response
            const tracked = trackedPersons.map((person: any) => ({
                id: person.id,
                name: person.name,
                type: person.type || 'Unknown',
                country: person.country || 'Unknown',
                identifiers: person.identifiers || 'N/A',
                riskLevel: person.riskLevel || 50,
                sanctions: Array.isArray(person.sanctions) ? person.sanctions : [],
                dataset: person.dataset || ''
            }));

            console.log('🔍 Final tracked results:', tracked);
            console.log('🔍 Final tracked results count:', tracked.length);

            // Update cache
            setTrackingCache({
                data: transformedTracking,
                persons: tracked,
                timestamp: Date.now()
            });

            // Update state
            console.log('🔍 Updating state with tracked results');
            setTracking(transformedTracking);
            setTrackedResults(tracked);

        } catch (error) {
            console.error('🔍 Could not fetch tracked data:', error);
            setTracking({});
            setTrackedResults([]);
        } finally {
            setIsLoading(false);
            console.log('🔍 Completed fetchTrackedData');
        }
    }, [user, navigate]);

    // Function to fetch pending approvals
    const fetchPendingApprovals = useCallback(async () => {
        try {
            // Fetch individuals from individualob table
            const individualsResponse = await fetch(`${API_BASE_URL}/individualob`, { 
                credentials: 'include' 
            });
            
            // Fetch companies from companyob table
            const companiesResponse = await fetch(`${API_BASE_URL}/companyob`, { 
                credentials: 'include' 
            });
            
            if (!individualsResponse.ok || !companiesResponse.ok) {
                throw new Error('Failed to fetch onboarded customers');
            }
            
            const individuals = await individualsResponse.json();
            const companies = await companiesResponse.json();
            
            console.log('🔍 Fetched onboarded individuals:', individuals);
            console.log('🔍 Fetched onboarded companies:', companies);
            
            // Filter out already approved, rejected, or processed customers
            // Consider both 'pending' and null/undefined/empty string as pending status
            const pendingStatuses = ['pending', null, undefined, ''];
            
            const pendingIndividuals = individuals.filter((ind: any) => 
                pendingStatuses.includes(ind.status)
            );
            const pendingCompanies = companies.filter((comp: any) => 
                pendingStatuses.includes(comp.status)
            );
            
            console.log('🔍 Filtered to pending individuals:', pendingIndividuals.length);
            console.log('🔍 Filtered to pending companies:', pendingCompanies.length);
            
            // Create list of names to check for matches
            const pendingList = [
                ...pendingIndividuals.map((ind: any) => ({ 
                    id: ind.id, 
                    name: ind.full_name, 
                    type: 'individual',
                    isMatched: false,
                    status: ind.status
                })),
                ...pendingCompanies.map((comp: any) => ({ 
                    id: comp.id, 
                    name: comp.company_name, 
                    type: 'company',
                    isMatched: false,
                    status: comp.status
                }))
            ];
            
            // Check for matches against the persons table
            if (pendingList.length > 0) {
                const matchPromises = pendingList.map(async (item) => {
                    try {
                        const searchResponse = await fetch(
                            `${API_BASE_URL}/persons/search?searchTerm=${encodeURIComponent(item.name)}`, 
                            { credentials: 'include' }
                        );
                        
                        if (!searchResponse.ok) {
                            return item;
                        }
                        
                        const searchResults = await searchResponse.json();
                        const matches = searchResults.data || [];
                        
                        return {
                            ...item,
                            isMatched: matches.length > 0,
                            matches: matches // Store the actual matches
                        };
                    } catch (error) {
                        console.error(`Error checking matches for ${item.name}:`, error);
                        return item;
                    }
                });
                
                const checkedList = await Promise.all(matchPromises);
                
                // Process customers with no matches - automatically add to tracking
                const customersWithNoMatches = checkedList.filter(item => !item.isMatched);
                console.log(`🔍 Found ${customersWithNoMatches.length} customers with no matches to auto-process`);
                
                for (const item of customersWithNoMatches) {
                    try {
                        console.log(`🔄 Auto-approving customer with no matches: ${item.name}`);
                        
                        // Call approve endpoint to add to tracking
                        await fetch(`${API_BASE_URL}/customer/${item.type}/${item.id}/approve`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        console.log(`✅ Auto-approved ${item.type} ${item.name}`);
                    } catch (error) {
                        console.error(`Error auto-approving no-match customer ${item.name}:`, error);
                    }
                }
                
                // If we auto-approved any customers, refresh tracking data
                if (customersWithNoMatches.length > 0) {
                    fetchTrackedData();
                }
                
                // Update the pending approvals list with only matched items that need approval
                const filteredList = checkedList.filter(item => 
                    item.isMatched && pendingStatuses.includes(item.status)
                );
                setPendingApprovals(filteredList);
                console.log('🔍 Pending approvals with match status:', filteredList);
            } else {
                setPendingApprovals([]);
            }
            
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
            setPendingApprovals([]);
        }
    }, [API_BASE_URL, fetchTrackedData]);

    // Refresh tracking data periodically
    useEffect(() => {
        console.log('Fetching tracked data...');
        fetchTrackedData();
        
        // Also fetch pending approvals on initial load
        fetchPendingApprovals();
        
        // Set up periodic refresh every 2 minutes
        const refreshInterval = setInterval(() => {
            fetchTrackedData();
            fetchPendingApprovals(); // Also periodically refresh pending approvals
        }, TRACKING_CACHE_DURATION);
        
        return () => clearInterval(refreshInterval);
    }, [fetchTrackedData, fetchPendingApprovals]);

    // Add debug logging for render
    console.log('MainApp render state:', {
        activeSection,
        trackedResults,
        tracking,
        isLoading
    });

    // Update tracking with optimistic updates
    const updateTracking = useCallback(async (name: string, newTrackingStatus: boolean) => {
        try {
            // Special case for refreshing data without changing tracking status
            if (name === '__refresh__') {
                console.log('🔄 Refreshing data via special refresh command');
                setTrackingCache(null); // Invalidate cache
                await fetchTrackedData(); // Fetch fresh data
                return;
            }

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

    // Add a function to handle tab changes
    const handleTabChange = useCallback((section: string, shouldRefreshData: boolean = true) => {
        console.log(`🔄 Tab change request to: ${section}, refresh: ${shouldRefreshData}`);
        
        // Always update the UI state regardless of refresh status
        setActiveSection(section as any);
        setShowCompanyOB(false);
        setShowIndividualOB(false);
        setShowDashboard(section === 'insights');
        
        // Fetch fresh data when switching to active tracking, but only if shouldRefreshData is true
        if (section === 'activeTracking' && shouldRefreshData) {
            console.log('🔄 Switching to Screening tab - fetching fresh data');
            // Check if we're within the cooldown period
            const now = Date.now();
            if (now - lastRefreshTimestamp < REFRESH_COOLDOWN) {
                console.log('🔄 Refresh cooldown active, skipping data refresh');
                return;
            }
            
            // Update refresh timestamp
            setLastRefreshTimestamp(now);
            
            // Force data refresh by invalidating cache
            setTrackingCache(null);
            // Fetch new data
            setIsLoading(true);
            fetchTrackedData();
            // Fetch pending approvals
            fetchPendingApprovals();
        }
    }, [fetchTrackedData, lastRefreshTimestamp, fetchPendingApprovals]);

    // Handle approving or rejecting a specific match
    const handleMatchApproval = async (
        customerId: number, 
        customerType: string, 
        matchId: number, 
        matchName: string,
        action: 'approved' | 'rejected'
    ) => {
        try {
            console.log(`🔄 ${action === 'approved' ? 'Approving' : 'Rejecting'} match ${matchName} (ID: ${matchId}) for ${customerType} (ID: ${customerId})`);
            
            // Find the customer in pending approvals
            const updatedApprovals = [...pendingApprovals];
            const customerIndex = updatedApprovals.findIndex(
                item => item.id === customerId && item.type === customerType
            );
            
            if (customerIndex === -1) return;
            
            // Initialize processedMatches object if it doesn't exist
            if (!updatedApprovals[customerIndex].processedMatches) {
                updatedApprovals[customerIndex].processedMatches = {};
            }
            
            // Mark this match as processed
            updatedApprovals[customerIndex].processedMatches![matchId] = action;
            
            // Update state immediately for responsive UI
            setPendingApprovals(updatedApprovals);
            
            if (action === 'approved') {
                // Add this match to tracking (use person from sanctioned list)
                await fetch(`${API_BASE_URL}/tracking/${matchName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isTracking: true }),
                    credentials: 'include',
                });
                
                // Also mark the sanctioned person as matched so we know it was blacklisted
                await fetch(`${API_BASE_URL}/mark-matched/${matchId}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ dataset: 'matched' })
                }).catch(error => {
                    // Log error but continue with approval process
                    console.error("Error marking as matched:", error);
                    addLog(`Failed to mark ${matchName} as matched: ${error}`, 'error');
                });
                
                // Refresh tracking data
                fetchTrackedData();
                
                // Mark the customer as approved in the database
                await fetch(`${API_BASE_URL}/customer/${customerType}/${customerId}/approve`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                // Remove this customer from pending list immediately after approval
                const filteredApprovals = pendingApprovals.filter(
                    item => !(item.id === customerId && item.type === customerType)
                );
                setPendingApprovals(filteredApprovals);
                
                // Show success message
                alert(`${matchName} has been approved and added to tracking`);
                return;
            } else if (action === 'rejected') {
                // Simpler approach: When rejecting any match, mark it in the UI and call the backend
                console.log(`Rejecting match ${matchName} for customer ID ${customerId}`);
                addLog(`Rejecting match ${matchName} for customer ID ${customerId}`, 'info');
                
                try {
                    // Make direct API call to reject the customer
                    addLog(`Sending rejection request to ${API_BASE_URL}/customer/${customerType}/${customerId}/reject`, 'info');
                    
                    const response = await fetch(`${API_BASE_URL}/customer/${customerType}/${customerId}/reject`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const responseData = await response.json();
                    console.log('Rejection response:', responseData);
                    addLog(`Server response: ${JSON.stringify(responseData)}`, response.ok ? 'success' : 'error');
                    
                    if (!response.ok) {
                        throw new Error(responseData.message || `Server error: ${response.status}`);
                    }
                    
                    // Remove this customer from the pending approvals list
                    setPendingApprovals(prevApprovals => prevApprovals.filter(
                        item => !(item.id === customerId && item.type === customerType)
                    ));
                    
                    addLog(`Successfully removed customer ${customerId} from approvals list`, 'success');
                    
                    // Show success message
                    alert(`Customer has been rejected successfully`);
                } catch (error) {
                    console.error('Error during rejection:', error);
                    addLog(`Rejection error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                    alert(`Failed to reject: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            
        } catch (error) {
            console.error(`Error processing match with action '${action}':`, error);
            alert(`Failed to process match. Please try again.`);
        }
    };

    // Modify the handleSearch function to support pagination
    const handleSearch = useCallback(async (page: number = 1) => {
        if ((!searchTerm && !searchId) || (searchTerm && searchTerm.length < MIN_SEARCH_LENGTH)) {
            setSearchResults([]);
            setTotalPages(1);
            setTotalResults(0);
            return;
        }

        // Create cache key from search parameters including page number
        const cacheKey = `${searchTerm}-${searchId}-page${page}`;

        // Check cache first
        const cachedData = searchCache[cacheKey];
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            setSearchResults(cachedData.results || []);
            setTotalPages(cachedData.totalPages || 1);
            setTotalResults(cachedData.totalResults || 0);
            setCurrentPage(page);
            return;
        }

        setIsLoading(true);

        try {
            const url = new URL(`${API_BASE_URL}/persons/search`);
            if (searchTerm) url.searchParams.append('searchTerm', searchTerm);
            if (searchId) url.searchParams.append('searchId', searchId);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', '50'); // 50 results per page

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
            const totalPagesFromServer = responseData.pagination?.totalPages || 1;
            const totalResultsFromServer = responseData.pagination?.total || 0;
            
            // Update cache
            searchCache[cacheKey] = {
                results,
                timestamp: Date.now(),
                totalPages: totalPagesFromServer,
                totalResults: totalResultsFromServer
            };
            
            setSearchResults(results);
            setTotalPages(totalPagesFromServer);
            setTotalResults(totalResultsFromServer);
            setCurrentPage(page);
            console.log('Search results:', results.length, 'Page:', page, 'Total pages:', totalPagesFromServer); // Debug log
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
            setTotalPages(1);
            setTotalResults(0);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, searchId, searchCache, navigate]);

    // Create debounced search function
    const debouncedSearch = useCallback(
        debounce(() => handleSearch(1), 300), // Reset to page 1 when search terms change
        [handleSearch]
    );

    // Function to handle page changes
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            handleSearch(newPage);
        }
    };

    // Update search when terms change
    useEffect(() => {
        debouncedSearch();
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm, searchId, debouncedSearch]);

    const handleDeepLinkClick = () => {
        if (activeSection === 'deepLink') {
            handleSidebarNavigation('insights');
            setDeepLinkSubSection(null);
        } else {
            handleSidebarNavigation('deepLink');
            setDeepLinkSubSection('individual'); // Set a default sub-section
            setShowIndividualOB(true); // show by default
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

    // Handle general navigation through sidebar
    const handleSidebarNavigation = useCallback((section: string) => {
        console.log(`Navigation via sidebar to: ${section}`);
        
        // Don't force a refresh when it's just a normal tab switch
        // This separates navigation from data refreshing
        const shouldRefresh = false;
        handleTabChange(section, shouldRefresh);
        
        // Also update the URL without triggering a page reload
        window.history.pushState({}, document.title, '/mainapp');
    }, [handleTabChange]);

    // Add code to handle the redirect from onboarding components
    useEffect(() => {
        // First check for URL parameters (new approach)
        const urlParams = new URLSearchParams(window.location.search);
        const sectionParam = urlParams.get('section');
        const refreshParam = urlParams.get('refresh') === 'true';
        
        if (sectionParam) {
            console.log('📊 Handling navigation from URL parameters');
            
            // Determine if we should refresh data
            const now = Date.now();
            const shouldRefresh = refreshParam && (now - lastRefreshTimestamp > REFRESH_COOLDOWN);
            
            // Call handleTabChange with the refreshData flag
            handleTabChange(sectionParam, shouldRefresh);
            
            // If refreshData flag is set, force a refresh of tracked data
            if (shouldRefresh && sectionParam === 'activeTracking') {
                console.log('📊 Refreshing tracked data after profile update (URL params)');
                
                // First invalidate cache to force fresh data fetch
                setTrackingCache(null);
                
                // Then fetch data immediately
                setIsLoading(true);
                fetchTrackedData();
                
                // Also fetch pending approvals to ensure consistency
                fetchPendingApprovals();
                
                // Update refresh timestamp
                setLastRefreshTimestamp(now);
            }
            
            // Clean up the URL to prevent future refreshes
            window.history.replaceState({}, document.title, '/mainapp');
            return; // Skip the rest of the effect if URL params were processed
        }
        
        // Then check for redirected state with activeSection (old approach)
        const state = location.state as { 
            activeSection?: string;
            refreshData?: boolean;
            timestamp?: number;
        } || {};
        
        if (state.activeSection) {
            // Determine if we should refresh data based on the refreshData flag
            // and check if we're within the cooldown period
            const now = Date.now();
            const shouldRefresh = state.refreshData === true && (now - lastRefreshTimestamp > REFRESH_COOLDOWN);
            
            // Call handleTabChange with the refreshData flag
            handleTabChange(state.activeSection, shouldRefresh);
            
            // If refreshData flag is set, force a refresh of tracked data
            if (shouldRefresh && state.activeSection === 'activeTracking') {
                console.log('📊 Refreshing tracked data after profile update');
                
                // First invalidate cache to force fresh data fetch
                setTrackingCache(null);
                
                // Then fetch data immediately
                setIsLoading(true);
                fetchTrackedData();
                
                // Also fetch pending approvals to ensure consistency
                fetchPendingApprovals();
                
                // Update refresh timestamp
                setLastRefreshTimestamp(now);
            }
            
            // Always clear the state to prevent re-triggering
            window.history.replaceState({}, document.title);
        }
    }, [location, handleTabChange, fetchTrackedData, fetchPendingApprovals, lastRefreshTimestamp]);

    // Function to fetch user credits
    const fetchUserCredits = useCallback(async () => {
        if (!user) return;
        
        setLoadingCredits(true);
        try {
            console.log('Fetching credits for user:', user.id);
            const response = await fetch(`${API_BASE_URL}/credits`, { 
                credentials: 'include' 
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch credits: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Credits data received:', data); // Debug log
            
            if (typeof data.credits === 'number') {
                setCredits(data.credits);
            } else {
                console.error('Invalid credits data received:', data);
                // If server returns non-numeric value, try to parse it or default to 0
                const parsedCredits = parseInt(data.credits);
                setCredits(isNaN(parsedCredits) ? 0 : parsedCredits);
            }
        } catch (error) {
            console.error('Error fetching credits:', error);
            setCredits(0);
        } finally {
            setLoadingCredits(false);
        }
    }, [user, API_BASE_URL]);

    // Add credits fetch to initial loading and when active section changes
    useEffect(() => {
        fetchUserCredits();
        
        // Also fetch credits when switching views
        const refreshInterval = setInterval(() => {
            fetchUserCredits();
        }, 30000); // Refresh every 30 seconds
        
        return () => clearInterval(refreshInterval);
    }, [fetchUserCredits, activeSection]);
    
    // Also refetch credits after handling profile approvals or rejections
    useEffect(() => {
        if (pendingApprovals.length > 0) {
            fetchUserCredits();
        }
    }, [pendingApprovals, fetchUserCredits]);

    // Add credits button navigation handler
    const handleCreditsClick = () => {
        navigate('/credits');
    };

    return (
        <Layout 
            activeSection={activeSection}
            deepLinkSubSection={deepLinkSubSection}
            credits={credits}
            loadingCredits={loadingCredits}
            handleSidebarNavigation={handleSidebarNavigation}
            handleDeepLinkClick={handleDeepLinkClick}
            handleIndividualOBClick={handleIndividualOBClick}
            handleCompanyOBClick={handleCompanyOBClick}
        >
            <div className="flex-1">
                <header className="bg-white border-b border-gray-200">
                    <div className="flex justify-between items-center px-6 py-4">
                        <h2 className="text-xl font-semibold">
                            {showDashboard ? 'Activity Dashboard' : 
                             showIndividualOB ? 'Individual Onboarding' :
                             showCompanyOB ? 'Company Onboarding' :
                             activeSection === 'activeTracking' ? 'Screening' :
                            'Search'}
                        </h2>
                    </div>

                    {!showDashboard && !showIndividualOB && !showCompanyOB && 
                     activeSection !== 'activeTracking' && (
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
                                        placeholder={`Search by name (min. ${MIN_SEARCH_LENGTH} characters)`}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    value={searchId}
                                    onChange={(e) => {
                                        setSearchId(e.target.value);
                                    }}
                                    placeholder="Search by ID"
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
                                />
                                <button
                                    onClick={() => handleSearch()}
                                    disabled={searchTerm.length > 0 && searchTerm.length < MIN_SEARCH_LENGTH}
                                    className={`px-6 py-2 bg-[#4A1D96] text-white rounded-lg text-sm ${
                                        searchTerm.length > 0 && searchTerm.length < MIN_SEARCH_LENGTH 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : ''
                                    }`}
                                >
                                    APPLY
                                </button>
                            </div>
                        </div>
                    )}
                </header>

                {showDashboard ? (
                    <ErrorBoundary>
                        <Insights />
                    </ErrorBoundary>
                ) : showIndividualOB ? (
                    <ErrorBoundary>
                        <IndividualOB />
                    </ErrorBoundary>
                ) : showCompanyOB ? (
                    <ErrorBoundary>
                        <CompanyOB />
                    </ErrorBoundary>
                ) : activeSection === 'activeTracking' ? (
                    <ErrorBoundary>
                        <div>
                            {/* Pending approvals section */}
                            {pendingApprovals.filter(item => item.isMatched).length > 0 && (
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold mb-4">Customers Requiring Approval</h3>
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {pendingApprovals.filter(item => item.isMatched).map((item) => (
                                                    <React.Fragment key={`${item.type}-${item.id}`}>
                                                        <tr>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {item.type === 'individual' ? 'Individual' : 'Company'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                    Potential Match Found
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {item.matches && item.matches.length > 0 && (
                                                                        <details className="cursor-pointer">
                                                                            <summary className="flex items-center">
                                                                                <span className="font-semibold">{item.matches.length} potential {item.matches.length === 1 ? 'match' : 'matches'}</span>
                                                                                <Eye className="h-4 w-4 ml-2 text-purple-500" />
                                                                            </summary>
                                                                            <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                                                                                <h4 className="font-medium text-gray-700 mb-2">Match Details:</h4>
                                                                                <ul className="space-y-2">
                                                                                    {item.matches.map((match, index) => (
                                                                                        <li key={`match-${match.id}-${index}`} className={`p-2 border-b border-gray-200 last:border-0 ${
                                                                                            item.processedMatches?.[match.id] === 'approved' ? 'bg-green-50' :
                                                                                            item.processedMatches?.[match.id] === 'rejected' ? 'bg-red-50' : ''
                                                                                        }`}>
                                                                                            <div className="flex justify-between">
                                                                                                <span className="font-medium">{match.name}</span>
                                                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                                                    match.riskLevel >= 85 ? 'bg-red-100 text-red-800' :
                                                                                                    match.riskLevel >= 65 ? 'bg-yellow-100 text-yellow-800' :
                                                                                                    'bg-green-100 text-green-800'
                                                                                                }`}>
                                                                                                    Risk: {match.riskLevel}%
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="mt-1 text-sm text-gray-600">
                                                                                                <div><span className="font-medium">Type:</span> {match.type}</div>
                                                                                                <div><span className="font-medium">Country:</span> {match.country}</div>
                                                                                                <div><span className="font-medium">ID:</span> {match.identifiers}</div>
                                                                                            </div>
                                                                                            
                                                                                            {/* Match approval/rejection buttons */}
                                                                                            {!item.processedMatches?.[match.id] ? (
                                                                                                <div className="mt-2 flex justify-end space-x-2">
                                                                                                    <button 
                                                                                                        onClick={() => handleMatchApproval(item.id, item.type, match.id, match.name, 'approved')}
                                                                                                        className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs flex items-center hover:bg-green-200"
                                                                                                    >
                                                                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                                                                        Approve Match
                                                                                                    </button>
                                                                                                    <button 
                                                                                                        onClick={() => handleMatchApproval(item.id, item.type, match.id, match.name, 'rejected')}
                                                                                                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-xs flex items-center hover:bg-red-200"
                                                                                                    >
                                                                                                        <XCircle className="w-3 h-3 mr-1" />
                                                                                                        Reject Match
                                                                                                    </button>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="mt-2 text-sm italic">
                                                                                                    {item.processedMatches[match.id] === 'approved' ? (
                                                                                                        <span className="text-green-600">✓ Approved - Added to tracking</span>
                                                                                                    ) : (
                                                                                                        <span className="text-red-600">✗ Rejected</span>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        </details>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button 
                                                                    onClick={() => handleMatchApproval(item.id, item.type, item.id, item.name, 'approved')}
                                                                    className="text-green-600 hover:text-green-900 mr-4"
                                                                >
                                                                    <CheckCircle className="inline w-5 h-5 mr-1" />
                                                                    Approve
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleMatchApproval(item.id, item.type, item.id, item.name, 'rejected')}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    <XCircle className="inline w-5 h-5 mr-1" />
                                                                    Reject
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            
                            {/* Main active tracking component */}
                            <ActiveTracking
                                trackedResults={trackedResults}
                                tracking={tracking}
                                isLoading={isLoading}
                                onToggleTracking={updateTracking}
                            />
                        </div>
                    </ErrorBoundary>
                ) : (
                    <ErrorBoundary>
                        <div className="p-6">
                            {/* Loading indicator and search results */}
                            {isLoading && (
                                <div className="flex items-center text-purple-700 mb-6">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    <span>Searching...</span>
                                </div>
                            )}
                            
                            {/* Search guidance */}
                            {!isLoading && searchTerm.length < MIN_SEARCH_LENGTH && searchResults.length === 0 && (
                                <div className="text-center p-12">
                                    <p className="text-gray-500 mb-4">
                                        Enter at least {MIN_SEARCH_LENGTH} characters to search for profiles
                                    </p>
                                </div>
                            )}
                            
                            {/* No results message */}
                            {!isLoading && searchTerm.length >= MIN_SEARCH_LENGTH && searchResults.length === 0 && (
                                <div className="text-center p-12">
                                    <p className="text-gray-500 mb-4">
                                        No results found for "{searchTerm}"
                                    </p>
                                </div>
                            )}
                            
                                                         {/* Search Results */}
                             {searchResults.length > 0 && (
                                 <Profiles 
                                     searchResults={searchResults} 
                                     isLoading={false}
                                     currentPage={currentPage}
                                     totalPages={totalPages}
                                     totalResults={totalResults}
                                     onPageChange={handlePageChange}
                                 />
                             )}
                        </div>
                    </ErrorBoundary>
                )}
            </div>
        </Layout>
    );
}

export default MainApp;