import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Download, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from './config';

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
    status?: string;
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
    status?: string;
}

interface PaginationInfo {
    total: number;
    page: number;
    totalPages: number;
}

function CustomerProfiles() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const API_BASE_URL = getApiBaseUrl();

    const [companyData, setCompanyData] = useState<CompanyOB[]>([]);
    const [individualData, setIndividualData] = useState<IndividualOB[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [companyPage, setCompanyPage] = useState(1);
    const [individualPage, setIndividualPage] = useState(1);
    const [companyPagination, setCompanyPagination] = useState<PaginationInfo>({ total: 0, page: 1, totalPages: 1 });
    const [individualPagination, setIndividualPagination] = useState<PaginationInfo>({ total: 0, page: 1, totalPages: 1 });
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) {
            setError('User not authenticated');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('Fetching data from:', `${API_BASE_URL}/individualob?page=${individualPage}&limit=20`);
            
            const [companyResponse, individualResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/companyob?page=${companyPage}&limit=20`, {
                    credentials: 'include'
                }),
                fetch(`${API_BASE_URL}/individualob?page=${individualPage}&limit=20`, {
                    credentials: 'include'
                })
            ]);

            if (!companyResponse.ok || !individualResponse.ok) {
                if (companyResponse.status === 401 || individualResponse.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error(`Network response was not ok. Individual: ${individualResponse.status}, Company: ${companyResponse.status}`);
            }

            const companyDataResponse = await companyResponse.json();
            const individualDataResponse = await individualResponse.json();

            // Handle the case where the response is a direct array
            const companyDataArray = Array.isArray(companyDataResponse) ? companyDataResponse : companyDataResponse.data || [];
            const individualDataArray = Array.isArray(individualDataResponse) ? individualDataResponse : individualDataResponse.data || [];

            // Set the data
            setCompanyData(companyDataArray);
            setIndividualData(individualDataArray);

            // Calculate pagination info based on the array length
            const companyPaginationInfo = {
                total: companyDataArray.length,
                page: companyPage,
                totalPages: Math.ceil(companyDataArray.length / 20)
            };

            const individualPaginationInfo = {
                total: individualDataArray.length,
                page: individualPage,
                totalPages: Math.ceil(individualDataArray.length / 20)
            };

            setCompanyPagination(companyPaginationInfo);
            setIndividualPagination(individualPaginationInfo);

        } catch (error) {
            console.error('Could not fetch data:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
        } finally {
            setIsLoading(false);
        }
    }, [user, navigate, companyPage, individualPage, API_BASE_URL]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const generateIndividualPDF = async (individual: IndividualOB) => {
        // ... existing PDF generation code ...
    };

    const generateCompanyPDF = async (company: CompanyOB) => {
        // ... existing PDF generation code ...
    };

    // Add pagination handlers
    const handlePageChange = useCallback((type: 'individual' | 'company', newPage: number) => {
        if (type === 'individual') {
            setIndividualPage(newPage);
        } else {
            setCompanyPage(newPage);
        }
    }, []);

    // Pagination controls component
    const PaginationControls = ({ type }: { type: 'individual' | 'company' }) => {
        const pagination = type === 'individual' ? individualPagination : companyPagination;
        const currentPage = type === 'individual' ? individualPage : companyPage;

        if (!pagination || pagination.totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <button
                    onClick={() => handlePageChange(type, currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                        currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-purple-600 hover:bg-purple-50'
                    }`}
                >
                    Previous
                </button>
                <span className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(type, currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className={`px-3 py-1 rounded ${
                        currentPage === pagination.totalPages 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-purple-600 hover:bg-purple-50'
                    }`}
                >
                    Next
                </button>
            </div>
        );
    };

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
                    <h2 className="text-xl font-semibold mb-4">Individual Customers</h2>
                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500">
                                    <th className="pb-4 px-6 whitespace-nowrap">User ID</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Full Name</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Email</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Nationality</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Status</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {individualData.map((individual, index) => (
                                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-6">{individual.user_id}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${individual.full_name}`}
                                                    alt={individual.full_name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <span>{individual.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">{individual.email}</td>
                                        <td className="py-4 px-6">{individual.nationality}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center px-3 py-2 rounded-full bg-green-100 w-fit">
                                                <span className="text-green-800 font-medium text-sm flex items-center">
                                                    <CheckCircle className="w-4 h-4 mr-1" /> Approved
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => generateIndividualPDF(individual)}
                                                className="text-purple-600 hover:text-purple-800"
                                                title="Download PDF"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {individualData.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                No individual customers found
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl font-semibold mb-4">Company Customers</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500">
                                    <th className="pb-4 px-6 whitespace-nowrap">User ID</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Company Name</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Registration Number</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Country</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Status</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companyData.map((company, index) => (
                                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-6">{company.user_id}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${company.company_name}`}
                                                    alt={company.company_name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <span>{company.company_name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">{company.registration_number}</td>
                                        <td className="py-4 px-6">{company.country}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center px-3 py-2 rounded-full bg-green-100 w-fit">
                                                <span className="text-green-800 font-medium text-sm flex items-center">
                                                    <CheckCircle className="w-4 h-4 mr-1" /> Approved
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => generateCompanyPDF(company)}
                                                className="text-purple-600 hover:text-purple-800"
                                                title="Download PDF"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {companyData.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                No company customers found
                            </div>
                        )}
                    </div>

                    <PaginationControls type="individual" />
                    <PaginationControls type="company" />
                </>
            )}
        </div>
    );
}

export default CustomerProfiles; 