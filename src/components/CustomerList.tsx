import React from 'react';
import { User, Building, ArrowRight } from 'lucide-react';

interface Customer {
    id: string;
    type: 'individual' | 'company';
    status: string;
    email?: string;
    full_name?: string;
    companyName?: string;
    [key: string]: any;
}

interface CustomerListProps {
    customers: Customer[];
    status: string | null;
    onViewCustomer: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, status, onViewCustomer }) => {
    // Helper function to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // Get customer's date for display
    const getCustomerDate = (customer: any): string => {
        const dateValue = customer.createdAt || 
                        customer.created_at || 
                        customer.registrationDate || 
                        customer.registration_date ||
                        customer.onboardingDate ||
                        customer.onboarding_date ||
                        customer.date;
        
        return formatDate(dateValue);
    };

    // Get customer's name for display
    const getCustomerName = (customer: Customer): string => {
        if (customer.type === 'individual') {
            return customer.full_name || customer.name || 'Individual Customer';
        } else {
            return customer.companyName || customer.company_name || customer.name || 'Company';
        }
    };

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
                                    {getCustomerName(customer)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{customer.email || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{getCustomerDate(customer)}</div>
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
                                    onClick={() => onViewCustomer(customer)}
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

export default CustomerList; 