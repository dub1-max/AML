// Profiles.tsx
import React, { useState, useEffect } from 'react';
import { Loader2, XCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  name: string;
  identifiers: string;
  country: string;
  riskLevel: number;
}

interface Tracking {
  [key: string]: {
    isTracking: boolean;
    startDate?: string;
    stopDate?: string;
  };
}

interface CompanyOB {
  user_id: string;
  company_name: string;
  registration_number: string;
  company_type: string;
  incorporation_date: string;
  business_nature: string;
  industry_sector: string;
  annual_turnover: number;
  employee_count: number;
  website_url: string;
  registered_address: string;
  operating_address: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  contact_person_name: string;
  contact_email: string;
  contact_phone: string;
  tax_number: string;
  regulatory_licenses: string;
}

interface IndividualOB {
  user_id: string;
  full_name: string;
  email: string;
  resident_status: string;
  gender: string;
  date_of_birth: string;
  nationality: string;
  country_of_residence: string;
  other_nationalities: string;
  specified_other_nationalities: string;
  national_id_number: string;
  national_id_expiry: string;
  passport_number: string;
  passport_expiry: string;
  address: string;
  state: string;
  city: string;
  zip_code: string;
  contact_number: string;
  dialing_code: string;
  work_type: string;
  industry: string;
  product_type_offered: string;
  product_offered: string;
  company_name: string;
  position_in_company: string;
}

interface ProfilesProps {
  searchResults: SearchResult[];
  isLoading: boolean;
}

