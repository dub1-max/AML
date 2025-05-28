// Insights.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from './config';
import CustomerList from './components/CustomerList';
import CustomerDetails from './components/CustomerDetails';
import ActivityTimeline from './components/ActivityTimeline';

interface Customer {
    id: string;
    type: 'individual' | 'company';
    status: string;
    email?: string;
    full_name?: string;
    companyName?: string;
    [key: string]: any;
}

interface InsightsProps {}

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
    
    // State for navigation and views
    const [currentView, setCurrentView] = useState<'dashboard' | 'list' | 'details'>('dashboard');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [timelineData, setTimelineData] = useState<{ date: string; count: number; }[]>([]);

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

    const processTimelineData = (customers: Customer[]) => {
        const dateMap = new Map<string, number>();
        
        customers.forEach(customer => {
            const date = customer.createdAt || 
                        customer.created_at || 
                        customer.registrationDate || 
                        customer.registration_date ||
                        customer.onboardingDate ||
                        customer.onboarding_date ||
                        customer.date;
            
            if (date) {
                const formattedDate = new Date(date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
                dateMap.set(formattedDate, (dateMap.get(formattedDate) || 0) + 1);
            }
        });

        // Convert map to array and sort by date
        const timelineData = Array.from(dateMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setTimelineData(timelineData);
    };

    const fetchData = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            // Fetch Individual Customers
            const individualResponse = await fetch(`${API_BASE_URL}/individualob`, {
                method: 'GET',
                credentials: 'include',
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
                type: 'individual',
                fullName: customer.fullName || customer.name || customer.full_name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown'
            })));

            // Fetch Company Customers
            const companyResponse = await fetch(`${API_BASE_URL}/companyob`, {
                method: 'GET',
                credentials: 'include',
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
                type: 'company',
                companyName: company.companyName || company.company_name || company.name || 'Unknown Company'
            })));

            // Update counts
            const allCustomers = [...individualData, ...companyData];
            setCustomerCount(allCustomers.length);

            let pending = 0, approved = 0, rejected = 0;
            allCustomers.forEach(customer => {
                if (customer.status === 'pending') pending++;
                else if (customer.status === 'approved') approved++;
                else if (customer.status === 'rejected') rejected++;
            });

            setPendingCustomers(pending);
            setApprovedCustomers(approved);
            setRejectedCustomers(rejected);

            // Process timeline data
            processTimelineData(allCustomers);

        } catch (error: any) {
            console.error('Error fetching data:', error.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, navigate]);

    // Get all customers
    const allCustomers = [...individualCustomers, ...companyCustomers];

    // Get customers by status
    const getCustomersByStatus = (status: string | null) => {
        if (status === null) {
            return allCustomers;
        }
        return allCustomers.filter(customer => customer.status === status);
    };

    // Handle navigation
    const handleSectionClick = (status: string | null) => {
        setSelectedStatus(status);
        setCurrentView('list');
    };

    const handleViewCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCurrentView('details');
    };

    const handleBack = () => {
        if (currentView === 'details') {
            setCurrentView('list');
            setSelectedCustomer(null);
        } else if (currentView === 'list') {
            setCurrentView('dashboard');
            setSelectedStatus(null);
        }
    };

    // Render dashboard view
    const renderDashboard = () => (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Activity Dashboard</h2>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">Activity Timeline</h3>
                <ActivityTimeline data={timelineData} />
            </div>

            <div className="mb-6">
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

            <div className="grid grid-cols-1 gap-6">
                {/* Customer Stats Cards */}
                <div 
                    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-purple-50 transition-colors"
                    onClick={() => handleSectionClick(null)}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-medium text-gray-900">CUSTOMER ONBOARDED</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{customerCount}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-500" />
                    </div>
                </div>

                <div 
                    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-purple-50 transition-colors"
                    onClick={() => handleSectionClick('pending')}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-medium text-gray-900">PENDING CUSTOMERS</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{pendingCustomers}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-500" />
                    </div>
                </div>

                <div 
                    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-purple-50 transition-colors"
                    onClick={() => handleSectionClick('approved')}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-medium text-gray-900">APPROVED CUSTOMERS</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{approvedCustomers}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-500" />
                    </div>
                </div>

                <div 
                    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-purple-50 transition-colors"
                    onClick={() => handleSectionClick('rejected')}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-medium text-gray-900">REJECTED CUSTOMERS</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{rejectedCustomers}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-500" />
                    </div>
                </div>
            </div>

            {/* Onboard New Profile Button */}
            <div className="flex justify-end">
                <button className="px-6 py-2 mt-4 bg-[#FFC727] text-black rounded-lg text-sm">+ Onboard New Profile</button>
            </div>
        </div>
    );

    // Render the appropriate view
    if (currentView === 'details' && selectedCustomer) {
        return <CustomerDetails customer={selectedCustomer} onBack={handleBack} />;
    }

    if (currentView === 'list') {
        return (
            <div className="p-6">
                <div className="flex items-center mb-6">
                    <button 
                        onClick={handleBack}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
                <h2 className="text-lg font-semibold mb-4">
                    {selectedStatus === null ? 'All Customers' :
                     `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Customers`}
                </h2>
                <CustomerList 
                    customers={getCustomersByStatus(selectedStatus)}
                    status={selectedStatus}
                    onViewCustomer={handleViewCustomer}
                />
            </div>
        );
    }

    return renderDashboard();
}

export default Insights;
