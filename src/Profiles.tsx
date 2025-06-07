import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, XCircle, CheckCircle, FileText, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from './config';
import { generateCustomerPDF } from './utils/pdfGenerator';
import { SearchResult as AppSearchResult } from './types';
import ConfirmationDialog from './components/ui/ConfirmationDialog';
import { showAlert } from './components/ui/Alert';

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
  currentPage?: number;          // Current page number
  totalPages?: number;           // Total number of pages
  totalResults?: number;         // Total number of results
  onPageChange?: (page: number) => void; // Callback for page changes
}

function Profiles({ searchResults = [], isLoading: initialLoading = false, currentPage, totalPages, totalResults, onPageChange }: ProfilesProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = getApiBaseUrl();

  // Initialize state
  const [tracking, setTracking] = useState<Tracking>({});
  const [trackedResults, setTrackedResults] = useState<AppSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<{[key: number]: boolean}>({});
  const [pageLoading, setPageLoading] = useState(false); // Loading state for pagination

  // Add state for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    name: string;
    currentStatus: boolean;
  }>({
    isOpen: false,
    name: '',
    currentStatus: false
  });

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

  // Modified to show confirmation dialog
  const handleToggleTracking = (name: string) => {
    const currentTrackingStatus = tracking[name]?.isTracking ?? false;
    
    // If turning off tracking, no need for confirmation
    if (currentTrackingStatus) {
      toggleTracking(name);
      return;
    }
    
    // Check if this profile was ever tracked before (even if inactive now)
    const wasEverTracked = name in tracking;
    
    // If profile was previously tracked, skip confirmation and just toggle
    if (wasEverTracked) {
      toggleTracking(name);
      return;
    }
    
    // Only show confirmation dialog for first-time tracking
    setConfirmDialog({
      isOpen: true,
      name,
      currentStatus: currentTrackingStatus
    });
  };

  // Confirm tracking change from dialog
  const handleConfirmTracking = () => {
    const { name } = confirmDialog;
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    toggleTracking(name);
  };

  // Cancel tracking change
  const handleCancelTracking = () => {
    setConfirmDialog({ isOpen: false, name: '', currentStatus: false });
  };

  // Handle page change with loading state and scroll to top
  const changePage = (newPage: number) => {
    if (!onPageChange || newPage < 1 || newPage > (totalPages || 1) || newPage === currentPage) {
      return;
    }
    
    // Show loading state
    setPageLoading(true);
    
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Call the page change handler
    onPageChange(newPage);
  };
  
  // Watch for searchResults changes to detect when new page data arrives
  useEffect(() => {
    if (pageLoading) {
      setPageLoading(false);
    }
  }, [searchResults]);

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
        
        // Handle insufficient credits error
        if (response.status === 402) {
          const data = await response.json();
          if (data.needCredits) {
            showAlert({
              message: 'You do not have enough credits to track this profile. Please purchase more credits.',
              type: 'error'
            });
            navigate('/credits');
            return;
          }
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
      showAlert({
        message: 'Failed to generate PDF. Please try again.',
        type: 'error'
      });
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
        <>
          <div className="overflow-x-auto relative">
            {pageLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  <p className="mt-2 text-sm text-purple-700 font-medium">Loading results...</p>
                </div>
              </div>
            )}
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-4 px-6 whitespace-nowrap">CUSTOMER</th>
                  <th className="pb-4 px-6 whitespace-nowrap text-center">FULL NAME</th>
                  <th className="pb-4 px-6 whitespace-nowrap text-center">NATIONALITY</th>
                  <th className="pb-4 px-6 whitespace-nowrap text-center">AGING</th>
                  <th className="pb-4 px-6 whitespace-nowrap text-center">NAME SCREENING</th>
                  <th className="pb-4 px-6 whitespace-nowrap text-center">CATEGORY</th>
                  <th className="pb-4 px-6 whitespace-nowrap text-center">DOCUMENTATION</th>
                  <th className="pb-4 px-6 whitespace-nowrap text-center">RISK RATING</th>
                  <th className="pb-4 px-6 whitespace-nowrap text-center">STATUS</th>
                  <th className="pb-4 px-6 whitespace-nowrap text-center">TRACKING</th>
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
                          onClick={() => handleToggleTracking(result.name)}
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
                {safeSearchResults.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={10} className="py-4 px-6 text-center text-gray-500">
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages && totalPages > 1 && onPageChange && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing page {currentPage} of {totalPages} ({totalResults} total results)
              </div>
              <div className="flex items-center space-x-2">
                {/* First page button */}
                <button
                  onClick={() => changePage(1)}
                  disabled={currentPage === 1 || pageLoading}
                  className={`p-2 rounded-md ${
                    currentPage === 1 || pageLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                  aria-label="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                
                {/* Previous page button */}
                <button
                  onClick={() => changePage(currentPage! - 1)}
                  disabled={currentPage === 1 || pageLoading}
                  className={`p-2 rounded-md ${
                    currentPage === 1 || pageLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Page selector */}
                <div className="flex items-center px-2">
                  <select
                    value={currentPage}
                    onChange={(e) => changePage(Number(e.target.value))}
                    disabled={pageLoading}
                    className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <option key={page} value={page}>
                        {page}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Next page button */}
                <button
                  onClick={() => changePage(currentPage! + 1)}
                  disabled={currentPage === totalPages || pageLoading}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages || pageLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {/* Last page button */}
                <button
                  onClick={() => changePage(totalPages!)}
                  disabled={currentPage === totalPages || pageLoading}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages || pageLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                  aria-label="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
                
                {/* Loading indicator */}
                {pageLoading && (
                  <span className="ml-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
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

export default Profiles;