function Profiles({ searchResults, isLoading }: ProfilesProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState<Tracking>({});
  const [trackedResults, setTrackedResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState<'alerts' | 'customerProfiles'>('alerts');
  const [companyData, setCompanyData] = useState<CompanyOB[]>([]);
  const [individualData, setIndividualData] = useState<IndividualOB[]>([]);

  const API_BASE_URL = 'http://localhost:3001/api';

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch Tracking Data
      const trackingResponse = await fetch(`${API_BASE_URL}/tracking`, { credentials: 'include' });
      if (!trackingResponse.ok) {
        if (trackingResponse.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error(`HTTP Error! Status: ${trackingResponse.status}`);
      }
      const trackingData: any[] = await trackingResponse.json();
      const transformedTracking: Tracking = {};
      trackingData.forEach(item => {
        transformedTracking[item.name] = {
          isTracking: item.isTracking === 1,
          startDate: item.startDate,
          stopDate: item.stopDate
        };
      });
      setTracking(transformedTracking);

      // Fetch Persons Data (for tracked results)
      const personsResponse = await fetch(`${API_BASE_URL}/persons`, { credentials: 'include' });
      if (!personsResponse.ok) {
        if (personsResponse.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error(`HTTP Error! Status: ${personsResponse.status}`);
      }
      const allResults: SearchResult[] = await personsResponse.json();
      const tracked = allResults.filter(result => transformedTracking[result.name]?.isTracking);
      setTrackedResults(tracked);

      // Fetch Customer Profiles (Company and Individual)
      const companyResponse = await fetch(`${API_BASE_URL}/companyob`, { credentials: 'include' });
      const individualResponse = await fetch(`${API_BASE_URL}/individualob`, { credentials: 'include' });

      if (!companyResponse.ok || !individualResponse.ok) {
        if (companyResponse.status === 401 || individualResponse.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error(`HTTP Error! Status: ${companyResponse.status} or ${individualResponse.status}`);
      }

      const companyDataResult: CompanyOB[] = await companyResponse.json();
      const individualDataResult: IndividualOB[] = await individualResponse.json();
      setCompanyData(companyDataResult);
      setIndividualData(individualDataResult);

    } catch (error) {
      console.error('Could not fetch data:', error);
    }
  };


  useEffect(() => {
    fetchData();
  }, [user, navigate]);


  const updateTracking = async (name: string, newTrackingStatus: boolean) => {
    try {
      const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/tracking/</span>{name}`, {
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
        const errorData = await response.json().catch(() => ({})); // Handle non-JSON responses
        const errorMessage = errorData.message || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Refetch *all* data after updating tracking status.  This ensures consistency.
      fetchData();

    } catch (error: any) {
      console.error('Error updating tracking:', error.message);
    }
  };

  const toggleTracking = (name: string) => {
    const currentTrackingStatus = tracking[name]?.isTracking ?? false;
    updateTracking(name, !currentTrackingStatus);
  };



  const calculateAging = (result: SearchResult): string => {
    const trackingInfo = tracking[result.name];

    if (trackingInfo?.isTracking) {
      return trackingInfo.startDate
        ? `${Math.floor((Date.now() - new Date(trackingInfo.startDate).getTime()) / (1000 * 60 * 60 * 24))}D`
        : '0D';
    } else if (trackingInfo?.stopDate && trackingInfo.startDate) {
      const diffInDays = Math.floor((new Date(trackingInfo.stopDate).getTime() - new Date(trackingInfo.startDate).getTime()) / (1000 * 60 * 60 * 24));
      return `<span style="color: red;">${diffInDays}D</span>`;
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
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
          <li className="mr-2" role="presentation">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'alerts' ? 'border-purple-600 text-purple-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('alerts')}
              type="button"
              role="tab"
            >
              Alerts
            </button>
          </li>
          <li className="mr-2" role="presentation">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'customerProfiles' ? 'border-purple-600 text-purple-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('customerProfiles')}
              type="button"
              role="tab"
            >
              Customer Profiles
            </button>
          </li>
        </ul>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {!isLoading && activeTab === 'alerts' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-4 px-6 whitespace-nowrap">TYPE</th> {/* Added px-6 */}
                <th className="pb-4 px-6 whitespace-nowrap">CUSTOMER</th> {/* Added px-6 */}
                <th className="pb-4 px-6 whitespace-nowrap">FULL NAME</th> {/* Added px-6 */}
                <th className="pb-4 px-6 whitespace-nowrap">NATIONALITY</th> {/* Added px-6 */}
                <th className="pb-4 px-6 whitespace-nowrap">AGING</th> {/* Added px-6 */}
                <th className="pb-4 px-6 whitespace-nowrap">NAME SCREENING</th> {/* Added px-6 */}
                <th className="pb-4 px-6 whitespace-nowrap">DOCUMENTATION</th> {/* Added px-6 */}
                <th className="pb-4 px-6 whitespace-nowrap">RISK RATING</th> {/* Added px-6 */}
                <th className="pb-4 px-6 whitespace-nowrap">STATUS</th> {/* Added px-6 */}
                <th className="pb-4 px-6 whitespace-nowrap">TRACKING</th> {/* Added px-6 */}
              </tr>
            </thead>
            <tbody>
              {(trackedResults.length > 0 ? trackedResults : searchResults).map((result, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6"> {/* Added px-6 */}
                    <div className={`w-1 h-6 rounded-full ${getRiskColor(result.riskLevel).replace('text', 'bg')}`}></div>
                  </td>
                  <td className="py-4 px-6"> {/* Added px-6 */}
                    <div className="flex items-center space-x-3">
                      <img src={`https://ui-avatars.com/api/?name=${result.name}`} alt={result.name} className="w-8 h-8 rounded-full" />
                      <span className="text-sm">{result.identifiers}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm">{result.name}</td> {/* Added px-6 */}
                  <td className="py-4 px-6 text-sm">{result.country}</td> {/* Added px-6 */}
                  <td className="py-4 px-6 text-sm" dangerouslySetInnerHTML={{ __html: calculateAging(result) }} /> {/* Added px-6 */}
                  <td className="py-4 px-6"> {/* Added px-6 */}
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                  </td>
                  <td className="py-4 px-6">  {/* Added px-6 */}
                    <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                  </td>
                  <td className="py-4 px-6"> {/* Added px-6 */}
                    <span className={`text-sm ${getRiskColor(result.riskLevel)}`}>{result.riskLevel}%</span>
                  </td>
                  <td className="py-4 px-6"> {/* Added px-6 */}
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Review</span>
                  </td>
                  <td className="py-4 px-6"> {/* Added px-6 */}
                    <button
                      onClick={() => toggleTracking(result.name)}
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

      {!isLoading && activeTab === 'customerProfiles' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Individual Customers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  {/* Added px-6 to all th and td elements */}
                  <th className="pb-4 px-6 whitespace-nowrap">User ID</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Full Name</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Email</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Resident Status</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Gender</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Date of Birth</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Nationality</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Country of Residence</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Other Nationalities</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Specified Other Nationalities</th>
                  <th className="pb-4 px-6 whitespace-nowrap">National ID Number</th>
                  <th className="pb-4 px-6 whitespace-nowrap">National ID Expiry</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Passport Number</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Passport Expiry</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Address</th>
                  <th className="pb-4 px-6 whitespace-nowrap">State</th>
                  <th className="pb-4 px-6 whitespace-nowrap">City</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Zip Code</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Contact Number</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Dialing Code</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Work Type</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Industry</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Product Type Offered</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Product Offered</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Company Name</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Position in Company</th>
                </tr>
              </thead>
              <tbody>
                {individualData.map((individual, index) => (
                  <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">{individual.user_id}</td>
                    <td className="py-4 px-6">{individual.full_name}</td>
                    <td className="py-4 px-6">{individual.email}</td>
                    <td className="py-4 px-6">{individual.resident_status}</td>
                    <td className="py-4 px-6">{individual.gender}</td>
                    <td className="py-4 px-6">{individual.date_of_birth}</td>
                    <td className="py-4 px-6">{individual.nationality}</td>
                    <td className="py-4 px-6">{individual.country_of_residence}</td>
                    <td className="py-4 px-6">{individual.other_nationalities}</td>
                    <td className="py-4 px-6">{individual.specified_other_nationalities}</td>
                    <td className="py-4 px-6">{individual.national_id_number}</td>
                    <td className="py-4 px-6">{individual.national_id_expiry}</td>
                    <td className="py-4 px-6">{individual.passport_number}</td>
                    <td className="py-4 px-6">{individual.passport_expiry}</td>
                    <td className="py-4 px-6">{individual.address}</td>
                    <td className="py-4 px-6">{individual.state}</td>
                    <td className="py-4 px-6">{individual.city}</td>
                    <td className="py-4 px-6">{individual.zip_code}</td>
                    <td className="py-4 px-6">{individual.contact_number}</td>
                    <td className="py-4 px-6">{individual.dialing_code}</td>
                    <td className="py-4 px-6">{individual.work_type}</td>
                    <td className="py-4 px-6">{individual.industry}</td>
                    <td className="py-4 px-6">{individual.product_type_offered}</td>
                    <td className="py-4 px-6">{individual.product_offered}</td>
                    <td className="py-4 px-6">{individual.company_name}</td>
                    <td className="py-4 px-6">{individual.position_in_company}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold mb-4">Company Customers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  {/* Added px-6 */}
                  <th className="pb-4 px-6 whitespace-nowrap">User ID</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Company Name</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Registration Number</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Company Type</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Incorporation Date</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Business Nature</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Industry Sector</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Annual Turnover</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Employee Count</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Website URL</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Registered Address</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Operating Address</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Country</th>
                  <th className="pb-4 px-6 whitespace-nowrap">State</th>
                  <th className="pb-4 px-6 whitespace-nowrap">City</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Postal Code</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Contact Person Name</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Contact Email</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Contact Phone</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Tax Number</th>
                  <th className="pb-4 px-6 whitespace-nowrap">Regulatory Licenses</th>
                </tr>
              </thead>
              <tbody>
                {companyData.map((company, index) => (
                  <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">{company.user_id}</td>
                    <td className="py-4 px-6">{company.company_name}</td>
                    <td className="py-4 px-6">{company.registration_number}</td>
                    <td className="py-4 px-6">{company.company_type}</td>
                    <td className="py-4 px-6">{company.incorporation_date}</td>
                    <td className="py-4 px-6">{company.business_nature}</td>
                    <td className="py-4 px-6">{company.industry_sector}</td>
                    <td className="py-4 px-6">{company.annual_turnover}</td>
                    <td className="py-4 px-6">{company.employee_count}</td>
                    <td className="py-4 px-6">{company.website_url}</td>
                    <td className="py-4 px-6">{company.registered_address}</td>
                    <td className="py-4 px-6">{company.operating_address}</td>
                    <td className="py-4 px-6">{company.country}</td>
                    <td className="py-4 px-6">{company.state}</td>
                    <td className="py-4 px-6">{company.city}</td>
                    <td className="py-4 px-6">{company.postal_code}</td>
                    <td className="py-4 px-6">{company.contact_person_name}</td>
                    <td className="py-4 px-6">{company.contact_email}</td>
                    <td className="py-4 px-6">{company.contact_phone}</td>
                    <td className="py-4 px-6">{company.tax_number}</td>
                    <td className="py-4 px-6">{company.regulatory_licenses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profiles;