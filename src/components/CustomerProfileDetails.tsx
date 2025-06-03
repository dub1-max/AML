import React, { useState } from 'react';
import { ArrowLeft, Download, Bell, CheckCircle, XCircle, AlertTriangle, User, Globe, FileText, Activity } from 'lucide-react';

interface Customer {
    // Basic Information
    id: string;
    user_id?: string;
    identoId?: string;
    type: 'individual' | 'company';
    status: string;
    
    // Personal Information
    full_name?: string;
    companyName?: string;
    company_name?: string;
    gender?: string;
    date_of_birth?: string;
    nationality?: string;
    country_of_residence?: string;
    national_id_number?: string;
    national_id_expiry?: string;
    passport_number?: string;
    passport_expiry?: string;
    
    // Contact Information
    email?: string;
    contact_number?: string;
    phone_number?: string;
    address?: string;
    state?: string;
    city?: string;
    zip_code?: string;
    postal_code?: string;
    
    // Professional Information
    work_type?: string;
    industry?: string;
    position_in_company?: string;
    company_name_work?: string;
    
    // Verification Status
    document_matched?: boolean;
    document_verified?: boolean;
    sanction_status?: string;
    pep_status?: string;
    special_interest_status?: string;
    adverse_media_status?: string;
    risk_rating?: string;
    
    // Dates
    onboarded_by?: string;
    record_last_updated?: string;
    last_review?: string;
    next_review?: string;
    
    // PEP Declaration
    current_public_position?: string;
    past_public_position?: string;
    relative_public_position?: string;
    court_connection?: string;
    close_associate?: string;
    diplomatic_immunity?: string;
    
    // Source of Wealth
    source_of_wealth?: string;
    other_source?: string;
    
    // Joint Account & Minor Info
    is_joint_account?: boolean;
    joint_account_holder_name?: string;
    joint_account_holder_id?: string;
    is_minor_account?: boolean;
    guardian_name?: string;
    guardian_id?: string;
    
    // FATCA Info
    fatca_full_name?: string;
    fatca_birth_place?: string;
    fatca_power_of_attorney?: string;
    fatca_overseas_resident?: string;
    fatca_tax_obligations?: string;
    
    // CRS Info
    crs_tax_residence_1?: string;
    crs_tin_1?: string;
    crs_tax_residence_2?: string;
    crs_tin_2?: string;
    crs_tax_residence_3?: string;
    crs_tin_3?: string;
    crs_reason_1?: string;
    crs_reason_2?: string;
    crs_reason_3?: string;
    crs_investment_range?: string;
    
    [key: string]: any;
}

interface CustomerProfileDetailsProps {
    customer: Customer;
    onBack: () => void;
}

type TabType = 'profile' | 'nameScreening' | 'documentVerification' | 'riskRating' | 'activityTimeline';

