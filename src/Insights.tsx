// Insights.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface InsightsProps { }

function Insights(_props: InsightsProps) {
    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const fromDateRef = useRef<HTMLInputElement>(null);
    const toDateRef = useRef<HTMLInputElement>(null);

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

    const handleFromDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFromDate(event.target.value);
    };

    const handleToDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setToDate(event.target.value);
    };

    const toggleFromDatepicker = () => {
        setFromDateOpen(!fromDateOpen);
    };

    const toggleToDatepicker = () => {
        setToDateOpen(!toDateOpen);
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
                                type="text" // Keep as text for the placeholder
                                id="from-date"
                                placeholder="27/01/2025"
                                value={fromDate}
                                onChange={handleFromDateChange}
                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                onClick={toggleFromDatepicker} // Open on click
                                ref={fromDateRef}
                            />
                            <Calendar
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                                onClick={toggleFromDatepicker} // Open on icon click
                            />
                            {/* Datepicker (Corrected Positioning and z-index) */}
                            {fromDateOpen && (
                                <div className="absolute z-50 mt-1"> {/* Increased z-index */}
                                    <input
                                        type="date"
                                        className="w-full bg-white border border-gray-300 rounded-md shadow-lg"
                                        value={fromDate}
                                        onChange={handleFromDateChange}
                                        onBlur={() => setTimeout(() => setFromDateOpen(false), 100)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="to-date" className="block text-sm font-medium text-gray-700">To</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                id="to-date"
                                placeholder="12/02/2025"
                                value={toDate}
                                onChange={handleToDateChange}
                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                onClick={toggleToDatepicker}
                                ref={toDateRef}
                            />
                            <Calendar
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                                onClick={toggleToDatepicker}
                            />
                            {/* Datepicker (Corrected Positioning and z-index) */}
                            {toDateOpen && (
                                <div className="absolute z-50 mt-1"> {/* Increased z-index */}
                                    <input
                                        type="date"
                                        className="w-full bg-white border border-gray-300 rounded-md shadow-lg"
                                        value={toDate}
                                        onChange={handleToDateChange}
                                        onBlur={() => setTimeout(() => setToDateOpen(false), 100)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <button className="px-6 py-2 bg-[#4A1D96] text-white rounded-lg text-sm h-10 mt-6 ">
                        APPLY
                    </button>
                    <button className="px-6 py-2 bg-[#FFC727] text-black rounded-lg text-sm h-10 mt-6">
                        EXPORT
                    </button>
                </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {/* Customer Onboarded */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-base font-medium text-gray-900">CUSTOMER ONBOARDED</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
                </div>

                {/* Pending Customers */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-base font-medium text-gray-900">PENDING CUSTOMERS</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
                </div>

                {/* Approved Customers */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-base font-medium text-gray-900">APPROVED CUSTOMERS</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
                </div>

                {/* Rejected Customers */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-base font-medium text-gray-900">REJECTED CUSTOMERS</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
                </div>

                {/* Profiles Remaining */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-base font-medium text-gray-900">PROFILES REMAINING</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
                </div>

                {/* Deeplinks Pending */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-base font-medium text-gray-900">DEEPLINKS PENDING</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
                </div>
            </div>

            {/* Onboard New Profile Button */}
            <div className='flex justify-end'>
                <button className="px-6 py-2 mt-4 bg-[#FFC727] text-black rounded-lg text-sm">
                    + Onboard New Profile
                </button>
            </div>
        </div>
    );
}

export default Insights;