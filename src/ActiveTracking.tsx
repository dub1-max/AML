import React, { useEffect, useState } from 'react';
import { Loader2, XCircle, Download, CheckCircle, RefreshCw, FileText, ChevronUp, ChevronDown, Search, Edit, AlertCircle, Eye } from 'lucide-react';
import { SearchResult, Tracking } from './types';
import { generateCustomerPDF } from './utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';
import CustomerProfileDetails from './components/CustomerProfileDetails';
import ConfirmationDialog from './components/ui/ConfirmationDialog';
import { showAlert } from './components/ui/Alert';

interface ActiveTrackingProps {
    trackedResults: SearchResult[];
    tracking: Tracking;
    isLoading: boolean;
    onToggleTracking: (name: string, newTrackingStatus: boolean) => Promise<void>;
    tabType?: 'alerts' | 'customers';
}

// Customer interface for profile details
interface Customer {
    id: string;
    user_id?: string;
    identoId?: string;
    type: 'individual' | 'company';
    status: string;
    full_name?: string;
    companyName?: string;
    company_name?: string;
    gender?: string;
    date_of_birth?: string;
    nationality?: string;
    country_of_residence?: string;
    national_id_number?: string;
    national_id_expiry?: string;
    passport_number?: string;
    passport_expiry?: string;
    email?: string;
    contact_number?: string;
    phone_number?: string;
    address?: string;
    state?: string;
    city?: string;
    zip_code?: string;
    postal_code?: string;
    work_type?: string;
    industry?: string;
    position_in_company?: string;
    company_name_work?: string;
    document_matched?: boolean;
    document_verified?: boolean;
    sanction_status?: string;
    pep_status?: string;
    special_interest_status?: string;
    adverse_media_status?: string;
    risk_rating?: string;
    onboarded_by?: string;
    record_last_updated?: string;
    last_review?: string;
    next_review?: string;
    [key: string]: any;
}

type SortableColumn = 'identifiers' | 'name' | 'country' | 'aging' | 'blacklist' | 'risk' | 'status' | 'dataset';
type SortDirection = 'asc' | 'desc';

