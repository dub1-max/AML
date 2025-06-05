import React, { useState, useEffect } from 'react';
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
    
    // Date
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
    
    // Name Screening
    name_screening_hits?: any[];
    
    // New dataset field
    dataset?: string;
    
    [key: string]: any;
}

interface CustomerProfileDetailsProps {
    customer: Customer;
    onBack: () => void;
}

type TabType = 'profile' | 'nameScreening' | 'documentVerification' | 'riskRating' | 'activityTimeline';

const CustomerProfileDetails: React.FC<CustomerProfileDetailsProps> = ({ customer, onBack }) => {
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [matchingProfiles, setMatchingProfiles] = useState<any[]>([]);
    const [isLoadingMatches, setIsLoadingMatches] = useState(false);

    // Fetch matching profiles when tab changes to nameScreening
    useEffect(() => {
        if (activeTab === 'nameScreening') {
            fetchMatchingProfiles();
        }
    }, [activeTab]);

    const fetchMatchingProfiles = async () => {
        setIsLoadingMatches(true);
        try {
            // Instead of using mock data or API calls, we'll use the customer's actual data
            // This ensures we're showing real data instead of random information
            
            // If customer already has screening hits, use those
            if (customer.name_screening_hits && Array.isArray(customer.name_screening_hits) && customer.name_screening_hits.length > 0) {
                setMatchingProfiles(customer.name_screening_hits);
                setIsLoadingMatches(false);
                return;
            }
            
            // Otherwise, create a profile based on the customer's actual data
            const matchData = [];
            
            // Only add a match if the customer is from a sanctioned dataset
            if (customer.dataset) {
                // Extract the dataset type from the URL if it's a URL
                let sourceList = customer.dataset;
                
                // Parse dataset from URL if it's a URL
                if (sourceList.includes('opensanctions.org')) {
                    // Extract dataset type from URL pattern like https://data.opensanctions.org/datasets/20250205/peps/targets.simple.csv
                    const urlParts = sourceList.split('/');
                    for (const part of urlParts) {
                        if (['peps', 'sanctions', 'terrorists', 'debarment', 'ae_local_terrorists', 'un_sc_sanctions'].includes(part)) {
                            sourceList = part;
                            break;
                        }
                    }
                }
                
                // Format the source list to be more readable
                if (sourceList === 'un_sc_sanctions') {
                    sourceList = 'UN Sanctions';
                } else if (sourceList === 'ae_local_terrorists') {
                    sourceList = 'AE Terrorists';
                } else if (sourceList === 'peps') {
                    sourceList = 'PEP';
                } else if (sourceList === 'debarment') {
                    sourceList = 'Debarment';
                } else if (sourceList === 'sanctions') {
                    sourceList = 'Sanctions';
                } else if (sourceList === 'terrorists') {
                    sourceList = 'Terrorists';
                }
                
                // Create a match object based on the customer's actual data
                const matchObject = {
                    full_name: customer.full_name || customer.name,
                    dob: customer.date_of_birth,
                    id_number: customer.national_id_number || customer.passport_number,
                    country: customer.nationality || customer.country_of_residence,
                    source_list: sourceList, // Use the extracted dataset type
                    score: customer.riskLevel || 85, // Use actual risk level if available
                    
                    // Set these based on the actual dataset
                    sanction: customer.dataset.includes('sanctions') || customer.dataset.includes('un_sc_sanctions'),
                    pep: customer.dataset.includes('peps'),
                    special_interest: customer.dataset.includes('special') || customer.dataset.includes('interest'),
                    adverse_media: customer.dataset.includes('adverse') || customer.dataset.includes('media'),
                    
                    hit_determination: customer.dataset.includes('sanctions') || customer.dataset.includes('peps') || customer.dataset.includes('un_sc_sanctions')
                        ? "Potential Match" 
                        : "False Positive",
                    comments: customer.comments || ""
                };
                
                matchData.push(matchObject);
            }
            
            setMatchingProfiles(matchData);
            setIsLoadingMatches(false);
        } catch (error) {
            console.error("Error fetching matching profiles:", error);
            setIsLoadingMatches(false);
            // In case of error, set empty array to avoid showing random data
            setMatchingProfiles([]);
        }
    };

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

    const getVerificationStatus = (type: string): 'clear' | 'flagged' | 'pending' => {
        // Determine verification status based on dataset and other properties
        if (customer.dataset) {
            switch (type) {
                case 'Sanction':
                    return customer.dataset.includes('sanctions') ? 'flagged' : 'clear';
                case 'PEP':
                    return customer.dataset.includes('peps') ? 'flagged' : 'clear';
                case 'Special Interest':
                    return customer.dataset.includes('special') || customer.dataset.includes('interest') ? 'flagged' : 'clear';
                case 'Adverse Media':
                    return customer.dataset.includes('adverse') || customer.dataset.includes('media') ? 'flagged' : 'clear';
                case 'Document Matched':
                    return 'clear'; // Default to clear for document verification
                case 'Verified':
                    return 'clear'; // Default to clear for document verification
                case 'Self Declared PEP':
                    // Handle PEP status specifically
                    if (typeof customer.pep_status === 'boolean') {
                        return customer.pep_status ? 'flagged' : 'clear';
                    } else if (typeof customer.pep_status === 'string') {
                        return customer.pep_status === 'flagged' ? 'flagged' : 'clear';
                    }
                    return 'clear';
                case 'Risk Rating':
                    // Handle risk rating
                    if (customer.risk_rating) {
                        const riskValue = parseInt(String(customer.risk_rating));
                        return !isNaN(riskValue) && riskValue > 70 ? 'flagged' : 'clear';
                    }
                    return 'clear';
                default:
                    return 'clear';
            }
        }
        
        // Fallback to existing status fields if dataset isn't available
        switch (type) {
            case 'Sanction':
                if (typeof customer.sanction_status === 'boolean') {
                    return customer.sanction_status ? 'flagged' : 'clear';
                } else if (typeof customer.sanction_status === 'string') {
                    return customer.sanction_status === 'flagged' ? 'flagged' : 'clear';
                }
                return 'clear';
            case 'PEP':
                if (typeof customer.pep_status === 'boolean') {
                    return customer.pep_status ? 'flagged' : 'clear';
                } else if (typeof customer.pep_status === 'string') {
                    return customer.pep_status === 'flagged' ? 'flagged' : 'clear';
                }
                return 'clear';
            case 'Special Interest':
                if (typeof customer.special_interest_status === 'boolean') {
                    return customer.special_interest_status ? 'flagged' : 'clear';
                } else if (typeof customer.special_interest_status === 'string') {
                    return customer.special_interest_status === 'flagged' ? 'flagged' : 'clear';
                }
                return 'clear';
            case 'Adverse Media':
                if (typeof customer.adverse_media_status === 'boolean') {
                    return customer.adverse_media_status ? 'flagged' : 'clear';
                } else if (typeof customer.adverse_media_status === 'string') {
                    return customer.adverse_media_status === 'flagged' ? 'flagged' : 'clear';
                }
                return 'clear';
            case 'Document Matched':
                return typeof customer.document_matched === 'boolean' && customer.document_matched ? 'flagged' : 'clear';
            case 'Verified':
                return typeof customer.document_verified === 'boolean' && customer.document_verified ? 'flagged' : 'clear';
            case 'Self Declared PEP':
                // Already handled above
                if (typeof customer.pep_status === 'boolean') {
                    return customer.pep_status ? 'flagged' : 'clear';
                } else if (typeof customer.pep_status === 'string') {
                    return customer.pep_status === 'flagged' ? 'flagged' : 'clear';
                }
                return 'clear';
            case 'Risk Rating':
                // Already handled above
                if (customer.risk_rating) {
                    const riskValue = parseInt(String(customer.risk_rating));
                    return !isNaN(riskValue) && riskValue > 70 ? 'flagged' : 'clear';
                }
                return 'clear';
            default:
                return 'clear';
        }
    };

    const renderVerificationStatus = (type: string) => {
        const status = getVerificationStatus(type);
        let statusIcon;
        let statusColor;
        let statusText;

        if (status === 'clear') {
            statusIcon = <CheckCircle className="w-5 h-5 text-green-500" />;
            statusColor = 'text-green-600';
            statusText = 'Clear';
        } else if (status === 'flagged') {
            statusIcon = <XCircle className="w-5 h-5 text-red-500" />;
            statusColor = 'text-red-600';
            statusText = 'Flagged';
        } else {
            statusIcon = <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            statusColor = 'text-yellow-600';
            statusText = 'Pending';
        }

        return (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                    {statusIcon}
                    <span className="font-medium">{type}</span>
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
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                customer.status === 'approved' ? 'text-green-700 bg-green-100' :
                                customer.status === 'pending' ? 'text-yellow-700 bg-yellow-100' :
                                'text-red-700 bg-red-100'
                            }`}>
                                {customer.status === 'approved' ? '✓ Approved' :
                                 customer.status === 'pending' ? '⏳ Pending' :
                                 '✗ Rejected'}
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
                                <p className="font-medium">{customer.onboarded_by || 'N/A'}</p>
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
                        <p className="font-medium">{customer.address || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">City</span>
                        <p className="font-medium">{customer.city || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">State</span>
                        <p className="font-medium">{customer.state || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Zip/Postal Code</span>
                        <p className="font-medium">{customer.zip_code || customer.postal_code || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Contact Number</span>
                        <p className="font-medium">{customer.contact_number || customer.phone_number || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Email Address</span>
                        <p className="font-medium">{customer.email || 'N/A'}</p>
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
                        <p className="font-medium">{customer.delivery_channel || 'N/A'}</p>
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
                        <p className="font-medium">{formatDate(customer.relationship_start_date) || 'N/A'}</p>
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
                        <p className="font-medium">{customer.ever_held_public_position || 'N/A'}</p>
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
                        <p className="font-medium">{customer.pep_details || 'N/A'}</p>
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
                        <p className="font-medium">{customer.is_joint_account ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Name of Joint Account Holder</span>
                        <p className="font-medium">{customer.joint_account_holder_name || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Relationship with Customer</span>
                        <p className="font-medium">{customer.joint_account_relationship || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Joint Act Holder National ID No</span>
                        <p className="font-medium">{customer.joint_account_holder_id || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Email Address</span>
                        <p className="font-medium">{customer.joint_account_email || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Mailing Address</span>
                        <p className="font-medium">{customer.joint_account_address || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Phone Number</span>
                        <p className="font-medium">{customer.joint_account_phone || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Minor Account Info */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Minor Account Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-500">Is Minor Account</span>
                        <p className="font-medium">{customer.is_minor_account ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Name of Guardian</span>
                        <p className="font-medium">{customer.guardian_name || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Relationship with Minor</span>
                        <p className="font-medium">{customer.guardian_relationship || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Guardian National ID No.</span>
                        <p className="font-medium">{customer.guardian_id || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Guardian Email Address</span>
                        <p className="font-medium">{customer.guardian_email || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Guardian Address</span>
                        <p className="font-medium">{customer.guardian_address || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Guardian Phone Number</span>
                        <p className="font-medium">{customer.guardian_phone || 'N/A'}</p>
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
                        <p className="font-medium">{customer.fatca_national_id || 'N/A'}</p>
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
                        <p className="font-medium">{customer.fatca_power_of_attorney_name || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">POWER OF ATTORNEY'S ADDRESS</span>
                        <p className="font-medium">{customer.fatca_power_of_attorney_address || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">ARE YOU A RESIDENT OF ANY OVERSEAS COUNTRY?</span>
                        <p className="font-medium">{customer.fatca_overseas_resident || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">COUNTRY OF OVERSEAS RESIDENCE</span>
                        <p className="font-medium">{customer.fatca_overseas_country || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">DO YOU HAVE ANY OVERSEAS TAX OBLIGATIONS?</span>
                        <p className="font-medium">{customer.fatca_tax_obligations || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">COUNTRY OF OVERSEAS TAX OBLIGATION</span>
                        <p className="font-medium">{customer.fatca_tax_country || 'N/A'}</p>
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
                        <p className="font-medium">{customer.crs_reason_2_details || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">IF REASON B SELECTED, PLEASE EXPLAIN WHY YOU ARE UNABLE TO OBTAIN A TIN OR FUNCTIONAL EQUIVALENT #3</span>
                        <p className="font-medium">{customer.crs_reason_3_details || 'N/A'}</p>
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
                        <p className="font-medium">{formatDate(customer.last_review) || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Next Review</span>
                        <p className="font-medium text-blue-600 underline">{formatDate(customer.next_review) || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNameScreeningTab = () => {
        // Determine verification statuses directly from customer data
        const sanctionStatus = customer.dataset && (customer.dataset.includes('sanctions') || customer.dataset.includes('un_sc_sanctions')) ? 'flagged' : 'clear';
        const pepStatus = customer.dataset && customer.dataset.includes('peps') ? 'flagged' : 'clear';
        const specialInterestStatus = customer.dataset && 
            (customer.dataset.includes('special') || customer.dataset.includes('interest')) ? 'flagged' : 'clear';
        const adverseMediaStatus = customer.dataset && 
            (customer.dataset.includes('adverse') || customer.dataset.includes('media')) ? 'flagged' : 'clear';
        
        return (
            <div className="space-y-6">
                {/* Verification Summary */}
                <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Verification summary</h3>
                    
                    <div className="mb-6">
                        <h4 className="font-medium mb-4">Name Screening</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {/* Use direct status values instead of function calls */}
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                                <div className="flex items-center space-x-3">
                                    {sanctionStatus === 'flagged' ? (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    )}
                                    <span className="font-medium">Sanction</span>
                                </div>
                                <span className={`text-sm font-medium ${
                                    sanctionStatus === 'flagged' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {sanctionStatus === 'flagged' ? 'Flagged' : 'Clear'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                                <div className="flex items-center space-x-3">
                                    {pepStatus === 'flagged' ? (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    )}
                                    <span className="font-medium">PEP</span>
                                </div>
                                <span className={`text-sm font-medium ${
                                    pepStatus === 'flagged' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {pepStatus === 'flagged' ? 'Flagged' : 'Clear'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                                <div className="flex items-center space-x-3">
                                    {specialInterestStatus === 'flagged' ? (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    )}
                                    <span className="font-medium">Special Interest</span>
                                </div>
                                <span className={`text-sm font-medium ${
                                    specialInterestStatus === 'flagged' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {specialInterestStatus === 'flagged' ? 'Flagged' : 'Clear'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                                <div className="flex items-center space-x-3">
                                    {adverseMediaStatus === 'flagged' ? (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    )}
                                    <span className="font-medium">Adverse Media</span>
                                </div>
                                <span className={`text-sm font-medium ${
                                    adverseMediaStatus === 'flagged' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {adverseMediaStatus === 'flagged' ? 'Flagged' : 'Clear'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Name Screening Hit Details */}
                <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Name Screening Hit Details</h3>
                    
                    {isLoadingMatches ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                        </div>
                    ) : matchingProfiles.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source List</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sanction</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PEP</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Special Interest</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Adverse Media</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hit Determination</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Relevant</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Not Relevant</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {matchingProfiles.map((match, index) => {
                                        // Extract dataset type from URL if it's a URL
                                        let sourceList = match.source_list;
                                        if (sourceList && sourceList.includes('opensanctions.org')) {
                                            const urlParts = sourceList.split('/');
                                            for (const part of urlParts) {
                                                if (['peps', 'sanctions', 'terrorists', 'debarment', 'ae_local_terrorists', 'un_sc_sanctions'].includes(part)) {
                                                    sourceList = part;
                                                    break;
                                                }
                                            }
                                        }
                                        
                                        // Format the source list to be more readable
                                        if (sourceList === 'un_sc_sanctions') {
                                            sourceList = 'UN Sanctions';
                                        } else if (sourceList === 'ae_local_terrorists') {
                                            sourceList = 'AE Terrorists';
                                        } else if (sourceList === 'peps') {
                                            sourceList = 'PEP';
                                        } else if (sourceList === 'debarment') {
                                            sourceList = 'Debarment';
                                        } else if (sourceList === 'sanctions') {
                                            sourceList = 'Sanctions';
                                        } else if (sourceList === 'terrorists') {
                                            sourceList = 'Terrorists';
                                        }
                                        
                                        return (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{match.full_name || match.name || 'N/A'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{match.dob || formatDate(match.date_of_birth) || 'N/A'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{match.id_number || 'N/A'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {match.country && match.country !== 'Unknown' && match.country !== 'N/A' ? (
                                                        <div className="flex items-center">
                                                            <img 
                                                                src={`https://flagcdn.com/w20/${match.country.toLowerCase()}.png`}
                                                                alt={match.country}
                                                                className="mr-2 h-3 rounded shadow-sm"
                                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                                            />
                                                            {match.country}
                                                        </div>
                                                    ) : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{sourceList || 'N/A'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{match.score || 'N/A'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                    {match.sanction ? (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 bg-red-100 rounded-full">
                                                            <CheckCircle className="w-3 h-3 text-red-600" />
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center w-5 h-5">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                    {match.pep ? (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 bg-yellow-100 rounded-full">
                                                            <CheckCircle className="w-3 h-3 text-yellow-600" />
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center w-5 h-5">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                    {match.special_interest ? (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-100 rounded-full">
                                                            <CheckCircle className="w-3 h-3 text-purple-600" />
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center w-5 h-5">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                    {match.adverse_media ? (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full">
                                                            <CheckCircle className="w-3 h-3 text-blue-600" />
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center w-5 h-5">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{match.hit_determination || 'N/A'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                    <input type="radio" name={`relevant-${index}`} className="h-4 w-4 text-purple-600" />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                    <input type="radio" name={`relevant-${index}`} className="h-4 w-4 text-purple-600" />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{match.comments || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                    <button className="text-purple-600 hover:text-purple-800 font-medium">View</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                            <div className="bg-purple-100 rounded-full p-3 mb-4">
                                <CheckCircle className="w-10 h-10 text-purple-600" />
                            </div>
                            <p className="text-lg font-medium text-gray-900">No Name Screening Hits</p>
                            <p className="text-sm text-gray-500 mt-1">This customer has no name screening matches.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderDocumentVerificationTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Documents Verification</h3>
                <div className="space-y-4">
                    {renderVerificationStatus('Document Matched')}
                </div>
                
                <h4 className="font-medium mt-6 mb-4">Document Upload</h4>
                <div className="space-y-4">
                    {renderVerificationStatus('Verified')}
                </div>
            </div>

            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Politically Exposed Person (PEP)</h3>
                <div className="space-y-4">
                    {renderVerificationStatus('Self Declared PEP')}
                </div>
            </div>
        </div>
    );

    const renderRiskRatingTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Rating</h3>
                <div className="space-y-4">
                    {renderVerificationStatus('Risk Rating')}
                </div>
            </div>
        </div>
    );

    const renderActivityTimelineTab = () => {
        // Get the current date for the timeline header
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Create activity entries from actual customer data
        const activities = [];
        
        // Add customer creation activity if we have a creation date
        if (customer.createdAt || customer.created_at) {
            const creationDate = new Date(customer.createdAt || customer.created_at);
            activities.push({
                id: 'creation',
                type: 'system',
                actor: 'Identfo',
                actorType: 'System Activity',
                date: creationDate,
                action: 'Registered new customer into the system.',
                purpose: 'Support user action',
                actionBy: customer.onboarded_by || 'RESPECT CORPORATE SERVICES PROVIDER LLC',
                legalBasis: 'Legitimate interest',
                retentionPeriod: 'Logs retained for 7 years, auto-deleted thereafter'
            });
        }
        
        // Add screening activity if applicable
        if (customer.dataset && customer.dataset !== 'onboarded') {
            const screeningDate = new Date(customer.updatedAt || customer.updated_at || customer.record_last_updated || today);
            activities.push({
                id: 'screening',
                type: 'system',
                actor: 'Identfo',
                actorType: 'System Activity',
                date: screeningDate,
                action: 'Name Screening Hit applied with the approved result.',
                purpose: 'Regulatory compliance',
                actionBy: 'Identfo System',
                legalBasis: 'Legal Obligation',
                retentionPeriod: 'Logs retained for 7 years, auto-deleted thereafter'
            });
        }
        
        // Add document verification activity if we have document verification data
        if (customer.document_verified || customer.document_matched) {
            const docDate = new Date(customer.document_verified_date || customer.document_matched_date || customer.updatedAt || customer.updated_at || today);
            // Set doc date to be before screening date if both exist
            if (activities.length > 0 && activities[activities.length - 1].id === 'screening') {
                docDate.setHours(docDate.getHours() - 2);
            }
            
            activities.push({
                id: 'document',
                type: 'system',
                actor: 'Identfo',
                actorType: 'System Activity',
                date: docDate,
                action: 'Document verification completed successfully.',
                purpose: 'Identity verification',
                actionBy: 'Identfo System',
                legalBasis: 'Legal Obligation',
                retentionPeriod: 'Logs retained for 7 years, auto-deleted thereafter'
            });
        }
        
        // Add status update activity if we have a status
        if (customer.status) {
            const statusDate = new Date(customer.status_updated_at || customer.record_last_updated || today);
            // Set status date to be after other activities
            if (activities.length > 0) {
                statusDate.setHours(statusDate.getHours() + 1);
            }
            
            const statusAction = customer.status === 'approved' 
                ? 'Customer profile approved.' 
                : customer.status === 'pending' 
                    ? 'Customer profile pending review.' 
                    : 'Customer profile rejected.';
                    
            activities.push({
                id: 'status',
                type: 'admin',
                actor: customer.onboarded_by || 'RESPECT CORPORATE SERVICES PROVIDER LLC',
                actorType: 'Admin',
                date: statusDate,
                action: statusAction,
                purpose: 'Account management',
                actionBy: customer.onboarded_by || 'RESPECT CORPORATE SERVICES PROVIDER LLC (Admin)',
                legalBasis: 'Legitimate interest',
                retentionPeriod: 'Logs retained for 7 years, auto-deleted thereafter'
            });
        }
        
        // Sort activities by date (newest first)
        activities.sort((a, b) => b.date.getTime() - a.date.getTime());

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{formattedDate}</h3>
                    <button className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600 transition-colors">
                        EXPORT TIMELINE
                    </button>
                </div>
                
                {/* Timeline entries */}
                <div className="relative">
                    {activities.map((activity, index) => {
                        const formattedTime = activity.date.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                        });
                        const formattedFullDate = activity.date.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        });
                        
                        return (
                            <div key={activity.id} className="mb-8 relative">
                                {/* Timeline connector */}
                                {index < activities.length - 1 && (
                                    <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-200"></div>
                                )}
                                
                                <div className="flex">
                                    {/* Activity icon */}
                                    <div className="flex-shrink-0 mr-4">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                            activity.type === 'system' ? 'bg-purple-900' : 'bg-gray-300'
                                        }`}>
                                            {activity.type === 'system' ? (
                                                <span className="text-white text-sm font-medium">
                                                    {activity.actor.substring(0, 2).toUpperCase()}
                                                </span>
                                            ) : (
                                                <img 
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activity.actor)}&background=random`} 
                                                    alt={activity.actor}
                                                    className="w-16 h-16 rounded-full"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Activity content */}
                                    <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{activity.actor}</h4>
                                                <p className="text-sm text-gray-500">{activity.actorType}</p>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {formattedFullDate} {formattedTime}
                                            </span>
                                        </div>
                                        
                                        <p className="mb-4 text-gray-800">{activity.action}</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Purpose of Processing :</span>
                                                <span className="ml-2 font-medium">{activity.purpose}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Action By :</span>
                                                <span className="ml-2 font-medium">{activity.actionBy}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Legal Basis for Processing :</span>
                                                <span className="ml-2 font-medium">{activity.legalBasis}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Retention Period :</span>
                                                <span className="ml-2 font-medium">{activity.retentionPeriod}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Start marker at the bottom */}
                    {activities.length > 0 && (
                        <div className="flex justify-center mt-8">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                                START
                            </div>
                        </div>
                    )}
                    
                    {/* Empty state if no activities */}
                    {activities.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                            <div className="bg-purple-100 rounded-full p-3 mb-4">
                                <Activity className="w-10 h-10 text-purple-600" />
                            </div>
                            <p className="text-lg font-medium text-gray-900">No Activity History</p>
                            <p className="text-sm text-gray-500 mt-1">This customer has no recorded activities.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

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