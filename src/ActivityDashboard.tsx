// components/ActivityDashboard.tsx
import React from 'react';
import type { SearchResult, Tracking } from './types'; // Adjust path as necessary

interface ActivityDashboardProps {
  tracking: Tracking;
  trackedResults: SearchResult[];
}

const ActivityDashboard: React.FC<ActivityDashboardProps> = ({ tracking, trackedResults }) => {
    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tracked Persons</h2>
            {trackedResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trackedResults.map((result, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-4">
                            <h3 className="text-lg font-semibold">{result.name}</h3>
                            <p className="text-gray-600">Country: {result.country}</p>
                            <p className="text-gray-600">Risk Level: {result.riskLevel}%</p>
                            <p className="text-gray-600">
                                Status: {tracking[result.name]?.isTracking ? 'Tracking' : 'Stopped Tracking'}
                            </p>
                            {tracking[result.name]?.stopDate && (
                                <p className="text-gray-600">
                                    Stopped Tracking on: {new Date(tracking[result.name].stopDate!).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No persons currently tracked.</p>
            )}
        </div>
    );
};

export default ActivityDashboard;