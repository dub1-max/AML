import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface Customer {
    id: string;
    type: 'individual' | 'company';
    status: string;
    email?: string;
    full_name?: string;
    companyName?: string;
    [key: string]: any;
}

interface CustomerDetailsProps {
    customer: Customer;
    onBack: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, onBack }) => {
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

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <button 
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    <span>Back to List</span>
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">
                    {customer.type === 'individual' ? 'Individual Details' : 'Company Details'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {customer.type === 'individual' ? (
                        <>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                                <p className="mt-1 text-sm text-gray-900">{getCustomerName(customer)}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Company Name</h3>
                                <p className="mt-1 text-sm text-gray-900">{getCustomerName(customer)}</p>
                            </div>
                        </>
                    )}

                    {customer.email && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                            <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <span className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${customer.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            customer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}
                        >
                            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Date Registered</h3>
                        <p className="mt-1 text-sm text-gray-900">{getCustomerDate(customer)}</p>
                    </div>

                    {/* Display all other available properties */}
                    {Object.entries(customer).map(([key, value]) => {
                        // Skip already displayed or internal properties
                        if (['id', 'type', 'fullName', 'companyName', 'name', 'full_name', 'email', 'status', 'createdAt', 'updatedAt'].includes(key)) {
                            return null;
                        }
                        
                        // Skip empty values or complex objects
                        if (value === null || value === undefined || typeof value === 'object') {
                            return null;
                        }
                        
                        // Format the key for display
                        const formattedKey = key.replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .replace(/_/g, ' ');
                        
                        return (
                            <div key={key}>
                                <h3 className="text-sm font-medium text-gray-500">{formattedKey}</h3>
                                <p className="mt-1 text-sm text-gray-900">{value.toString()}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails; 