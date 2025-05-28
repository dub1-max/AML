import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import ActiveTracking from './ActiveTracking';
import { SearchResult, Tracking } from './types';

interface ScreeningProps {
    trackedResults: SearchResult[];
    tracking: Tracking;
    isLoading: boolean;
    onToggleTracking: (name: string, newTrackingStatus: boolean) => Promise<void>;
}

function Screening({ trackedResults, tracking, isLoading, onToggleTracking }: ScreeningProps) {
    const [activeTab, setActiveTab] = useState('alerts');

    return (
        <div className="p-6">
            <Tabs defaultValue="alerts" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="alerts" className="text-sm">
                        Alerts
                    </TabsTrigger>
                    <TabsTrigger value="customers" className="text-sm">
                        Customers
                    </TabsTrigger>
                    <TabsTrigger value="deeplinks" className="text-sm">
                        Deeplinks Sent
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="alerts">
                    <ActiveTracking 
                        trackedResults={trackedResults}
                        tracking={tracking}
                        isLoading={isLoading}
                        onToggleTracking={onToggleTracking}
                    />
                </TabsContent>

                <TabsContent value="customers">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500">
                                    <th className="pb-4 px-6 whitespace-nowrap">ID/NAME</th>
                                    <th className="pb-4 px-6 whitespace-nowrap text-center">COUNTRY</th>
                                    <th className="pb-4 px-6 whitespace-nowrap text-center">CATEGORY</th>
                                    <th className="pb-4 px-6 whitespace-nowrap text-center">STATUS</th>
                                    <th className="pb-4 px-6 whitespace-nowrap text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trackedResults.map((result, index) => (
                                    <tr key={`customer-${index}`} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <img 
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(result.name || 'Unknown')}`} 
                                                    alt={result.name || 'Unknown'} 
                                                    className="w-8 h-8 rounded-full" 
                                                />
                                                <span className="text-sm">{result.name || 'Unknown'}</span>
                                            </div>
                                        </td>
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
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                tracking[result.name]?.isTracking
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {tracking[result.name]?.isTracking ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => onToggleTracking(result.name, !tracking[result.name]?.isTracking)}
                                                    className={`px-3 py-1 text-xs rounded-md ${
                                                        tracking[result.name]?.isTracking
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                                >
                                                    {tracking[result.name]?.isTracking ? 'Stop' : 'Start'} Tracking
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="deeplinks">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-base font-medium text-gray-900 mb-4">Deeplinks History</h3>
                        <div className="text-center text-gray-500 py-8">
                            No deeplinks have been sent yet.
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default Screening; 