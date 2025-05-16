import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, XCircle, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from './config';
import { generateCustomerPDF } from './utils/pdfGenerator';
import { SearchResult as AppSearchResult } from './types';

interface Tracking {
  [key: string]: {
    isTracking: boolean;
    startDate?: string;
    stopDate?: string;
  };
}

interface ProfilesProps {
  searchResults: AppSearchResult[];  // Initial search results from parent
  isLoading: boolean;            // Initial loading state from parent
}

function Profiles({ searchResults = [], isLoading: initialLoading = false }: ProfilesProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = getApiBaseUrl();

  // Initialize state
  const [tracking, setTracking] = useState<Tracking>({});
  const [trackedResults, setTrackedResults] = useState<AppSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<{[key: number]: boolean}>({});

  // Calculate aging with memoization
  const calculateAging = useCallback((result: AppSearchResult): string => {
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
  }, [tracking]);

  // Add safety check for searchResults
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];

  const getRiskColor = (percentage: number): string => {
    if (percentage >= 85) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const toggleTracking = async (name: string) => {
    try {
      const currentTrackingStatus = tracking[name]?.isTracking ?? false;
      const response = await fetch(`${API_BASE_URL}/tracking/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTracking: !currentTrackingStatus }),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to update tracking');
      }

      setTracking(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          isTracking: !currentTrackingStatus,
          startDate: !currentTrackingStatus ? new Date().toISOString() : prev[name]?.startDate,
          stopDate: currentTrackingStatus ? new Date().toISOString() : undefined
        }
      }));

    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  };

  const handleGeneratePDF = async (person: AppSearchResult) => {
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

  // Show error state if there's an error
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
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
              {safeSearchResults.map((result, index) => (
                <tr key={`search-${index}`} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img src={`https://ui-avatars.com/api/?name=${result.name}`} alt={result.name} className="w-8 h-8 rounded-full" />
                      <span className="text-sm">{result.identifiers}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm">{result.name}</td>
                  <td className="py-4 px-6 text-sm">
                    {result.country && result.country !== 'Unknown' && result.country !== 'N/A' ? (
                      <div className="flex items-center">
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
                  <td className="py-4 px-6 text-sm" dangerouslySetInnerHTML={{ __html: calculateAging(result) }} />
                  <td className="py-4 px-6">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-500" />
                    </div>
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
                    <span className={`text-sm ${getRiskColor(result.riskLevel)}`}>{result.riskLevel}%</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Review</span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleTracking(result.name)}
                      className={`w-8 h-5 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${
                        tracking[result.name]?.isTracking ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                          tracking[result.name]?.isTracking ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      ></div>
                    </button>
                  </td>
                </tr>
              ))}
              {safeSearchResults.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={9} className="py-4 px-6 text-center text-gray-500">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Profiles;