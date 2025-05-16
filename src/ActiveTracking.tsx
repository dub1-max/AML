import React, { useEffect, useState, useCallback, memo } from 'react';
import { Loader2, XCircle, Download, CheckCircle, RefreshCw, FileText, ChevronUp, ChevronDown, Search, Edit } from 'lucide-react';
import { SearchResult, Tracking } from './types';
import { generateCustomerPDF } from './utils/pdfGenerator';
import { useNavigate } from 'react-router-dom';

interface ActiveTrackingProps {
    trackedResults: SearchResult[];
    tracking: Tracking;
    isLoading: boolean;
    onToggleTracking: (name: string, newTrackingStatus: boolean) => Promise<void>;
}

type SortableColumn = 'identifiers' | 'name' | 'country' | 'aging' | 'blacklist' | 'risk' | 'status';
type SortDirection = 'asc' | 'desc';

// Virtualized row component for better performance
const TableRow = memo(({ 
    result, 
    tracking, 
    onToggleTracking, 
    handleEditProfile, 
    handleGeneratePDF, 
    generatingPdf, 
    calculateAging, 
    getRiskColor 
}: { 
    result: SearchResult, 
    tracking: any, 
    onToggleTracking: Function, 
    handleEditProfile: Function, 
    handleGeneratePDF: Function, 
    generatingPdf: any, 
    calculateAging: Function, 
    getRiskColor: Function 
}) => (
    <tr className={`border-t border-gray-100 hover:bg-gray-50 ${
        tracking?.[result.name]?.isTracking 
            ? 'bg-white' 
            : 'bg-gray-50'
    }`}>
        <td className="py-4 px-6">
            <div className="flex items-center space-x-3">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(result.name || 'Unknown')}&size=32`} alt={result.name || 'Unknown'} className="w-8 h-8 rounded-full" />
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
                        loading="lazy"
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
            <div className="flex justify-center">
                <button 
                    onClick={() => handleGeneratePDF(result)}
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
                    onClick={() => onToggleTracking(result.name, !tracking?.[result.name]?.isTracking)}
                    className={`w-8 h-5 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${tracking?.[result.name]?.isTracking ? 'bg-purple-500' : 'bg-gray-300'}`}
                >
                    <div
                        className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-300 ${tracking?.[result.name]?.isTracking ? 'translate-x-3' : 'translate-x-0'}`}
                    ></div>
                </button>
                
                <button
                    onClick={() => handleEditProfile(result)}
                    className="ml-2 p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors duration-200"
                    title="Edit Profile"
                >
                    <Edit className="w-4 h-4" />
                </button>
            </div>
        </td>
    </tr>
));

// Memoized table headers component
const TableHeaders = memo(({ 
    handleSort, 
    sortColumn, 
    renderSortIndicator 
}: { 
    handleSort: Function, 
    sortColumn: string, 
    renderSortIndicator: Function 
}) => (
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
                TRACKING
            </th>
        </tr>
    </thead>
));