function ActiveTracking({ trackedResults, tracking, isLoading, onToggleTracking, tabType = 'alerts' }: ActiveTrackingProps) {
    const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
    const [generatingPdf, setGeneratingPdf] = useState<{[key: number]: boolean}>({});
    const [sortColumn, setSortColumn] = useState<SortableColumn>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [nameQuery, setNameQuery] = useState<string>('');
    const [idQuery, setIdQuery] = useState<string>('');
    const [appliedNameQuery, setAppliedNameQuery] = useState<string>('');
    const [appliedIdQuery, setAppliedIdQuery] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'custom'>('all');
    
    // State for customer profile viewing
    const [currentView, setCurrentView] = useState<'list' | 'details'>('list');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    
    const navigate = useNavigate();
    
    // Minimum search term length
    const MIN_SEARCH_LENGTH = 2;
    
    console.log('🔶 ActiveTracking rendered with props:', { 
        trackedResultsLength: trackedResults?.length || 0,
        trackingKeys: Object.keys(tracking || {}),
        isLoading 
    });
    
    // Add effect to log information on mount and updates
    useEffect(() => {
        console.log('🔶 ActiveTracking mount/update effect');
        console.log('🔶 trackedResults details:', trackedResults);
        console.log('🔶 tracking details:', tracking);
        
        // Update last updated timestamp when data changes
        if (!isLoading && trackedResults) {
            setLastUpdated(new Date().toLocaleTimeString());
        }
    }, [trackedResults, tracking, isLoading]);

    // Convert SearchResult to Customer for profile viewing
    const convertToCustomer = (result: SearchResult): Customer => {
        // Extract needed properties from result
        const { name, country, dataset, riskLevel, identifiers } = result;
        
        // Create a clean customer object without spreading the original result
        return {
            id: result.id.toString(),
            user_id: identifiers,
            identoId: identifiers,
            type: 'individual' as const, // Use const assertion to ensure correct type
            status: dataset === 'onboarded' ? 'approved' : 'pending',
            full_name: name,
            nationality: country,
            country_of_residence: country,
            risk_rating: riskLevel?.toString() || '0',
            sanction_status: dataset?.includes('sanctions') ? 'flagged' : 'clear',
            pep_status: dataset?.includes('peps') ? 'flagged' : 'clear',
            special_interest_status: dataset?.includes('terrorists') ? 'flagged' : 'clear',
            adverse_media_status: 'clear',
            document_matched: dataset === 'onboarded',
            document_verified: dataset === 'onboarded',
            last_review: tracking?.[name]?.startDate
        };
    };

    // Handle viewing customer profile
    const handleViewCustomer = (result: SearchResult) => {
        const customerForView = convertToCustomer(result);
        setSelectedCustomer(customerForView);
        setCurrentView('details');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedCustomer(null);
    };

    const getRiskColor = (percentage: number): string => {
        if (percentage >= 85) return 'text-red-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-green-600';
    };

    const calculateAging = (result: SearchResult): string => {
        if (!result) {
            console.warn('🔶 calculateAging called with null/undefined result');
            return 'None';
        }

        const trackingInfo = tracking?.[result.name];
        
        if (!trackingInfo) {
            console.warn(`🔶 No tracking info for ${result.name}`);
            return 'None';
        }
        
        if (trackingInfo.isTracking) {
            return trackingInfo.startDate
                ? `${Math.floor((Date.now() - new Date(trackingInfo.startDate).getTime()) / (1000 * 60 * 60 * 24))}D`
                : '0D';
        }
        
        if (trackingInfo.stopDate && trackingInfo.startDate) {
            const diffInDays = Math.floor(
                (new Date(trackingInfo.stopDate).getTime() - new Date(trackingInfo.startDate).getTime()) / 
                (1000 * 60 * 60 * 24)
            );
            return `${diffInDays}D`;
        }
        
        return 'None';
    };

    // Add safety check for trackedResults
    const safeTrackedResults = Array.isArray(trackedResults) ? trackedResults : [];
    console.log('🔶 Safe tracked results count:', safeTrackedResults.length);
    
    if (safeTrackedResults.length === 0 && !isLoading) {
        console.log('🔶 No tracked results and not loading');
    }

    // Sort function for column headers
    const handleSort = (column: SortableColumn) => {
        if (sortColumn === column) {
            // Toggle direction if same column
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new column and default to ascending
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Render sort indicator
    const renderSortIndicator = (column: SortableColumn) => {
        if (sortColumn !== column) return null;
        
        return sortDirection === 'asc' 
            ? <ChevronUp className="w-4 h-4 inline-block ml-1" /> 
            : <ChevronDown className="w-4 h-4 inline-block ml-1" />;
    };

    // Apply filters when search is applied
    const applySearch = () => {
        setAppliedNameQuery(nameQuery);
        setAppliedIdQuery(idQuery);
        setActiveFilter('custom');
    };

    // Reset filters
    const resetFilters = () => {
        setNameQuery('');
        setIdQuery('');
        setAppliedNameQuery('');
        setAppliedIdQuery('');
        setActiveFilter('all');
    };

    // Apply filtering to results
    const getFilteredResults = () => {
        if (activeFilter === 'all') return safeTrackedResults;
        
        return safeTrackedResults.filter(result => {
            const matchesName = !appliedNameQuery || 
                (result.name?.toLowerCase().includes(appliedNameQuery.toLowerCase()));
            
            const matchesId = !appliedIdQuery || 
                (result.identifiers?.toLowerCase().includes(appliedIdQuery.toLowerCase()));
            
            return matchesName && matchesId;
        });
    };

    // First filter, then sort
    const getFilteredAndSortedResults = () => {
        const filteredResults = getFilteredResults();
        
        // First sort by tracking status
        const baseResults = [...filteredResults].sort((a, b) => {
            const aIsTracking = tracking?.[a.name]?.isTracking ? 1 : 0;
            const bIsTracking = tracking?.[b.name]?.isTracking ? 1 : 0;
            return bIsTracking - aIsTracking;
        });
        
        // Then apply column-specific sorting
        return baseResults.sort((a, b) => {
            let aVal: any, bVal: any;
            
            switch (sortColumn) {
                case 'identifiers':
                    aVal = a.identifiers || '';
                    bVal = b.identifiers || '';
                    break;
                case 'name':
                    aVal = a.name || '';
                    bVal = b.name || '';
                    break;
                case 'country':
                    aVal = a.country || '';
                    bVal = b.country || '';
                    break;
                case 'aging':
                    aVal = calculateAging(a) || '';
                    bVal = calculateAging(b) || '';
                    break;
                case 'blacklist':
                    aVal = a.isBlacklisted ? 1 : 0;
                    bVal = b.isBlacklisted ? 1 : 0;
                    break;
                case 'risk':
                    aVal = a.riskLevel || 0;
                    bVal = b.riskLevel || 0;
                    break;
                case 'status':
                    aVal = tracking?.[a.name]?.isTracking ? 1 : 0;
                    bVal = tracking?.[b.name]?.isTracking ? 1 : 0;
                    break;
                case 'dataset':
                    aVal = a.dataset || '';
                    bVal = b.dataset || '';
                    break;
                default:
                    return 0;
            }
            
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });
    };

    const handleGeneratePDF = async (person: SearchResult) => {
        setGeneratingPdf(prev => ({ ...prev, [person.id]: true }));
        
        try {
            await generateCustomerPDF(person);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setGeneratingPdf(prev => ({ ...prev, [person.id]: false }));
        }
    };

    // Handle navigating to edit profile page
    const handleEditProfile = (result: SearchResult) => {
        navigate(`/edit-profile/${result.id}`, { state: { profile: result } });
    };

    // Get filtered and sorted results
    const filteredAndSortedResults = getFilteredAndSortedResults();
    const resultsCount = filteredAndSortedResults.length;
    const totalCount = safeTrackedResults.length;

    // Function to handle manual refresh
    const handleManualRefresh = async () => {
        if (isLoading) return;
        
        // We can't directly set isLoading since it's a prop, so we use the callback instead
        setLastUpdated(new Date().toLocaleTimeString());
        
        try {
            // Use the onToggleTracking callback to trigger a refresh in the parent component
            await onToggleTracking('__refresh__', false); // Use a special value to trigger refresh without actual changes
            console.log('🔄 Manual refresh completed');
        } catch (error) {
            console.error('Error during manual refresh:', error);
        }
    };

    // Add state for confirmation dialog
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        name: string;
        pendingStatus: boolean;
    }>({
        isOpen: false,
        name: '',
        pendingStatus: false
    });

    // Handle toggle tracking with confirmation dialog
    const handleToggleTracking = async (name: string, newStatus: boolean) => {
        // If turning off tracking, no need for confirmation
        if (!newStatus) {
            await onToggleTracking(name, newStatus);
            return;
        }

        // Check if this profile was ever tracked before (even if inactive now)
        const wasEverTracked = name in tracking;
        
        // If profile was previously tracked, skip confirmation and just toggle
        if (wasEverTracked) {
            await onToggleTracking(name, newStatus);
            return;
        }

        // Only show confirmation dialog for first-time tracking
        setConfirmDialog({
            isOpen: true,
            name,
            pendingStatus: newStatus
        });
    };

    // Handle confirm tracking from dialog
    const handleConfirmTracking = async () => {
        const { name, pendingStatus } = confirmDialog;
        
        // Close dialog first
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        // Then apply tracking change
        await onToggleTracking(name, pendingStatus);
        
        // Manually trigger a refresh of credits after confirming tracking
        const refreshCreditsEvent = new CustomEvent('refresh-credits');
        window.dispatchEvent(refreshCreditsEvent);
    };

    // Handle cancel from dialog
    const handleCancelTracking = () => {
        setConfirmDialog({ isOpen: false, name: '', pendingStatus: false });
    };

    // Render customer profile details
    if (currentView === 'details' && selectedCustomer) {
        return <CustomerProfileDetails customer={selectedCustomer} onBack={handleBackToList} />;
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={nameQuery}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setNameQuery(value);
                                    if (value.length < MIN_SEARCH_LENGTH) {
                                        // Clear results only if using auto-search
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
                            value={idQuery}
                            onChange={(e) => {
                                setIdQuery(e.target.value);
                            }}
                            placeholder="Search by ID"
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
                        />
                        <button
                            onClick={applySearch}
                            disabled={nameQuery.length > 0 && nameQuery.length < MIN_SEARCH_LENGTH}
                            className={`px-6 py-2 bg-[#4A1D96] text-white rounded-lg text-sm ${
                                nameQuery.length > 0 && nameQuery.length < MIN_SEARCH_LENGTH 
                                ? 'opacity-50 cursor-not-allowed' 
                                : ''
                            }`}
                        >
                            APPLY
                        </button>
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">
                            {activeFilter === 'custom' 
                                ? `Showing ${resultsCount} of ${totalCount} ${tabType === 'alerts' ? 'tracked items' : 'customers'}` 
                                : `Total ${tabType === 'alerts' ? 'tracked items' : 'customers'}: ${totalCount}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Last updated: {lastUpdated}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        {activeFilter === 'custom' && (
                            <button 
                                onClick={resetFilters}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100"
                            >
                                Clear Filter
                            </button>
                        )}
                        <button 
                            onClick={handleManualRefresh}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            ) : safeTrackedResults.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
                    <p className="text-center text-yellow-700">No tracked persons found</p>
                    <p className="text-center text-sm text-yellow-600 mt-2">
                        There are {Object.keys(tracking || {}).length} tracking entries but no matching person records.
                    </p>
                </div>
            ) : filteredAndSortedResults.length === 0 && activeFilter === 'custom' ? (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-md">
                    <p className="text-center text-blue-700">No results match your search</p>
                    <p className="text-center text-sm text-blue-600 mt-2">
                        Try different search terms or click "Clear Filter" to see all {totalCount} tracked items.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500">
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('identifiers')}>
                                    CUSTOMER {renderSortIndicator('identifiers')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer text-center" onClick={() => handleSort('name')}>
                                    FULL NAME {renderSortIndicator('name')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer text-center" onClick={() => handleSort('country')}>
                                    NATIONALITY {renderSortIndicator('country')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer text-center" onClick={() => handleSort('aging')}>
                                    AGING {renderSortIndicator('aging')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer text-center" onClick={() => handleSort('blacklist')}>
                                    BLACKLIST STATUS {renderSortIndicator('blacklist')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer text-center" onClick={() => handleSort('dataset')}>
                                    CATEGORY {renderSortIndicator('dataset')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap text-center">
                                    DOCUMENTATION
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer text-center" onClick={() => handleSort('risk')}>
                                    RISK RATING {renderSortIndicator('risk')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer text-center" onClick={() => handleSort('status')}>
                                    STATUS {renderSortIndicator('status')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap text-center">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedResults.map((result, index) => (
                                <tr key={`tracked-${index}-${result.name}`} 
                                    className="border-t border-gray-100 hover:bg-gray-50 bg-white cursor-pointer"
                                    onClick={() => handleViewCustomer(result)}>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(result.name || 'Unknown')}`} alt={result.name || 'Unknown'} className="w-8 h-8 rounded-full" />
                                            <span className="text-sm">{result.identifiers || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-center">{result.name || 'Unknown'}</td>
                                    <td className="py-4 px-6 text-sm text-center">
                                        {result.country && result.country !== 'Unknown' && result.country !== 'N/A' ? (
                                            <div className="flex items-center justify-center">
                                                <img 
                                                    src={`https://flagcdn.com/w20/${result.country.toLowerCase()}.png`}
                                                    alt={result.country}
                                                    className="mr-2 h-3 rounded shadow-sm"
                                                    title={result.country}
                                                />
                                                {result.country}
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-center">
                                        <span className={tracking?.[result.name]?.isTracking ? 'text-green-600' : 'text-red-600'}>
                                            {calculateAging(result)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        {/* Blacklist status based on dataset */}
                                        {result.dataset === 'onboarded' ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                                <span className="ml-2 text-xs text-green-600">Not Blacklisted</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                </div>
                                                <span className="ml-2 text-xs text-red-600">Blacklisted</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        {result.dataset ? (
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                result.dataset === 'onboarded' 
                                                    ? 'bg-green-100 text-green-700'
                                                    : result.dataset.includes('peps')
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : result.dataset.includes('terrorists')
                                                            ? 'bg-red-100 text-red-700'
                                                            : result.dataset.includes('sanctions')
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : result.dataset.includes('debarment')
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {result.dataset === 'onboarded' 
                                                    ? 'Onboarded' 
                                                    : result.dataset.includes('peps') 
                                                        ? 'PEP' 
                                                        : result.dataset.includes('terrorists') 
                                                            ? 'Terrorist' 
                                                            : result.dataset.includes('sanctions') 
                                                                ? 'Sanctions' 
                                                                : result.dataset.includes('debarment') 
                                                                    ? 'Debarred' 
                                                                    : result.dataset}
                                            </span>
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex justify-center">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleGeneratePDF(result);
                                                }}
                                                disabled={generatingPdf[result.id]}
                                                className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-full transition-colors duration-200"
                                                title="Download Report"
                                            >
                                                {generatingPdf[result.id] ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <FileText className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`text-sm ${getRiskColor(result.riskLevel || 0)}`}>{result.riskLevel || 0}%</span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex justify-center">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                tracking?.[result.name]?.isTracking
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {tracking?.[result.name]?.isTracking ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewCustomer(result);
                                                }}
                                                className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors duration-200"
                                                title="View Profile"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleTracking(result.name, !tracking?.[result.name]?.isTracking);
                                                }}
                                                className={`w-8 h-5 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${tracking?.[result.name]?.isTracking ? 'bg-purple-500' : 'bg-gray-300'}`}
                                                title="Toggle Tracking"
                                            >
                                                <div
                                                    className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-300 ${tracking?.[result.name]?.isTracking ? 'translate-x-5' : 'translate-x-0.5'}`}
                                                ></div>
                                            </button>
                                            
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditProfile(result);
                                                }}
                                                className="p-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition-colors duration-200"
                                                title="Edit Profile"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add the confirmation dialog */}
            <ConfirmationDialog 
                isOpen={confirmDialog.isOpen}
                onConfirm={handleConfirmTracking}
                onCancel={handleCancelTracking}
                title="Confirm Tracking"
                description={`This action will deduct 1 credit from your account to start tracking ${confirmDialog.name}.
                Credits are only deducted the first time you track a profile. You can pause and resume tracking at any time without additional charges.`}
                variant="warning"
            />
        </div>
    );
}

export default ActiveTracking; 