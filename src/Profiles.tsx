import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, XCircle, CheckCircle, FileText, Search } from 'lucide-react';
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
  const [nameQuery, setNameQuery] = useState<string>('');
  const [idQuery, setIdQuery] = useState<string>('');
  const [appliedNameQuery, setAppliedNameQuery] = useState<string>('');
  const [appliedIdQuery, setAppliedIdQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'custom'>('all');

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

  // Get filtered results
  const getFilteredResults = () => {
    if (activeFilter === 'all') return safeSearchResults;
    
    return safeSearchResults.filter(result => {
      const matchesName = !appliedNameQuery || 
          (result.name?.toLowerCase().includes(appliedNameQuery.toLowerCase()));
      
      const matchesId = !appliedIdQuery || 
          (result.identifiers?.toLowerCase().includes(appliedIdQuery.toLowerCase()));
      
      return matchesName && matchesId;
    });
  };

  // Get filtered results
  const filteredResults = getFilteredResults();
  const resultsCount = filteredResults.length;
  const totalCount = safeSearchResults.length;

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
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button 
            onClick={resetFilters}
            className={`mr-2 px-6 py-2 rounded-full font-medium ${
              activeFilter === 'all' 
                ? 'bg-purple-700 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name (min. 2 characters)"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <input
              type="text"
              placeholder="Search by ID"
              value={idQuery}
              onChange={(e) => setIdQuery(e.target.value)}
              className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            
            <button 
              onClick={applySearch}
              disabled={nameQuery.length > 0 && nameQuery.length < 2}
              className={`px-6 py-2 bg-purple-700 text-white font-semibold rounded-md hover:bg-purple-800 transition-colors ${
                nameQuery.length > 0 && nameQuery.length < 2 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              APPLY
            </button>
          </div>
        </div>
        
        {/* Display search results count */}
        <p className="text-sm text-gray-500 mb-4">
          {activeFilter === 'custom' 
            ? `Showing ${resultsCount} of ${totalCount} profiles` 
            : `Total profiles: ${totalCount}`}
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : filteredResults.length === 0 && activeFilter === 'custom' ? (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-md">
          <p className="text-center text-blue-700">No results match your search</p>
          <p className="text-center text-sm text-blue-600 mt-2">
            Try different search terms or click "All" to see all {totalCount} profiles.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-4 px-6 whitespace-nowrap">CUSTOMER</th>
                <th className="pb-4 px-6 whitespace-nowrap text-center">FULL NAME</th>
                <th className="pb-4 px-6 whitespace-nowrap text-center">NATIONALITY</th>
                <th className="pb-4 px-6 whitespace-nowrap text-center">AGING</th>
                <th className="pb-4 px-6 whitespace-nowrap text-center">NAME SCREENING</th>
                <th className="pb-4 px-6 whitespace-nowrap text-center">DOCUMENTATION</th>
                <th className="pb-4 px-6 whitespace-nowrap text-center">RISK RATING</th>
                <th className="pb-4 px-6 whitespace-nowrap text-center">STATUS</th>
                <th className="pb-4 px-6 whitespace-nowrap text-center">TRACKING</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, index) => (
                <tr key={`search-${index}`} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img src={`https://ui-avatars.com/api/?name=${result.name}`} alt={result.name} className="w-8 h-8 rounded-full" />
                      <span className="text-sm">{result.identifiers}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-center">{result.name}</td>
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
                  <td className="py-4 px-6 text-sm text-center" dangerouslySetInnerHTML={{ __html: calculateAging(result) }} />
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
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
                    <span className={`text-sm ${getRiskColor(result.riskLevel)}`}>{result.riskLevel}%</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Review</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center">
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
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && !isLoading && activeFilter === 'all' && (
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