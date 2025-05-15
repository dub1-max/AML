import React from 'react';
import { Loader2, XCircle, Download, CheckCircle } from 'lucide-react';
import { SearchResult, Tracking } from './types';

interface ActiveTrackingProps {
    trackedResults: SearchResult[];
    tracking: Tracking;
    isLoading: boolean;
    onToggleTracking: (name: string, newTrackingStatus: boolean) => Promise<void>;
}

function ActiveTracking({ trackedResults, tracking, isLoading, onToggleTracking }: ActiveTrackingProps) {
    const getRiskColor = (percentage: number): string => {
        if (percentage >= 85) return 'text-red-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-green-600';
    };

    const calculateAging = (result: SearchResult): string => {
        const trackingInfo = tracking[result.name];
        
        if (!trackingInfo) return 'None';
        
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
            return `<span style="color: red;">${diffInDays}D</span>`;
        }
        
        return 'None';
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold">Active Tracking</h2>
                <p className="text-gray-600">Monitor and manage your tracked profiles</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
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
                            {trackedResults.map((result, index) => (
                                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-6">
                                        <div className={`w-1 h-6 rounded-full ${getRiskColor(result.riskLevel).replace('text', 'bg')}`}></div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <img src={`https://ui-avatars.com/api/?name=${result.name}`} alt={result.name} className="w-8 h-8 rounded-full" />
                                            <span className="text-sm">{result.identifiers}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm">{result.name}</td>
                                    <td className="py-4 px-6 text-sm">{result.country}</td>
                                    <td className="py-4 px-6 text-sm" dangerouslySetInnerHTML={{ __html: calculateAging(result) }} />
                                    <td className="py-4 px-6">
                                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`text-sm ${getRiskColor(result.riskLevel)}`}>{result.riskLevel}%</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Review</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={() => onToggleTracking(result.name, !tracking[result.name]?.isTracking)}
                                            className={`w-8 h-5 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${tracking[result.name]?.isTracking ? 'bg-purple-500' : 'bg-gray-300'}`}
                                        >
                                            <div
                                                className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-300 ${tracking[result.name]?.isTracking ? 'translate-x-3' : 'translate-x-0'}`}
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