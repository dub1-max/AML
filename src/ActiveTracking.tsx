import React, { useEffect, useState } from 'react';
import { Loader2, XCircle, Download, CheckCircle, RefreshCw, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { SearchResult, Tracking } from './types';
import { generateCustomerPDF } from './utils/pdfGenerator';

interface ActiveTrackingProps {
    trackedResults: SearchResult[];
    tracking: Tracking;
    isLoading: boolean;
    onToggleTracking: (name: string, newTrackingStatus: boolean) => Promise<void>;
}

type SortableColumn = 'type' | 'identifiers' | 'name' | 'country' | 'aging' | 'blacklist' | 'risk' | 'status';
type SortDirection = 'asc' | 'desc';

function ActiveTracking({ trackedResults, tracking, isLoading, onToggleTracking }: ActiveTrackingProps) {
    const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
    const [generatingPdf, setGeneratingPdf] = useState<{[key: number]: boolean}>({});
    const [sortColumn, setSortColumn] = useState<SortableColumn>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    
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

    // Apply sorting to results
    const getSortedResults = () => {
        // First sort by tracking status
        const baseResults = [...safeTrackedResults].sort((a, b) => {
            const aIsTracking = tracking?.[a.name]?.isTracking ? 1 : 0;
            const bIsTracking = tracking?.[b.name]?.isTracking ? 1 : 0;
            return bIsTracking - aIsTracking;
        });
        
        // Then apply column-specific sorting
        return baseResults.sort((a, b) => {
            const multiplier = sortDirection === 'asc' ? 1 : -1;
            
            switch (sortColumn) {
                case 'type':
                    return multiplier * (a.type || '').localeCompare(b.type || '');
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
    };

    const handleGeneratePDF = async (person: SearchResult) => {
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
    };

    // Get sorted results
    const sortedResults = getSortedResults();

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold">Active Tracking</h2>
                    <p className="text-gray-600">Monitor and manage your tracked profiles</p>
                    <p className="text-sm text-gray-500">
                        Total tracked items: {safeTrackedResults.length} 
                        (Active: {safeTrackedResults.filter(r => tracking?.[r.name]?.isTracking).length})
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Last updated: {lastUpdated}
                    </p>
                </div>
                <div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200"
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
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500">
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('type')}>
                                    TYPE {renderSortIndicator('type')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('identifiers')}>
                                    CUSTOMER {renderSortIndicator('identifiers')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('name')}>
                                    FULL NAME {renderSortIndicator('name')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('country')}>
                                    NATIONALITY {renderSortIndicator('country')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('aging')}>
                                    AGING {renderSortIndicator('aging')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('blacklist')}>
                                    BLACKLIST STATUS {renderSortIndicator('blacklist')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap">
                                    DOCUMENTATION
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('risk')}>
                                    RISK RATING {renderSortIndicator('risk')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('status')}>
                                    STATUS {renderSortIndicator('status')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap">
                                    TRACKING
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedResults.map((result, index) => (
                                <tr key={`tracked-${index}-${result.name}`} 
                                    className={`border-t border-gray-100 hover:bg-gray-50 ${
                                        tracking?.[result.name]?.isTracking 
                                            ? 'bg-white' 
                                            : 'bg-gray-50'
                                    }`}>
                                    <td className="py-4 px-6">
                                        <div className={`w-1 h-6 rounded-full ${getRiskColor(result.riskLevel || 0).replace('text', 'bg')}`}></div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(result.name || 'Unknown')}`} alt={result.name || 'Unknown'} className="w-8 h-8 rounded-full" />
                                            <span className="text-sm">{result.identifiers || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm">{result.name || 'Unknown'}</td>
                                    <td className="py-4 px-6 text-sm">{result.country || 'Unknown'}</td>
                                    <td className="py-4 px-6 text-sm">
                                        <span className={tracking?.[result.name]?.isTracking ? 'text-green-600' : 'text-red-600'}>
                                            {calculateAging(result)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        {/* Blacklist status based on dataset */}
                                        {result.dataset === 'onboarded' ? (
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                                <span className="ml-2 text-xs text-green-600">Not Blacklisted</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                </div>
                                                <span className="ml-2 text-xs text-red-600">Blacklisted</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
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
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`text-sm ${getRiskColor(result.riskLevel || 0)}`}>{result.riskLevel || 0}%</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            tracking?.[result.name]?.isTracking
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {tracking?.[result.name]?.isTracking ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={() => onToggleTracking(result.name, !tracking?.[result.name]?.isTracking)}
                                            className={`w-8 h-5 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${tracking?.[result.name]?.isTracking ? 'bg-purple-500' : 'bg-gray-300'}`}
                                        >
                                            <div
                                                className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-300 ${tracking?.[result.name]?.isTracking ? 'translate-x-3' : 'translate-x-0'}`}
                                            ></div>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ActiveTracking; 