import React, { useState, useEffect } from 'react';
import { Loader2, XCircle, Download, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

interface SearchResult {
    name: string;
    identifiers: string;
    country: string;
    riskLevel: number;
}

interface Tracking {
    [key: string]: {
        isTracking: boolean;
        startDate?: string;
        stopDate?: string;
    };
}

interface CompanyOB {
    user_id: string;
    company_name: string;
    registration_number: string;
    company_type: string;
    incorporation_date: string;
    business_nature: string;
    industry_sector: string;
    annual_turnover: number;
    employee_count: number;
    website_url: string;
    registered_address: string;
    operating_address: string;
    country: string;
    state: string;
    city: string;
    postal_code: string;
    contact_person_name: string;
    contact_email: string;
    contact_phone: string;
    tax_number: string;
    regulatory_licenses: string;
    status?: string;
}

interface IndividualOB {
    user_id: string;
    full_name: string;
    email: string;
    resident_status: string;
    gender: string;
    date_of_birth: string;
    nationality: string;
    country_of_residence: string;
    other_nationalities: string;
    specified_other_nationalities: string;
    national_id_number: string;
    national_id_expiry: string;
    passport_number: string;
    passport_expiry: string;
    address: string;
    state: string;
    city: string;
    zip_code: string;
    contact_number: string;
    dialing_code: string;
    work_type: string;
    industry: string;
    product_type_offered: string;
    product_offered: string;
    company_name: string;
    position_in_company: string;
    status?: string;
}

interface ProfilesProps {
    searchResults: SearchResult[];
    isLoading: boolean;
}

function Profiles({ searchResults, isLoading }: ProfilesProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tracking, setTracking] = useState<Tracking>({});
    const [trackedResults, setTrackedResults] = useState<SearchResult[]>([]);
    const [activeTab, setActiveTab] = useState<'alerts' | 'customerProfiles'>('alerts');
    const [companyData, setCompanyData] = useState<CompanyOB[]>([]);
    const [individualData, setIndividualData] = useState<IndividualOB[]>([]);
    const [allPersons, setAllPersons] = useState<SearchResult[]>([]);

    const API_BASE_URL = 'http://localhost:3001/api';

    const fetchData = async () => {
        if (!user) return;

        try {
            // Fetch all persons data first
            const personsResponse = await fetch(`${API_BASE_URL}/persons`, { credentials: 'include' });
            if (!personsResponse.ok) {
                if (personsResponse.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP Error! Status: ${personsResponse.status}`);
            }
            const allPersonsData: SearchResult[] = await personsResponse.json();
            setAllPersons(allPersonsData);

            // Fetch Tracking Data
            const trackingResponse = await fetch(`${API_BASE_URL}/tracking`, { credentials: 'include' });
            if (!trackingResponse.ok) {
                if (trackingResponse.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP Error! Status: ${trackingResponse.status}`);
            }
            const trackingData: any[] = await trackingResponse.json();
            const transformedTracking: Tracking = {};
            trackingData.forEach(item => {
                transformedTracking[item.name] = {
                    isTracking: item.isTracking === 1,
                    startDate: item.startDate,
                    stopDate: item.stopDate
                };
            });
            setTracking(transformedTracking);

            // Set tracked results
            const tracked = allPersonsData.filter(result => transformedTracking[result.name]?.isTracking);
            setTrackedResults(tracked);

            // Fetch Customer Profiles (Company and Individual)
            const companyResponse = await fetch(`${API_BASE_URL}/companyob`, { credentials: 'include' });
            const individualResponse = await fetch(`${API_BASE_URL}/individualob`, { credentials: 'include' });

            if (!companyResponse.ok || !individualResponse.ok) {
                if (companyResponse.status === 401 || individualResponse.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP Error! Status: ${companyResponse.status} or ${individualResponse.status}`);
            }

            const companyDataResult: CompanyOB[] = await companyResponse.json();
            const individualDataResult: IndividualOB[] = await individualResponse.json();

            // Update company status based on matches
            const updatedCompanyData = companyDataResult.map(company => {
                const hasMatch = checkForMatch(company.company_name, allPersonsData);
                return {
                    ...company,
                    status: hasMatch ? 'pending' : 'approved'
                };
            });

            // Update individual status based on matches
            const updatedIndividualData = individualDataResult.map(individual => {
                const hasMatch = checkForMatch(individual.full_name, allPersonsData);
                return {
                    ...individual,
                    status: hasMatch ? 'pending' : 'approved'
                };
            });

            setCompanyData(updatedCompanyData);
            setIndividualData(updatedIndividualData);

            // Update status in the database
            for (const company of updatedCompanyData) {
                await updateCompanyStatus(company.company_name, company.status || 'approved');
            }

            for (const individual of updatedIndividualData) {
                await updateIndividualStatus(individual.full_name, individual.status || 'approved');
            }

        } catch (error) {
            console.error('Could not fetch data:', error);
        }
    };

    // Check if a name matches any person in the persons table
    const checkForMatch = (name: string, personsData: SearchResult[]): boolean => {
        return personsData.some(person => 
            person.name.toLowerCase().includes(name.toLowerCase()) || 
            name.toLowerCase().includes(person.name.toLowerCase())
        );
    };

    // Update company status in the database
    const updateCompanyStatus = async (companyName: string, status: string) => {
        try {
            await fetch(`${API_BASE_URL}/updateCompanyStatus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyName, status }),
                credentials: 'include',
            });
        } catch (error) {
            console.error('Error updating company status:', error);
        }
    };

    // Update individual status in the database
    const updateIndividualStatus = async (fullName: string, status: string) => {
        try {
            await fetch(`${API_BASE_URL}/updateIndividualStatus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, status }),
                credentials: 'include',
            });
        } catch (error) {
            console.error('Error updating individual status:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, navigate]);

    const updateTracking = async (name: string, newTrackingStatus: boolean) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tracking/${name}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isTracking: newTrackingStatus }),
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                const errorData = await response.json().catch(() => ({})); // Handle non-JSON responses
                const errorMessage = errorData.message || `Server error: ${response.status}`;
                throw new Error(errorMessage);
            }

            // Refetch *all* data after updating tracking status.  This ensures consistency.
            fetchData();

        } catch (error: any) {
            console.error('Error updating tracking:', error.message);
        }
    };

    const toggleTracking = (name: string) => {
        const currentTrackingStatus = tracking[name]?.isTracking ?? false;
        updateTracking(name, !currentTrackingStatus);
    };

    const calculateAging = (result: SearchResult): string => {
        const trackingInfo = tracking[result.name];

        if (trackingInfo?.isTracking) {
            return trackingInfo.startDate
                ? `${Math.floor((Date.now() - new Date(trackingInfo.startDate).getTime()) / (1000 * 60 * 60 * 24))}D`
                : '0D';
        } else if (trackingInfo?.stopDate && trackingInfo.startDate) {
            const diffInDays = Math.floor((new Date(trackingInfo.stopDate).getTime() - new Date(trackingInfo.startDate).getTime()) / (1000 * 60 * 60 * 24));
            return `<span style="color: red;">${diffInDays}D</span>`;
        } else {
            return 'None';
        }
    };

    const getRiskColor = (percentage: number): string => {
        if (percentage >= 85) return 'text-red-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-green-600';
    };

    const generateIndividualPDF = async (individual: IndividualOB) => {
        const jsPDF = (await import('jspdf')).default;
        const autoTable = (await import('jspdf-autotable')).default;
    
        const doc = new jsPDF();
    
        const addCustomerInfo = (doc: jsPDF, title: string, data: [string, any][]) => {
            doc.setFontSize(14);
            doc.text(title, 14, 20);
            doc.setFontSize(12);
            const startY = 30;
    
            data.forEach(([key, value], index: number) => {
                const yOffset = startY + index * 10;
                doc.text(`${key}:`, 14, yOffset);
                doc.text(String(value), 80, yOffset);
            });
        };
    
        const customerData: [string, any][] = [
            ["Id", individual.user_id],
            ["Full Name", individual.full_name],
            ["Resident Status", individual.resident_status],
            ["Date of Birth", individual.date_of_birth],
            ["Nationality", individual.nationality],
            ["National ID Document Number", individual.national_id_number],
            ["ID Expiry Date", individual.national_id_expiry],
            ["Passport Document Number", individual.passport_number],
            ["Passport Expiry Date", individual.passport_expiry],
        ];

        addCustomerInfo(doc, "Customer Information", customerData);

        // Key Findings Section
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Key Findings", 14, 20);
        doc.setFontSize(12);
        doc.text("Total Matches: 0", 14, 30);
        doc.text("Resolved Matches: Genuine: 0, Not Genuine: 0", 14, 40);
        doc.text("Unresolved Matches: 0", 14, 50);

        // Risk Ratings Section
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Risk Ratings", 14, 20);
        autoTable(doc, {
            startY: 30,
            head: [["Risk factor matrix", "Score", "Level"]],
            body: [
                ["Country of Residence", "5", "medium"],
                ["Delivery Channel", "0", "low"],
                ["Industry", "0", "low"],
                ["Product", "0", "low"],
                ["State", "0", "low"],
                ["PEP", "0", "low"],
                ["Document Verification", "0", "low"],
                ["Base Rating", "5", "low"],
            ],
            theme: "grid",
            styles: {
                fontSize: 10,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 30 },
                2: { cellWidth: 30 },
            }
        });

        const nextStartY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 40;

        // Risk Factor Override
        autoTable(doc, {
            startY: nextStartY,
            head: [["Risk factor override", "Override To", "Level"]],
            body: [
                ["Suspicious Transaction Report Filed", "N/A", "low"],
                ["Non Resident", "N/A", "low"],
                ["Residence Country is Sanctioned", "N/A", "low"],
                ["Nationality Country is Sanctioned", "N/A", "low"],
                ["Contact No. Code Country is Sanctioned", "N/A", "low"],
                ["Sanction Hit", "N/A", "low"],
                ["PEP", "N/A", "low"],
                ["Special Interest Hit", "N/A", "low"],
                ["Document Verification", "N/A", "low"],
                ["Adverse Media Hit", "N/A", "low"],
                ["Overall Rating", "low", "low"],
            ],
            theme: "grid",
            styles: {
                fontSize: 10,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 30 },
                2: { cellWidth: 30 },
            }
        });

        doc.save(`${individual.full_name}_profile.pdf`);
    };

    const generateCompanyPDF = async (company: CompanyOB) => {
        const jsPDF = (await import('jspdf')).default;
        const autoTable = (await import('jspdf-autotable')).default;
    
        const doc = new jsPDF();
    
        const addCompanyInfo = (doc: jsPDF, title: string, data: [string, any][]) => {
            doc.setFontSize(14);
            doc.text(title, 14, 20);
            doc.setFontSize(12);
            const startY = 30;
    
            data.forEach(([key, value], index: number) => {
                const yOffset = startY + index * 10;
                doc.text(`${key}:`, 14, yOffset);
                doc.text(String(value), 80, yOffset);
            });
        };
    
        const companyData: [string, any][] = [
            ["Id", company.user_id],
            ["Company Name", company.company_name],
            ["Registration Number", company.registration_number],
            ["Company Type", company.company_type],
            ["Incorporation Date", company.incorporation_date],
            ["Contact Email", company.contact_email],
            ["Contact Phone", company.contact_phone],
        ];
    
        addCompanyInfo(doc, "Company Information", companyData);
    
        // Key Findings Section
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Key Findings", 14, 20);
        doc.setFontSize(12);
        doc.text("Total Matches: 0", 14, 30);
        doc.text("Resolved Matches: Genuine: 0, Not Genuine: 0", 14, 40);
        doc.text("Unresolved Matches: 0", 14, 50);
    
        // Risk Ratings Section
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Risk Ratings", 14, 20);
    
        autoTable(doc, {
            startY: 30,
            head: [["Risk factor matrix", "Score", "Level"]],
            body: [
                ["Country of Residence", "5", "medium"],
                ["Delivery Channel", "0", "low"],
                ["Industry", "0", "low"],
                ["Product", "0", "low"],
                ["State", "0", "low"],
                ["PEP", "0", "low"],
                ["Document Verification", "0", "low"],
                ["Base Rating", "5", "low"],
            ],
            theme: "grid",
            styles: {
                fontSize: 10,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 30 },
                2: { cellWidth: 30 },
            }
        });
    
        const nextStartY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 40;
    
        // Risk Factor Override
        autoTable(doc, { 
            startY: nextStartY,
            head: [["Risk factor override", "Override To", "Level"]],
            body: [
                ["Suspicious Transaction Report Filed", "N/A", "low"],
                ["Non Resident", "N/A", "low"],
                ["Residence Country is Sanctioned", "N/A", "low"],
                ["Nationality Country is Sanctioned", "N/A", "low"],
                ["Contact No. Code Country is Sanctioned", "N/A", "low"],
                ["Sanction Hit", "N/A", "low"],
                ["PEP", "N/A", "low"],
                ["Special Interest Hit", "N/A", "low"],
                ["Document Verification", "N/A", "low"],
                ["Adverse Media Hit", "N/A", "low"],
                ["Overall Rating", "low", "low"],
            ],
            theme: "grid",
            styles: {
                fontSize: 10,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 30 },
                2: { cellWidth: 30 },
            }
        });
    
        doc.save(`${company.company_name}_profile.pdf`);
    };
    
    return (
        <div className="p-6">
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
                    <li className="mr-2" role="presentation">
                        <button
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'alerts' ? 'border-purple-600 text-purple-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('alerts')}
                            type="button"
                            role="tab"
                        >
                            Alerts
                        </button>
                    </li>
                    <li className="mr-2" role="presentation">
                        <button
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'customerProfiles' ? 'border-purple-600 text-purple-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('customerProfiles')}
                            type="button"
                            role="tab"
                        >
                            Customer Profiles
                        </button>
                    </li>
                </ul>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            )}

            {!isLoading && activeTab === 'alerts' && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500">
                                <th className="pb-4 px-6 whitespace-nowrap">TYPE</th>
                                <th className="pb-4 px-6 whitespace-nowrap">CUSTOMER</th>
                                <th className="pb-4 px-6 whitespace-nowrap">FULL NAME</th>
                                <th className="pb-4 px-6 whitespace-nowrap">NATIONALITY</th>
                                <th className="pb-4 px-6 whitespace-nowrap">AGING</th>
                                <th className="pb-4 px-6 whitespace-nowrap">NAME SCREENING</th>
                                <th className="pb-4 px-6 whitespace-nowrap">DOCUMENTATION</th>
                                <th className="pb-4 px-6 whitespace-nowrap">RISK RATING</th>
                                <th className="pb-4 px-6 whitespace-nowrap">STATUS</th>
                                <th className="pb-4 px-6 whitespace-nowrap">TRACKING</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(trackedResults.length > 0 ? trackedResults : searchResults).map((result, index) => (
                                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-6">
                                        <div className={`w-1 h-6 rounded-full ${getRiskColor(result.riskLevel).replace('text', 'bg')}`}></div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <img src={`https://ui-avatars.com/api/?name=${result.name}`} alt={result.name} className="w-8 h-8 rounded-full" />
                                            <span className="text-sm">{result.identifiers}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm">{result.name}</td>
                                    <td className="py-4 px-6 text-sm">{result.country}</td>
                                    <td className="py-4 px-6 text-sm" dangerouslySetInnerHTML={{ __html: calculateAging(result) }} />
                                    <td className="py-4 px-6">
                                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`text-sm ${getRiskColor(result.riskLevel)}`}>{result.riskLevel}%</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Review</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={() => toggleTracking(result.name)}
                                            className={`w-8 h-5 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${tracking[result.name]?.isTracking ? 'bg-purple-500' : 'bg-gray-300'}`}
                                        >
                                            <div
                                                className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-300 ${tracking[result.name]?.isTracking ? 'translate-x-3' : 'translate-x-0'}`}
                                            ></div>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!isLoading && activeTab === 'customerProfiles' && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Individual Customers</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500">
                                    <th className="pb-4 px-6 whitespace-nowrap">User ID</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Full Name</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Email</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Nationality</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Status</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {individualData.map((individual, index) => {
                                    const matchFound = checkForMatch(individual.full_name, allPersons);
                                    return (
                                        <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-6">{individual.user_id}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${individual.full_name}`} 
                                                        alt={individual.full_name} 
                                                        className="w-8 h-8 rounded-full" 
                                                    />
                                                    <span>{individual.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">{individual.email}</td>
                                            <td className="py-4 px-6">{individual.nationality}</td>
                                            <td className="py-4 px-6">
                                                {matchFound ? (
                                                    <div className="flex items-center px-3 py-2 rounded-full bg-yellow-100 w-fit">
                                                        <span className="text-yellow-800 font-medium text-sm flex items-center">
                                                            <span className="mr-2">⚠️</span> Pending
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center px-3 py-2 rounded-full bg-green-100 w-fit">
                                                        <span className="text-green-800 font-medium text-sm flex items-center">
                                                            <CheckCircle className="w-4 h-4 mr-1" /> Approved
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => generateIndividualPDF(individual)}
                                                    className="text-purple-600 hover:text-purple-800"
                                                    title="Download PDF"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-xl font-semibold my-6">Company Customers</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500">
                                    <th className="pb-4 px-6 whitespace-nowrap">User ID</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Company Name</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Registration Number</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Country</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Status</th>
                                    <th className="pb-4 px-6 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companyData.map((company, index) => {
                                    const matchFound = checkForMatch(company.company_name, allPersons);
                                    return (
                                        <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-6">{company.user_id}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${company.company_name}`} 
                                                        alt={company.company_name} 
                                                        className="w-8 h-8 rounded-full" 
                                                    />
                                                    <span>{company.company_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">{company.registration_number}</td>
                                            <td className="py-4 px-6">{company.country}</td>
                                            <td className="py-4 px-6">
                                                {matchFound ? (
                                                    <div className="flex items-center px-3 py-2 rounded-full bg-yellow-100 w-fit">
                                                        <span className="text-yellow-800 font-medium text-sm flex items-center">
                                                            <span className="mr-2">⚠️</span> Pending
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center px-3 py-2 rounded-full bg-green-100 w-fit">
                                                        <span className="text-green-800 font-medium text-sm flex items-center">
                                                            <CheckCircle className="w-4 h-4 mr-1" /> Approved
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => generateCompanyPDF(company)}
                                                    className="text-purple-600 hover:text-purple-800"
                                                    title="Download PDF"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profiles;