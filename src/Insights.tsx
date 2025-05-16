// Insights.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, User, Building, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from './config';

interface InsightsProps {}

// Define customer interface
interface Customer {
    id: number;
    fullName?: string;
    companyName?: string;
    email?: string;
    status: 'pending' | 'approved' | 'rejected';
    type: 'individual' | 'company';
    createdAt: string;
    updatedAt?: string;
}

function Insights(_props: InsightsProps) {
    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [customerCount, setCustomerCount] = useState(0);
    const [pendingCustomers, setPendingCustomers] = useState(0);
    const [approvedCustomers, setApprovedCustomers] = useState(0);
    const [rejectedCustomers, setRejectedCustomers] = useState(0);
    
    // State for storing customer details
    const [individualCustomers, setIndividualCustomers] = useState<Customer[]>([]);
    const [companyCustomers, setCompanyCustomers] = useState<Customer[]>([]);

    // State for tracking which sections are expanded
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const fromDateRef = useRef<HTMLInputElement>(null);
    const toDateRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const API_BASE_URL = getApiBaseUrl();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fromDateRef.current && !fromDateRef.current.contains(event.target as Node)) {
                setFromDateOpen(false);
            }
            if (toDateRef.current && !toDateRef.current.contains(event.target as Node)) {
                setToDateOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchData = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            // Fetch Individual Customers (for logged-in user)
            const individualResponse = await fetch(`${API_BASE_URL}/individualob`, {
                method: 'GET',
                credentials: 'include', // Ensures session authentication works
            });

            if (!individualResponse.ok) {
                if (individualResponse.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP error: ${individualResponse.status}`);
            }
            const individualData = await individualResponse.json();
            setIndividualCustomers(individualData.map((customer: any) => ({
                ...customer,
                type: 'individual'
            })));

            // Fetch Company Customers (for logged-in user)
            const companyResponse = await fetch(`${API_BASE_URL}/companyob`, {
                method: 'GET',
                credentials: 'include', // Ensures session authentication works
            });

            if (!companyResponse.ok) {
                if (companyResponse.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP error: ${companyResponse.status}`);
            }
            const companyData = await companyResponse.json();
            setCompanyCustomers(companyData.map((company: any) => ({
                ...company,
                type: 'company'
            })));

            // Combine counts
            setCustomerCount(individualData.length + companyData.length);

            // Count Pending, Approved, Rejected Customers
            let pending = 0, approved = 0, rejected = 0;

            [...individualData, ...companyData].forEach(customer => {
                if (customer.status === 'pending') pending++;
                else if (customer.status === 'approved') approved++;
                else if (customer.status === 'rejected') rejected++;
            });

            setPendingCustomers(pending);
            setApprovedCustomers(approved);
            setRejectedCustomers(rejected);

        } catch (error: any) {
            console.error('Error fetching data:', error.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, navigate]);

    // Toggle section expansion
    const toggleExpand = (section: string) => {
        if (expandedSection === section) {
            setExpandedSection(null);
        } else {
            setExpandedSection(section);
        }
    };

    // Get all customers
    const allCustomers = [...individualCustomers, ...companyCustomers];

    // Helper function to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Function to get customers by status
    const getCustomersByStatus = (status: string | null) => {
        if (status === null) {
            return allCustomers; // All customers for "onboarded" section
        }
        return allCustomers.filter(customer => customer.status === status);
    };

    // Render customer list for a given status
    const renderCustomerList = (status: string | null) => {
        const customers = getCustomersByStatus(status);
        
        if (customers.length === 0) {
            return (
                <div className="p-4 text-gray-500 text-center italic">
                    No customers found in this category.
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            {status === null && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            )}
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map((customer) => (
                            <tr key={`${customer.type}-${customer.id}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {customer.type === 'individual' ? (
                                        <div className="flex items-center">
                                            <User className="h-5 w-5 text-gray-400 mr-2" />
                                            <span>Individual</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <Building className="h-5 w-5 text-gray-400 mr-2" />
                                            <span>Company</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {customer.type === 'individual' ? customer.fullName : customer.companyName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{customer.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(customer.createdAt)}
                                </td>
                                {status === null && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${customer.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                            customer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'}`}
                                        >
                                            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                        </span>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end"
                                        onClick={() => {/* View customer details */}}
                                    >
                                        <span>View</span>
                                        <ArrowRight className="h-4 w-4 ml-1" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Activity Dashboard</h2>

            <div className="mb-6">
                {/* Date Range Picker */}
                <div className="flex items-center space-x-4">
                    <div>
                        <label htmlFor="from-date" className="block text-sm font-medium text-gray-700">From</label>
                        <div className="relative mt-1">
                            <input
                                type="date"
                                id="from-date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="to-date" className="block text-sm font-medium text-gray-700">To</label>
                        <div className="relative mt-1">
                            <input
                                type="date"
                                id="to-date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <button className="px-6 py-2 bg-[#4A1D96] text-white rounded-lg text-sm h-10 mt-6">APPLY</button>
                    <button className="px-6 py-2 bg-[#FFC727] text-black rounded-lg text-sm h-10 mt-6">EXPORT</button>
                </div>
            </div>

            {/* Customer Stats with Expandable Sections */}
            <div className="grid grid-cols-1 gap-6">
                {/* CUSTOMER ONBOARDED */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div 
                        className={`p-4 cursor-pointer flex justify-between items-center ${expandedSection === 'onboarded' ? 'bg-purple-50' : ''}`}
                        onClick={() => toggleExpand('onboarded')}
                    >
                        <div>
                            <h3 className="text-base font-medium text-gray-900">CUSTOMER ONBOARDED</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{customerCount}</p>
                        </div>
                        {expandedSection === 'onboarded' ? 
                            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        }
                    </div>
                    {expandedSection === 'onboarded' && (
                        <div className="border-t border-gray-200">
                            {renderCustomerList(null)}
                        </div>
                    )}
                </div>

                {/* PENDING CUSTOMERS */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div 
                        className={`p-4 cursor-pointer flex justify-between items-center ${expandedSection === 'pending' ? 'bg-purple-50' : ''}`}
                        onClick={() => toggleExpand('pending')}
                    >
                        <div>
                            <h3 className="text-base font-medium text-gray-900">PENDING CUSTOMERS</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{pendingCustomers}</p>
                        </div>
                        {expandedSection === 'pending' ? 
                            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        }
                    </div>
                    {expandedSection === 'pending' && (
                        <div className="border-t border-gray-200">
                            {renderCustomerList('pending')}
                        </div>
                    )}
                </div>

                {/* APPROVED CUSTOMERS */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div 
                        className={`p-4 cursor-pointer flex justify-between items-center ${expandedSection === 'approved' ? 'bg-purple-50' : ''}`}
                        onClick={() => toggleExpand('approved')}
                    >
                        <div>
                            <h3 className="text-base font-medium text-gray-900">APPROVED CUSTOMERS</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{approvedCustomers}</p>
                        </div>
                        {expandedSection === 'approved' ? 
                            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        }
                    </div>
                    {expandedSection === 'approved' && (
                        <div className="border-t border-gray-200">
                            {renderCustomerList('approved')}
                        </div>
                    )}
                </div>

                {/* REJECTED CUSTOMERS */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div 
                        className={`p-4 cursor-pointer flex justify-between items-center ${expandedSection === 'rejected' ? 'bg-purple-50' : ''}`}
                        onClick={() => toggleExpand('rejected')}
                    >
                        <div>
                            <h3 className="text-base font-medium text-gray-900">REJECTED CUSTOMERS</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{rejectedCustomers}</p>
                        </div>
                        {expandedSection === 'rejected' ? 
                            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                        }
                    </div>
                    {expandedSection === 'rejected' && (
                        <div className="border-t border-gray-200">
                            {renderCustomerList('rejected')}
                        </div>
                    )}
                </div>
            </div>

            {/* Onboard New Profile Button */}
            <div className="flex justify-end">
                <button className="px-6 py-2 mt-4 bg-[#FFC727] text-black rounded-lg text-sm">+ Onboard New Profile</button>
            </div>
        </div>
    );
}

export default Insights;
