// Insights.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

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

    const fromDateRef = useRef<HTMLInputElement>(null);
    const toDateRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

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
            const individualResponse = await fetch('http://137.184.150.6/api/individualob', {
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

            // Fetch Company Customers (for logged-in user)
            const companyResponse = await fetch('http://137.184.150.6/api/companyob', {
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
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    <button className="px-6 py-2 bg-[#4A1D96] text-white rounded-lg text-sm h-10 mt-6">APPLY</button>
                    <button className="px-6 py-2 bg-[#FFC727] text-black rounded-lg text-sm h-10 mt-6">EXPORT</button>
                </div>
            </div>

            {/* Customer Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-base font-medium text-gray-900">CUSTOMER ONBOARDED</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{customerCount}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-base font-medium text-gray-900">PENDING CUSTOMERS</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{pendingCustomers}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-base font-medium text-gray-900">APPROVED CUSTOMERS</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{approvedCustomers}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-base font-medium text-gray-900">REJECTED CUSTOMERS</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{rejectedCustomers}</p>
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
