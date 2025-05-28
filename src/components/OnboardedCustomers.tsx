import React, { useState } from 'react';
import { Search, Loader2, RefreshCw, FileText, ChevronUp, ChevronDown, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Customer {
    id: string;
    identifiers: string;
    name: string;
    country: string;
    dataset: string;
    riskLevel: number;
    status: string;
    [key: string]: any;
}

interface OnboardedCustomersProps {
    customers: Customer[];
    isLoading: boolean;
    onRefresh: () => void;
}

type SortableColumn = 'identifiers' | 'name' | 'country' | 'dataset' | 'risk' | 'status';
type SortDirection = 'asc' | 'desc';

function OnboardedCustomers({ customers, isLoading, onRefresh }: OnboardedCustomersProps) {
    const [nameQuery, setNameQuery] = useState<string>('');
    const [idQuery, setIdQuery] = useState<string>('');
    const [appliedNameQuery, setAppliedNameQuery] = useState<string>('');
    const [appliedIdQuery, setAppliedIdQuery] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'custom'>('all');
    const [sortColumn, setSortColumn] = useState<SortableColumn>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [generatingPdf, setGeneratingPdf] = useState<{[key: string]: boolean}>({});
    const navigate = useNavigate();

    // Minimum search term length
    const MIN_SEARCH_LENGTH = 2;

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

    // Handle sort
    const handleSort = (column: SortableColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Render sort indicator
    const renderSortIndicator = (column: SortableColumn) => {
        if (sortColumn !== column) return null;
        
        return sortDirection === 'asc' 
            ? <ChevronUp className="w-4 h-4 inline-block ml-1" /> 
            : <ChevronDown className="w-4 h-4 inline-block ml-1" />;
    };

    // Get filtered results
    const getFilteredResults = () => {
        if (activeFilter === 'all') return customers;
        
        return customers.filter(customer => {
            const matchesName = !appliedNameQuery || 
                (customer.name?.toLowerCase().includes(appliedNameQuery.toLowerCase()));
            
            const matchesId = !appliedIdQuery || 
                (customer.identifiers?.toLowerCase().includes(appliedIdQuery.toLowerCase()));
            
            return matchesName && matchesId;
        });
    };

    // Get filtered and sorted results
    const getFilteredAndSortedResults = () => {
        const filteredResults = getFilteredResults();
        
        return filteredResults.sort((a, b) => {
            const multiplier = sortDirection === 'asc' ? 1 : -1;
            
            switch (sortColumn) {
                case 'identifiers':
                    return multiplier * (a.identifiers || '').localeCompare(b.identifiers || '');
                case 'name':
                    return multiplier * (a.name || '').localeCompare(b.name || '');
                case 'country':
                    return multiplier * (a.country || '').localeCompare(b.country || '');
                case 'dataset':
                    return multiplier * (a.dataset || '').localeCompare(b.dataset || '');
                case 'risk':
                    return multiplier * ((a.riskLevel || 0) - (b.riskLevel || 0));
                case 'status':
                    return multiplier * (a.status || '').localeCompare(b.status || '');
                default:
                    return 0;
            }
        });
    };

    // Handle generating PDF
    const handleGeneratePDF = async (customer: Customer) => {
        try {
            setGeneratingPdf(prev => ({ ...prev, [customer.id]: true }));
            // TODO: Implement PDF generation
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
            setGeneratingPdf(prev => ({ ...prev, [customer.id]: false }));
        } catch (error) {
            console.error('Error generating PDF:', error);
            setGeneratingPdf(prev => ({ ...prev, [customer.id]: false }));
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // Handle edit profile
    const handleEditProfile = (customer: Customer) => {
        navigate(`/edit-profile/${customer.id}`, { state: { profile: customer } });
    };

    const filteredAndSortedResults = getFilteredAndSortedResults();
    const resultsCount = filteredAndSortedResults.length;
    const totalCount = customers.length;

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={nameQuery}
                                onChange={(e) => setNameQuery(e.target.value)}
                                placeholder={`Search by name (min. ${MIN_SEARCH_LENGTH} characters)`}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={idQuery}
                            onChange={(e) => setIdQuery(e.target.value)}
                            placeholder="Search by ID"
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
                        />
                        <button
                            onClick={applySearch}
                            disabled={nameQuery.length > 0 && nameQuery.length < MIN_SEARCH_LENGTH}
                            className={`px-6 py-2 bg-[#4A1D96] text-white rounded-lg text-sm ${
                                nameQuery.length > 0 && nameQuery.length < MIN_SEARCH_LENGTH 
                                ? 'opacity-50 cursor-not-allowed' 
                                : ''
                            }`}
                        >
                            APPLY
                        </button>
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">
                            {activeFilter === 'custom' 
                                ? `Showing ${resultsCount} of ${totalCount} customers` 
                                : `Total customers: ${totalCount}`}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        {activeFilter === 'custom' && (
                            <button 
                                onClick={resetFilters}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100"
                            >
                                Clear Filter
                            </button>
                        )}
                        <button 
                            onClick={onRefresh}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            ) : filteredAndSortedResults.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
                    <p className="text-center text-yellow-700">No customers found</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500">
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('identifiers')}>
                                    CUSTOMER ID {renderSortIndicator('identifiers')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('name')}>
                                    FULL NAME {renderSortIndicator('name')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('country')}>
                                    NATIONALITY {renderSortIndicator('country')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer" onClick={() => handleSort('dataset')}>
                                    CATEGORY {renderSortIndicator('dataset')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap text-center">
                                    DOCUMENTATION
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer text-center" onClick={() => handleSort('risk')}>
                                    RISK RATING {renderSortIndicator('risk')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap cursor-pointer text-center" onClick={() => handleSort('status')}>
                                    STATUS {renderSortIndicator('status')}
                                </th>
                                <th className="pb-4 px-6 whitespace-nowrap text-center">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedResults.map((customer) => (
                                <tr key={customer.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <img 
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name || 'Unknown')}`}
                                                alt={customer.name || 'Unknown'} 
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <span className="text-sm">{customer.identifiers || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm">{customer.name || 'Unknown'}</td>
                                    <td className="py-4 px-6 text-sm">
                                        {customer.country && customer.country !== 'Unknown' && customer.country !== 'N/A' ? (
                                            <div className="flex items-center">
                                                <img 
                                                    src={`https://flagcdn.com/w20/${customer.country.toLowerCase()}.png`}
                                                    alt={customer.country}
                                                    className="mr-2 h-3 rounded shadow-sm"
                                                    title={customer.country}
                                                />
                                                {customer.country}
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            customer.dataset === 'onboarded' 
                                                ? 'bg-green-100 text-green-700'
                                                : customer.dataset.includes('peps')
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : customer.dataset.includes('terrorists')
                                                        ? 'bg-red-100 text-red-700'
                                                        : customer.dataset.includes('sanctions')
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : customer.dataset.includes('debarment')
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {customer.dataset === 'onboarded' 
                                                ? 'Onboarded' 
                                                : customer.dataset.includes('peps') 
                                                    ? 'PEP' 
                                                    : customer.dataset.includes('terrorists') 
                                                        ? 'Terrorist' 
                                                        : customer.dataset.includes('sanctions') 
                                                            ? 'Sanctions' 
                                                            : customer.dataset.includes('debarment') 
                                                                ? 'Debarred' 
                                                                : customer.dataset}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-center">
                                            <button 
                                                onClick={() => handleGeneratePDF(customer)}
                                                disabled={generatingPdf[customer.id]}
                                                className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-full transition-colors duration-200"
                                                title="Download Report"
                                            >
                                                {generatingPdf[customer.id] ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <FileText className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`text-sm ${
                                            customer.riskLevel >= 85 ? 'text-red-600' :
                                            customer.riskLevel >= 60 ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`}>
                                            {customer.riskLevel || 0}%
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            customer.status === 'approved' 
                                                ? 'bg-green-100 text-green-800'
                                                : customer.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                        }`}>
                                            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <button
                                            onClick={() => handleEditProfile(customer)}
                                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors duration-200"
                                            title="Edit Profile"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default OnboardedCustomers; 