function ActiveTracking({ trackedResults, tracking, isLoading, onToggleTracking }: ActiveTrackingProps) {
    const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
    const [generatingPdf, setGeneratingPdf] = useState<{[key: number]: boolean}>({});
    const [sortColumn, setSortColumn] = useState<SortableColumn>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [nameQuery, setNameQuery] = useState<string>('');
    const [idQuery, setIdQuery] = useState<string>('');
    const [appliedNameQuery, setAppliedNameQuery] = useState<string>('');
    const [appliedIdQuery, setAppliedIdQuery] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'custom'>('all');
    // Only display up to 50 rows at a time for performance
    const [displayCount, setDisplayCount] = useState<number>(50);
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

    // Memoize these functions to prevent unnecessary re-renders
    const getRiskColor = useCallback((percentage: number): string => {
        if (percentage >= 85) return 'text-red-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-green-600';
    }, []);

    const calculateAging = useCallback((result: SearchResult): string => {
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
    }, [tracking]);

    // Add safety check for trackedResults
    const safeTrackedResults = Array.isArray(trackedResults) ? trackedResults : [];
    console.log('🔶 Safe tracked results count:', safeTrackedResults.length);
    
    if (safeTrackedResults.length === 0 && !isLoading) {
        console.log('🔶 No tracked results and not loading');
    }

    // Sort function for column headers - memoized
    const handleSort = useCallback((column: SortableColumn) => {
        if (sortColumn === column) {
            // Toggle direction if same column
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new column and default to ascending
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn, sortDirection]);

    // Render sort indicator - memoized
    const renderSortIndicator = useCallback((column: string) => {
        if (sortColumn !== column) return null;
        
        return sortDirection === 'asc' 
            ? <ChevronUp className="w-4 h-4 inline-block ml-1" /> 
            : <ChevronDown className="w-4 h-4 inline-block ml-1" />;
    }, [sortColumn, sortDirection]);

    // Apply filters when search is applied
    const applySearch = useCallback(() => {
        setAppliedNameQuery(nameQuery);
        setAppliedIdQuery(idQuery);
        setActiveFilter('custom');
        // Reset to first page when applying new filters
        setDisplayCount(50);
    }, [nameQuery, idQuery]);

    // Reset filters
    const resetFilters = useCallback(() => {
        setNameQuery('');
        setIdQuery('');
        setAppliedNameQuery('');
        setAppliedIdQuery('');
        setActiveFilter('all');
        setDisplayCount(50);
    }, []);

    // Apply filtering to results - memoized for performance
    const getFilteredResults = useCallback(() => {
        if (activeFilter === 'all') return safeTrackedResults;
        
        return safeTrackedResults.filter(result => {
            const matchesName = !appliedNameQuery || 
                (result.name?.toLowerCase().includes(appliedNameQuery.toLowerCase()));
            
            const matchesId = !appliedIdQuery || 
                (result.identifiers?.toLowerCase().includes(appliedIdQuery.toLowerCase()));
            
            return matchesName && matchesId;
        });
    }, [safeTrackedResults, activeFilter, appliedNameQuery, appliedIdQuery]);

    // First filter, then sort - memoized for performance
    const getFilteredAndSortedResults = useCallback(() => {
        const filteredResults = getFilteredResults();
        
        // First sort by tracking status
        const baseResults = [...filteredResults].sort((a, b) => {
            const aIsTracking = tracking?.[a.name]?.isTracking ? 1 : 0;
            const bIsTracking = tracking?.[b.name]?.isTracking ? 1 : 0;
            return bIsTracking - aIsTracking;
        });
        
        // Then apply column-specific sorting
        return baseResults.sort((a, b) => {
            const multiplier = sortDirection === 'asc' ? 1 : -1;
            
            switch (sortColumn) {
                case 'identifiers':
                    return multiplier * (a.identifiers || '').localeCompare(b.identifiers || '');
                case 'name':
                    return multiplier * (a.name || '').localeCompare(b.name || '');
                case 'country':
                    return multiplier * (a.country || '').localeCompare(b.country || '');
                case 'aging':
                    const aAging = calculateAging(a).replace('D', '');
                    const bAging = calculateAging(b).replace('D', '');
                    return multiplier * (parseInt(aAging) || 0) - (parseInt(bAging) || 0);
                case 'blacklist':
                    const aBlacklist = a.dataset === 'onboarded' ? 0 : 1;
                    const bBlacklist = b.dataset === 'onboarded' ? 0 : 1;
                    return multiplier * (aBlacklist - bBlacklist);
                case 'risk':
                    return multiplier * ((a.riskLevel || 0) - (b.riskLevel || 0));
                case 'status':
                    const aStatus = tracking?.[a.name]?.isTracking ? 1 : 0;
                    const bStatus = tracking?.[b.name]?.isTracking ? 1 : 0;
                    return multiplier * (aStatus - bStatus);
                default:
                    return 0;
            }
        });
    }, [getFilteredResults, tracking, sortColumn, sortDirection, calculateAging]);

    // Memoized handler for PDF generation
    const handleGeneratePDF = useCallback(async (person: SearchResult) => {
        try {
            // Set PDF generation status for this person
            setGeneratingPdf(prev => ({ ...prev, [person.id]: true }));
            
            // Generate the PDF
            await generateCustomerPDF(person);
            
            // Reset PDF generation status
            setGeneratingPdf(prev => ({ ...prev, [person.id]: false }));
        } catch (error) {
            console.error('Error generating PDF:', error);
            setGeneratingPdf(prev => ({ ...prev, [person.id]: false }));
            alert('Failed to generate PDF. Please try again.');
        }
    }, []);

    // Handle navigating to edit profile page
    const handleEditProfile = useCallback((result: SearchResult) => {
        navigate(`/edit-profile/${result.id}`, { state: { profile: result } });
    }, [navigate]);

    // Function to handle manual refresh
    const handleManualRefresh = useCallback(async () => {
        if (isLoading) return;
        
        // We can't directly set isLoading since it's a prop, so we use the callback instead
        setLastUpdated(new Date().toLocaleTimeString());
        
        try {
            // Use the onToggleTracking callback to trigger a refresh in the parent component
            await onToggleTracking('__refresh__', false); // Use a special value to trigger refresh without actual changes
        } catch (error) {
            console.error('Error during manual refresh:', error);
        }
    }, [isLoading, onToggleTracking]);
    
    // Load more results when user scrolls near the bottom
    const handleLoadMore = useCallback(() => {
        setDisplayCount(prev => prev + 50);
    }, []);

    // Get filtered and sorted results
    const filteredAndSortedResults = getFilteredAndSortedResults();
    // Show only a limited number for better performance
    const visibleResults = filteredAndSortedResults.slice(0, displayCount);
    const resultsCount = filteredAndSortedResults.length;
    const totalCount = safeTrackedResults.length;
    // Check if there are more results to load
    const hasMoreResults = displayCount < filteredAndSortedResults.length;

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
                                onChange={(e) => setNameQuery(e.target.value)}
                                placeholder={`Search by name (min. ${MIN_SEARCH_LENGTH} characters)`}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={idQuery}
                            onChange={(e) => setIdQuery(e.target.value)}
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
                                ? `Showing ${Math.min(displayCount, resultsCount)} of ${totalCount} tracked items (${resultsCount} matched)` 
                                : `Showing ${Math.min(displayCount, totalCount)} of ${totalCount} tracked items`}
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

            {isLoading && visibleResults.length === 0 ? (
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
                        <TableHeaders 
                            handleSort={handleSort} 
                            sortColumn={sortColumn} 
                            renderSortIndicator={renderSortIndicator} 
                        />
                        <tbody>
                            {visibleResults.map((result, index) => (
                                <TableRow 
                                    key={`tracked-${index}-${result.name}`}
                                    result={result}
                                    tracking={tracking}
                                    onToggleTracking={onToggleTracking}
                                    handleEditProfile={handleEditProfile}
                                    handleGeneratePDF={handleGeneratePDF}
                                    generatingPdf={generatingPdf}
                                    calculateAging={calculateAging}
                                    getRiskColor={getRiskColor}
                                />
                            ))}
                        </tbody>
                    </table>
                    
                    {/* Load more button */}
                    {hasMoreResults && (
                        <div className="text-center mt-4">
                            <button
                                onClick={handleLoadMore}
                                className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
                            >
                                Load More Results
                            </button>
                        </div>
                    )}
                    
                    {/* Loading indicator when loading more results */}
                    {isLoading && visibleResults.length > 0 && (
                        <div className="text-center mt-4">
                            <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default memo(ActiveTracking); 