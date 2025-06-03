import React from 'react';
import CustomerProfileDetails from './CustomerProfileDetails';

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
    return <CustomerProfileDetails customer={customer} onBack={onBack} />;
};

export default CustomerDetails; 