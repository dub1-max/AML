import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getApiBaseUrl } from './config';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getSortedCountries, statesByCountry } from './utils/countries';
import { Loader2 } from 'lucide-react';
import { SearchResult } from './types';

function EditProfile() {
    const API_BASE_URL = getApiBaseUrl();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const initialProfile = location.state?.profile;
    const [isLoading, setIsLoading] = useState(true);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [residentStatus, setResidentStatus] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [nationality, setNationality] = useState('');
    const [countryOfResidence, setCountryOfResidence] = useState('');
    const [otherNationalities, setOtherNationalities] = useState(false);
    const [specifiedOtherNationalities, setSpecifiedOtherNationalities] = useState('');
    const [nationalIdNumber, setNationalIdNumber] = useState('');
    const [nationalIdExpiry, setNationalIdExpiry] = useState('');
    const [passportNumber, setPassportNumber] = useState('');
    const [passportExpiry, setPassportExpiry] = useState('');
    const [address, setAddress] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [dialingCode, setDialingCode] = useState('');
    const [workType, setWorkType] = useState('');
    const [industry, setIndustry] = useState('');
    const [productTypeOffered, setProductTypeOffered] = useState('');
    const [productOffered, setProductOffered] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [positionInCompany, setPositionInCompany] = useState('');

    // Get sorted countries list
    const countries = getSortedCountries();

    // Get states for selected country
    const states = countryOfResidence ? statesByCountry[countryOfResidence] || [] : [];

    const { user } = useAuth();

    // Fetch profile data when component mounts
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                if (initialProfile) {
                    // Initialize form with data from location state
                    setFullName(initialProfile.name || '');
                    setNationalIdNumber(initialProfile.identifiers || '');
                    
                    // We need to fetch the full profile data from the server
                    const response = await fetch(`${API_BASE_URL}/profile/${id}`, {
                        credentials: 'include'
                    });

                    if (response.ok) {
                        const profileData = await response.json();
                        
                        // Fill in the rest of the form based on the full profile data
                        setEmail(profileData.email || '');
                        setResidentStatus(profileData.residentStatus || '');
                        setGender(profileData.gender || '');
                        setDateOfBirth(profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '');
                        setNationality(profileData.nationality || '');
                        setCountryOfResidence(profileData.countryOfResidence || '');
                        setOtherNationalities(profileData.otherNationalities || false);
                        setSpecifiedOtherNationalities(profileData.specifiedOtherNationalities || '');
                        setNationalIdExpiry(profileData.nationalIdExpiry ? new Date(profileData.nationalIdExpiry).toISOString().split('T')[0] : '');
                        setPassportNumber(profileData.passportNumber || '');
                        setPassportExpiry(profileData.passportExpiry ? new Date(profileData.passportExpiry).toISOString().split('T')[0] : '');
                        setAddress(profileData.address || '');
                        setState(profileData.state || '');
                        setCity(profileData.city || '');
                        setZipCode(profileData.zipCode || '');
                        setContactNumber(profileData.contactNumber || '');
                        setDialingCode(profileData.dialingCode || '');
                        setWorkType(profileData.workType || '');
                        setIndustry(profileData.industry || '');
                        setProductTypeOffered(profileData.productTypeOffered || '');
                        setProductOffered(profileData.productOffered || '');
                        setCompanyName(profileData.companyName || '');
                        setPositionInCompany(profileData.positionInCompany || '');
                    } else {
                        // If profile not found, use minimal data from initialProfile
                        console.error('Failed to fetch profile data');
                    }
                } else if (id) {
                    // If we don't have initialProfile but have ID, fetch from server
                    const response = await fetch(`${API_BASE_URL}/profile/${id}`, {
                        credentials: 'include'
                    });

                    if (response.ok) {
                        const profileData = await response.json();
                        // Fill the form with fetched data
                        setFullName(profileData.fullName || profileData.name || '');
                        setEmail(profileData.email || '');
                        setResidentStatus(profileData.residentStatus || '');
                        setGender(profileData.gender || '');
                        setDateOfBirth(profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '');
                        setNationality(profileData.nationality || '');
                        setCountryOfResidence(profileData.countryOfResidence || '');
                        setOtherNationalities(profileData.otherNationalities || false);
                        setSpecifiedOtherNationalities(profileData.specifiedOtherNationalities || '');
                        setNationalIdNumber(profileData.nationalIdNumber || profileData.identifiers || '');
                        setNationalIdExpiry(profileData.nationalIdExpiry ? new Date(profileData.nationalIdExpiry).toISOString().split('T')[0] : '');
                        setPassportNumber(profileData.passportNumber || '');
                        setPassportExpiry(profileData.passportExpiry ? new Date(profileData.passportExpiry).toISOString().split('T')[0] : '');
                        setAddress(profileData.address || '');
                        setState(profileData.state || '');
                        setCity(profileData.city || '');
                        setZipCode(profileData.zipCode || '');
                        setContactNumber(profileData.contactNumber || '');
                        setDialingCode(profileData.dialingCode || '');
                        setWorkType(profileData.workType || '');
                        setIndustry(profileData.industry || '');
                        setProductTypeOffered(profileData.productTypeOffered || '');
                        setProductOffered(profileData.productOffered || '');
                        setCompanyName(profileData.companyName || '');
                        setPositionInCompany(profileData.positionInCompany || '');
                    } else {
                        alert('Failed to fetch profile data');
                        navigate('/mainapp');
                    }
                } else {
                    // If no ID or initial profile, go back to main app
                    alert('No profile selected for editing');
                    navigate('/mainapp');
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                alert('An error occurred while loading profile data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [id, initialProfile, API_BASE_URL, navigate]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Basic client-side validation
        if (!fullName || !email) {
            alert("Full Name and Email are required.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Invalid email format.");
            return;
        }

        // Convert date strings to ISO format (YYYY-MM-DD) for consistency with MySQL DATE type
        const formatDate = (dateString: string) => {
            if (!dateString) return null; // Handle empty date strings
            return new Date(dateString).toISOString().split('T')[0];
        };

        const formData = {
            id: id, // Include the profile ID for update
            originalName: initialProfile?.name, // Include original name for reference
            fullName,
            email,
            residentStatus,
            gender,
            dateOfBirth: formatDate(dateOfBirth),
            nationality,
            countryOfResidence,
            otherNationalities,
            specifiedOtherNationalities,
            nationalIdNumber,
            nationalIdExpiry: formatDate(nationalIdExpiry),
            passportNumber,
            passportExpiry: formatDate(passportExpiry),
            address,
            state,
            city,
            zipCode,
            contactNumber,
            dialingCode,
            workType,
            industry,
            productTypeOffered,
            productOffered,
            companyName,
            positionInCompany
        };

        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/updateProfile/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                alert("Profile updated successfully!");
                // Construct a URL with query parameters instead of using state
                // This avoids issues with React Router state management
                const params = new URLSearchParams({
                    section: 'activeTracking',
                    refresh: 'true',
                    t: Date.now().toString()
                });
                
                // Use window.location for a clean navigation
                window.location.href = `/mainapp?${params.toString()}`;
                
                // Alternative approach with React Router
                // navigate('/mainapp', { 
                //     state: { 
                //         activeSection: 'activeTracking',
                //         refreshData: true,
                //         timestamp: Date.now()
                //     } 
                // });
            } else {
                alert(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred during submission. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50">
            <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
            <p className="mb-8 text-gray-600">Update the profile information below.</p>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl shadow-lg">
                    {/* Personal Information */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">FULL NAME</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter full name"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">EMAIL</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">RESIDENT STATUS</label>
                        <select
                            value={residentStatus}
                            onChange={(e) => setResidentStatus(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Resident Status</option>
                            <option value="citizen">Citizen</option>
                            <option value="resident">Resident</option>
                            <option value="non-resident">Non-Resident</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">GENDER</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">DATE OF BIRTH</label>
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">NATIONALITY</label>
                        <select
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Nationality</option>
                            {countries.map((country) => (
                                <option key={`nat-${country.code}`} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">COUNTRY OF RESIDENCE</label>
                        <select
                            value={countryOfResidence}
                            onChange={(e) => setCountryOfResidence(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Country of Residence</option>
                            {countries.map((country) => (
                                <option key={`res-${country.code}`} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">DO YOU HAVE OTHER NATIONALITIES?</label>
                        <div className="mt-1 flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="yes"
                                    checked={otherNationalities === true}
                                    onChange={() => setOtherNationalities(true)}
                                    className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="ml-2">Yes</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="no"
                                    checked={otherNationalities === false}
                                    onChange={() => setOtherNationalities(false)}
                                    className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="ml-2">No</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">SPECIFY OTHER NATIONALITIES (IF APPLICABLE)</label>
                        <select
                            value={specifiedOtherNationalities}
                            onChange={(e) => setSpecifiedOtherNationalities(e.target.value)}
                            disabled={!otherNationalities}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Select Other Nationalities</option>
                            {countries.map((country) => (
                                <option key={`other-${country.code}`} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">NATIONAL ID NUMBER</label>
                        <input
                            type="text"
                            value={nationalIdNumber}
                            onChange={(e) => setNationalIdNumber(e.target.value)}
                            placeholder="Enter National ID Number"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">NATIONAL ID EXPIRY</label>
                        <input
                            type="date"
                            value={nationalIdExpiry}
                            onChange={(e) => setNationalIdExpiry(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">PASSPORT NUMBER</label>
                        <input
                            type="text"
                            value={passportNumber}
                            onChange={(e) => setPassportNumber(e.target.value)}
                            placeholder="Enter Passport Number"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">PASSPORT EXPIRY</label>
                        <input
                            type="date"
                            value={passportExpiry}
                            onChange={(e) => setPassportExpiry(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Contact Information - Section Header */}
                    <div className="md:col-span-3 mt-6">
                        <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">ADDRESS</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter address"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">STATE</label>
                        <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            disabled={!countryOfResidence || states.length === 0}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Select State</option>
                            {states.map((stateName) => (
                                <option key={stateName} value={stateName}>
                                    {stateName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CITY</label>
                        <input 
                            type="text" 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)} 
                            placeholder="Enter city" 
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP CODE/POSTAL CODE</label>
                        <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="Enter zip code"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">DIALING CODE</label>
                        <input
                            type="text"
                            value={dialingCode}
                            onChange={(e) => setDialingCode(e.target.value)}
                            placeholder="e.g., +1"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CONTACT NUMBER</label>
                        <input
                            type="tel"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            placeholder="Enter phone number"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Profile Information - Section Header */}
                    <div className="md:col-span-3 mt-6">
                        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">WORK TYPE</label>
                        <select
                            value={workType}
                            onChange={(e) => setWorkType(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Work Type</option>
                            <option value="employee">Employee</option>
                            <option value="contractor">Contractor</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="business_owner">Business Owner</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">INDUSTRY</label>
                        <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Industry</option>
                            <option value="finance">Finance</option>
                            <option value="technology">Technology</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="retail">Retail</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">PRODUCT TYPE OFFERED TO CUSTOMER</label>
                        <select
                            value={productTypeOffered}
                            onChange={(e) => setProductTypeOffered(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Product Type</option>
                            <option value="goods">Physical Goods</option>
                            <option value="services">Services</option>
                            <option value="digital">Digital Products</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">PRODUCT OFFERED</label>
                        <input
                            type="text"
                            value={productOffered}
                            onChange={(e) => setProductOffered(e.target.value)}
                            placeholder="Enter Product Offered"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">COMPANY NAME</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Enter Company Name"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">POSITION IN COMPANY</label>
                        <input
                            type="text"
                            value={positionInCompany}
                            onChange={(e) => setPositionInCompany(e.target.value)}
                            placeholder="Enter Position in Company"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-3">
                        <div className="flex space-x-4">
                            <button 
                                type="submit" 
                                className="mt-4 px-6 py-2 bg-[#4A1D96] text-white rounded-lg hover:bg-[#3c177d] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                                        UPDATING...
                                    </>
                                ) : 'UPDATE PROFILE'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/mainapp', { state: { activeSection: 'insights' } })}
                                className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

export default EditProfile; 