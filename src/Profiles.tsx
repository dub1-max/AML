// Profiles.tsx
import React, { useState, useEffect } from 'react';
import { SearchResult, Tracking } from './types';
import { Loader2, XCircle } from 'lucide-react';
import { useAuth } from './AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface ProfilesProps {
    searchResults: SearchResult[];
    // Removed tracking, trackedResults, toggleTracking
    isLoading: boolean; // Keep isLoading
}

function Profiles({ searchResults, isLoading }: ProfilesProps) {
    const { user } = useAuth(); // Use useAuth to get the user
    const navigate = useNavigate(); // Use useNavigate for navigation
    const [tracking, setTracking] = useState<Tracking>({});
    const [trackedResults, setTrackedResults] = useState<SearchResult[]>([]);

    const API_BASE_URL = 'http://localhost:3001/api'; // Add API_BASE_URL here

     const fetchTrackedData = async () => {
        if (!user) return;

        // Removed setIsLoading(true); from here
        try {
            const response = await fetch(`${API_BASE_URL}/tracking`, {
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            const trackingData: any[] = await response.json();
            const transformedTracking: Tracking = {};

            trackingData.forEach(item => {
                transformedTracking[item.name] = {
                    isTracking: item.isTracking === 1,
                    startDate: item.startDate,
                    stopDate: item.stopDate
                };
            });

            setTracking(transformedTracking);
        } catch (error) {
            console.error('Could not fetch tracked data:', error);
            setTracking({});
        } finally {
           // Removed setIsLoading(false); from here
        }
    };


    useEffect(() => {
        fetchTrackedData();
    }, [user, navigate]
); // Keep user and navigate in the dependency array

useEffect(() => {
  const fetchTracked = async () => {
      if (Object.keys(tracking).length === 0) {
          setTrackedResults([]);
          return;
      }
       // Removed setIsLoading(true); from here
      try {
          const response = await fetch(`${API_BASE_URL}/persons`, {
              credentials: 'include',
          });

          if (!response.ok) {
              if (response.status === 401) {
                  navigate('/login');
                  return;
              }
              throw new Error(`HTTP Error! Status: ${response.status}`);
          }

          const allResults: SearchResult[] = await response.json();
          const tracked = allResults.filter(result => tracking[result.name]?.isTracking);
          setTrackedResults(tracked);
      } catch (error) {
          console.error('Could not fetch tracked results:', error);
      } finally {
           // Removed setIsLoading(false); from here

      }
  };
  fetchTracked();
}, [tracking, user, navigate]); // Add user and navigate to dependencies


const updateTracking = async (name: string, newTrackingStatus: boolean) => {
  try {
      const response = await fetch(`${API_BASE_URL}/tracking/${name}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isTracking: newTrackingStatus }),
          credentials: 'include',
      });

      if (!response.ok) {
          if (response.status === 401) {
              navigate('/login');
              return;
          }
          let errorMessage = `Server error: ${response.status}`;
          try {
              const errorData = await response.json();
              errorMessage += ` - ${errorData.message}`;
          } catch (e) {
              const text = await response.text();
              errorMessage += ` - ${text}`;
          }
          throw new Error(errorMessage);
      }

      await fetchTrackedData(); // Fetch updated tracking data
  } catch (error: any) {
      console.error('Error updating tracking:', error.message);
  }
};

const toggleTracking = (name: string) => {
  const currentTrackingStatus = tracking[name]?.isTracking ?? false;
  updateTracking(name, !currentTrackingStatus); // Call the update function

    setTracking((prevTracking) => {
      const newTracking = { ...prevTracking };
      if (newTracking[name]) {
          newTracking[name] = {
              ...newTracking[name],
              isTracking: !newTracking[name].isTracking,
              stopDate: newTracking[name].isTracking ? new Date().toISOString() : undefined,
              startDate: newTracking[name].isTracking ? undefined : newTracking[name].startDate
          }
      } else {
          newTracking[name] = {
              isTracking: true,
              startDate: new Date().toISOString()
          }
      }
      return newTracking;
  });
};



const calculateAging = (result: SearchResult): string => {
  const trackingInfo = tracking[result.name];

  if (trackingInfo?.isTracking) {
      if (trackingInfo.startDate) {
          const startDate = new Date(trackingInfo.startDate);
          const diffInDays = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          return `${diffInDays}D`;
      }
      return '0D';
  } else if (trackingInfo?.stopDate) {
      if (trackingInfo.startDate) {
          const startDate = new Date(trackingInfo.startDate);
          const stopDate = new Date(trackingInfo.stopDate);
          const diffInDays = Math.floor((stopDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          return `<span style="color: red;">${diffInDays}D</span>`;
      }
      return '<span style="color: red;">0D</span>';
  } else {
      return 'None';
  }
};

const getRiskColor = (percentage: number): string => {
  if (percentage >= 85) return 'text-red-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-green-600';
};

return (
  <div className="p-6">
      {isLoading ? (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
      ) : (
          <table className="w-full">
              <thead>
                  <tr className="text-left text-sm text-gray-500">
                      <th className="pb-4">TYPE</th>
                      <th className="pb-4">CUSTOMER</th>
                      <th className="pb-4">FULL NAME</th>
                      <th className="pb-4">NATIONALITY</th>
                      <th className="pb-4">AGING</th>
                      <th className="pb-4">NAME SCREENING</th>
                      <th className="pb-4">DOCUMENTATION</th>
                      <th className="pb-4">RISK RATING</th>
                      <th className="pb-4">STATUS</th>
                      <th className="pb-4">TRACKING</th>
                  </tr>
              </thead>
              <tbody>
                  {(trackedResults.length > 0 ? trackedResults : searchResults).map(
                      (result, index) => {
                          const isTracking =
                              tracking[result.name]?.isTracking ?? false;
                          const agingContent = calculateAging(result);
                          return (
                              <tr
                                  key={index}
                                  className="border-t border-gray-100 hover:bg-gray-50"
                              >
                                  <td className="py-4">
                                      <div
                                          className={`w-1 h-6 ${result.riskLevel >= 85
                                              ? 'bg-red-500'
                                              : result.riskLevel >= 60
                                                  ? 'bg-yellow-500'
                                                  : 'bg-green-500'
                                              } rounded-full`}
                                      ></div>
                                  </td>
                                  <td>
                                      <div className="flex items-center space-x-3">
                                          <img
                                              src={`https://ui-avatars.com/api/?name=${result.name}`}
                                              alt={result.name}
                                              className="w-8 h-8 rounded-full"
                                          />
                                          <span className="text-sm">
                                              {result.identifiers}
                                          </span>
                                      </div>
                                  </td>
                                  <td className="text-sm">{result.name}</td>
                                  <td className="text-sm">{result.country}</td>
                                  <td className="text-sm" dangerouslySetInnerHTML={{ __html: agingContent }} />

                                  <td>
                                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                          <XCircle className="w-4 h-4 text-red-500" />
                                      </div>
                                  </td>
                                  <td>
                                      <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                                  </td>
                                  <td>
                                      <span
                                          className={`text-sm ${getRiskColor(
                                              result.riskLevel
                                          )}`}
                                      >
                                          {result.riskLevel}%
                                      </span>
                                  </td>
                                  <td>
                                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                          Review
                                      </span>
                                  </td>
                                  <td>
                                      <button
                                          onClick={() => toggleTracking(result.name)}
                                          className={`w-8 h-5 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${isTracking ? 'bg-purple-500' : 'bg-gray-300'
                                              }`}
                                      >
                                          <div
                                              className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isTracking
                                                  ? 'translate-x-3'
                                                  : 'translate-x-0'
                                                  }`}
                                          ></div>
                                      </button>
                                  </td>
                              </tr>
                          );
                      }
                  )}
              </tbody>
          </table>
      )}
  </div>
);
}

export default Profiles;