const CustomerProfileDetails: React.FC<CustomerProfileDetailsProps> = ({ customer, onBack }) => {
    const [activeTab, setActiveTab] = useState<TabType>('profile');

    const tabs = [
        { id: 'profile' as TabType, label: 'Customer Profile', icon: User },
        { id: 'nameScreening' as TabType, label: 'Name Screening', icon: Globe },
        { id: 'documentVerification' as TabType, label: 'Document Verification', icon: FileText },
        { id: 'riskRating' as TabType, label: 'Risk Rating', icon: AlertTriangle },
        { id: 'activityTimeline' as TabType, label: 'Activity Timeline', icon: Activity }
    ];

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            return 'N/A';
        }
    };

    const getCustomerName = (): string => {
        if (customer.type === 'individual') {
            return customer.full_name || customer.name || 'Individual Customer';
        } else {
            return customer.companyName || customer.company_name || customer.name || 'Company';
        }
    };

    const renderVerificationStatus = (status: string | boolean | undefined, label: string) => {
        let statusIcon;
        let statusColor;
        let statusText;

        if (status === true || status === 'approved' || status === 'verified' || status === 'clear') {
            statusIcon = <CheckCircle className="w-5 h-5 text-green-500" />;
            statusColor = 'text-green-600';
            statusText = 'Verified';
        } else if (status === false || status === 'rejected' || status === 'failed' || status === 'flagged') {
            statusIcon = <XCircle className="w-5 h-5 text-red-500" />;
            statusColor = 'text-red-600';
            statusText = 'Failed';
        } else if (status === 'pending' || status === 'review') {
            statusIcon = <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            statusColor = 'text-yellow-600';
            statusText = 'Pending';
        } else {
            statusIcon = <CheckCircle className="w-5 h-5 text-green-500" />;
            statusColor = 'text-green-600';
            statusText = 'Clear';
        }

        return (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                    {statusIcon}
                    <span className="font-medium">{label}</span>
                </div>
                <span className={`text-sm font-medium ${statusColor}`}>{statusText}</span>
            </div>
        );
    };

    const renderProfileTab = () => (
        <div className="space-y-6">
            {/* Header with profile picture and basic info */}
            <div className="bg-white rounded-lg p-6">
                <div className="flex items-start space-x-6">
                    <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                            <h2 className="text-2xl font-bold">{getCustomerName()}</h2>
                            <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                                ✓ Approved
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Identfo ID</span>
                                <p className="font-medium">{customer.identoId || customer.user_id || customer.id}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Full Name</span>
                                <p className="font-medium">{getCustomerName()}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Gender</span>
                                <p className="font-medium">{customer.gender || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Date of Birth</span>
                                <p className="font-medium">{formatDate(customer.date_of_birth)}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Country of Residence</span>
                                <p className="font-medium">{customer.country_of_residence || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Nationality</span>
                                <p className="font-medium">{customer.nationality || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">National ID Number</span>
                                <p className="font-medium">{customer.national_id_number || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">National ID Expiry</span>
                                <p className="font-medium">{formatDate(customer.national_id_expiry)}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Passport Number</span>
                                <p className="font-medium">{customer.passport_number || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Passport Number Expiry</span>
                                <p className="font-medium">{formatDate(customer.passport_expiry)}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Onboarded By</span>
                                <p className="font-medium">{customer.onboarded_by || 'RESPECT CORPORATE SERVICES PROVIDER LLC'}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Record Last Updated</span>
                                <p className="font-medium">{formatDate(customer.record_last_updated) || formatDate(customer.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">Address</span>
                        <p className="font-medium">{customer.address || ''}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">City</span>
                        <p className="font-medium">{customer.city || ''}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">State</span>
                        <p className="font-medium">{customer.state || ''}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Zip/Postal Code</span>
                        <p className="font-medium">{customer.zip_code || customer.postal_code || ''}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Contact Number</span>
                        <p className="font-medium">{customer.contact_number || customer.phone_number || ''}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Email Address</span>
                        <p className="font-medium">{customer.email || ''}</p>
                    </div>
                </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">Work Type</span>
                        <p className="font-medium">{customer.work_type || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Industry</span>
                        <p className="font-medium">{customer.industry || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Products</span>
                        <p className="font-medium">{customer.product_type_offered || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Product Offered</span>
                        <p className="font-medium">{customer.product_offered || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Delivery Channel</span>
                        <p className="font-medium">Face to Face</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Company Name</span>
                        <p className="font-medium">{customer.company_name_work || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Position in Company</span>
                        <p className="font-medium">{customer.position_in_company || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Relationship Start Date</span>
                        <p className="font-medium">N/A</p>
                    </div>
                </div>
            </div>

            {/* PEP Declaration */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">PEP Declaration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">DO YOU CURRENTLY HOLD ANY PUBLIC POSITION?</span>
                        <p className="font-medium">{customer.current_public_position || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">DID YOU HOLD ANY PUBLIC POSITION IN THE LAST 12 MONTHS?</span>
                        <p className="font-medium">{customer.past_public_position || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">HAVE YOU EVER HELD ANY PUBLIC POSITION?</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">DO YOU HAVE OR HAVE YOU EVER HAD ANY DIPLOMATIC IMMUNITY?</span>
                        <p className="font-medium">{customer.diplomatic_immunity || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">DO YOU HAVE A RELATIVE WHO HAS HELD PUBLIC POSITION IN THE LAST 12 MONTHS?</span>
                        <p className="font-medium">{customer.relative_public_position || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">DO YOU HAVE A CLOSE ASSOCIATE WHO HAS HELD PUBLIC POSITION IN THE LAST 12 MONTHS?</span>
                        <p className="font-medium">{customer.close_associate || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">HAS THERE BEEN A CONVICTION AGAINST YOU BY A COURT OF LAW?</span>
                        <p className="font-medium">{customer.court_connection || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">IF YOU HAVE ANSWERED "YES" TO ANY OF THE QUESTIONS, DETAILS.</span>
                        <p className="font-medium">N/A</p>
                    </div>
                </div>
            </div>

            {/* Source of Wealth */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Source Of Wealth</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">SOURCE OF WEALTH</span>
                        <p className="font-medium">{customer.source_of_wealth || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Other</span>
                        <p className="font-medium">{customer.other_source || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Joint Account Info */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Joint Account Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">Is Joint Account</span>
                        <p className="font-medium">{customer.is_joint_account ? 'Yes' : 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Name of Joint Account Holder</span>
                        <p className="font-medium">{customer.joint_account_holder_name || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Relationship with Customer</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Joint Act Holder National ID No</span>
                        <p className="font-medium">{customer.joint_account_holder_id || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Email Address</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Mailing Address</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Phone Number</span>
                        <p className="font-medium">N/A N/A</p>
                    </div>
                </div>
            </div>

            {/* Minor Account Info */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Minor Account Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">Is Minor Account</span>
                        <p className="font-medium">{customer.is_minor_account ? 'Yes' : 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Name of Guardian</span>
                        <p className="font-medium">{customer.guardian_name || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Relationship with Minor</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Guardian National ID No.</span>
                        <p className="font-medium">{customer.guardian_id || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Guardian Email Address</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Guardian Address</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Guardian Phone Number</span>
                        <p className="font-medium">N/A N/A</p>
                    </div>
                </div>
            </div>

            {/* FATCA Info */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">FATCA Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">Full Name</span>
                        <p className="font-medium">{customer.fatca_full_name || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">National ID Number</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Place Of Birth</span>
                        <p className="font-medium">{customer.fatca_birth_place || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">HAVE YOU GIVEN ANY POWER OF ATTORNEY TO ANY OVERSEAS RESIDENT?</span>
                        <p className="font-medium">{customer.fatca_power_of_attorney || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">POWER OF ATTORNEY'S NAME</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">POWER OF ATTORNEY'S ADDRESS</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">ARE YOU A RESIDENT OF ANY OVERSEAS COUNTRY?</span>
                        <p className="font-medium">{customer.fatca_overseas_resident || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">COUNTRY OF OVERSEAS RESIDENCE</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">DO YOU HAVE ANY OVERSEAS TAX OBLIGATIONS?</span>
                        <p className="font-medium">{customer.fatca_tax_obligations || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">COUNTRY OF OVERSEAS TAX OBLIGATION</span>
                        <p className="font-medium">N/A</p>
                    </div>
                </div>
            </div>

            {/* CRS Info */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">CRS Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">COUNTRY OF TAX RESIDENCE #1</span>
                        <p className="font-medium">{customer.crs_tax_residence_1 || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">TIN OR EQUIVALENT #1</span>
                        <p className="font-medium">{customer.crs_tin_1 || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">REASON #1</span>
                        <p className="font-medium">{customer.crs_reason_1 || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">COUNTRY OF TAX RESIDENCE #2</span>
                        <p className="font-medium">{customer.crs_tax_residence_2 || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">TIN OR EQUIVALENT #2</span>
                        <p className="font-medium">{customer.crs_tin_2 || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">REASON #2</span>
                        <p className="font-medium">{customer.crs_reason_2 || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">COUNTRY OF TAX RESIDENCE #3</span>
                        <p className="font-medium">{customer.crs_tax_residence_3 || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">TIN OR EQUIVALENT #3</span>
                        <p className="font-medium">{customer.crs_tin_3 || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">IF REASON B SELECTED, PLEASE EXPLAIN WHY YOU ARE UNABLE TO OBTAIN A TIN OR FUNCTIONAL EQUIVALENT #2</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">IF REASON B SELECTED, PLEASE EXPLAIN WHY YOU ARE UNABLE TO OBTAIN A TIN OR FUNCTIONAL EQUIVALENT #3</span>
                        <p className="font-medium">N/A</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Investment Range</span>
                        <p className="font-medium">{customer.crs_investment_range || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* On-Going Due Diligence */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">On-Going Due Diligence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">Last Review</span>
                        <p className="font-medium">{formatDate(customer.last_review) || '21 May, 2025'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Next Review</span>
                        <p className="font-medium text-blue-600 underline">{formatDate(customer.next_review) || '21 May, 2030'}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNameScreeningTab = () => (
        <div className="space-y-6">
            {/* Verification Summary */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Verification summary</h3>
                
                <div className="mb-6">
                    <h4 className="font-medium mb-4">Name Screening</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {renderVerificationStatus(customer.sanction_status || true, 'Sanction')}
                        {renderVerificationStatus(customer.pep_status || true, 'PEP')}
                        {renderVerificationStatus(customer.special_interest_status || true, 'Special Interest')}
                        {renderVerificationStatus(customer.adverse_media_status || true, 'Adverse Media')}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDocumentVerificationTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Documents Verification</h3>
                <div className="space-y-4">
                    {renderVerificationStatus(customer.document_matched || true, 'Document Matched')}
                </div>
                
                <h4 className="font-medium mt-6 mb-4">Document Upload</h4>
                <div className="space-y-4">
                    {renderVerificationStatus(customer.document_verified || true, 'Verified')}
                </div>
            </div>

            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Politically Exposed Person (PEP)</h3>
                <div className="space-y-4">
                    {renderVerificationStatus(customer.pep_status || true, 'Self Declared PEP')}
                </div>
            </div>
        </div>
    );

    const renderRiskRatingTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Rating</h3>
                <div className="space-y-4">
                    {renderVerificationStatus(customer.risk_rating || 'low', 'Low')}
                </div>
            </div>
        </div>
    );

    const renderActivityTimelineTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Customer Profile Created</span>
                            <span className="text-xs text-gray-500">{formatDate(customer.createdAt || customer.created_at)}</span>
                        </div>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Verification Completed</span>
                            <span className="text-xs text-gray-500">{formatDate(customer.updatedAt || customer.updated_at)}</span>
                        </div>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Status Updated to Approved</span>
                            <span className="text-xs text-gray-500">{formatDate(customer.record_last_updated)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return renderProfileTab();
            case 'nameScreening':
                return renderNameScreeningTab();
            case 'documentVerification':
                return renderDocumentVerificationTab();
            case 'riskRating':
                return renderRiskRatingTab();
            case 'activityTimeline':
                return renderActivityTimelineTab();
            default:
                return renderProfileTab();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={onBack}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                <span>Go back</span>
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                                <Bell className="w-4 h-4 mr-2" />
                                CREATE MANUAL ALERT
                            </button>
                            <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                <Download className="w-4 h-4 mr-2" />
                                DOWNLOAD PROFILE
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="border-b">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-yellow-500 text-yellow-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default CustomerProfileDetails; 