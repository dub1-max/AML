import React, { useEffect, useState } from 'react';
import { Loader2, XCircle, Download, CheckCircle, RefreshCw } from 'lucide-react';
import { SearchResult, Tracking } from './types';

interface ActiveTrackingProps {
    trackedResults: SearchResult[];
    tracking: Tracking;
    isLoading: boolean;
    onToggleTracking: (name: string, newTrackingStatus: boolean) => Promise<void>;
}

function ActiveTracking({ trackedResults, tracking, isLoading, onToggleTracking }: ActiveTrackingProps) {
    const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
    
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

    // Sort results to show active tracking first
    const sortedResults = [...safeTrackedResults].sort((a, b) => {
        const aIsTracking = tracking?.[a.name]?.isTracking ? 1 : 0;
        const bIsTracking = tracking?.[b.name]?.isTracking ? 1 : 0;
        return bIsTracking - aIsTracking;
    });

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
                                <th className="pb-4 px-6 whitespace-nowrap">TYPE</th>
                                <th className="pb-4 px-6 whitespace-nowrap">CUSTOMER</th>
                                <th className="pb-4 px-6 whitespace-nowrap">FULL NAME</th>
                                <th className="pb-4 px-6 whitespace-nowrap">NATIONALITY</th>
                                <th className="pb-4 px-6 whitespace-nowrap">AGING</th>
                                <th className="pb-4 px-6 whitespace-nowrap">NAME SCREENING</th>
                                <th className="pb-4 px-6 whitespace-nowrap">DOCUMENTATION</th>
                                <th className="pb-4 px-6 whitespace-nowrap">RISK RATING</th>
                                <th className="pb-4 px-6 whitespace-nowrap">STATUS</th>
                                <th className="pb-4 px-6 whitespace-nowrap">TRACKING</th>
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
                                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="w-6 h-6 rounded-full bg-gray-100"></div>
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