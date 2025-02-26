import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from './AuthContext'; // Import useAuth

function IndividualOB() {
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

    const { user } = useAuth(); // Use useAuth to get the user

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Basic client-side validation (mirror server-side)
        if (!fullName || !email) {
            alert("Full Name and Email are required."); // Or use a more sophisticated UI element
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
            fullName,
            email,
            residentStatus,
            gender,
            dateOfBirth: formatDate(dateOfBirth), // Format the date
            nationality,
            countryOfResidence,
            otherNationalities,
            specifiedOtherNationalities,
            nationalIdNumber,
            nationalIdExpiry: formatDate(nationalIdExpiry),  // Format the date
            passportNumber,
            passportExpiry: formatDate(passportExpiry), // Format the date
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
            const response = await fetch('http://localhost:3001/api/registerIndividual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include', // Ensure credentials are sent
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);  // Success message
                // Optionally reset the form here:
                setFullName('');
                setEmail('');
                setResidentStatus('');
                setGender('');
                setDateOfBirth('');
                setNationality('');
                setCountryOfResidence('');
                setOtherNationalities(false);
                setSpecifiedOtherNationalities('');
                setNationalIdNumber('');
                setNationalIdExpiry('');
                setPassportNumber('');
                setPassportExpiry('');
                setAddress('');
                setState('');
                setCity('');
                setZipCode('');
                setContactNumber('');
                setDialingCode('');
                setWorkType('');
                setIndustry('');
                setProductTypeOffered('');
                setProductOffered('');
                setCompanyName('');
                setPositionInCompany('');


            } else {
                alert(data.message || 'Registration failed'); // Show server error message
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred during submission. Please try again.'); // Network error
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Register Profile</h1>
            <p className="text-gray-700 mb-6">Hello user, once you press the SEND LINK button at the bottom, a link to this form will be sent to the following email:</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">FULL NAME</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter full name"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">EMAIL</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="residentStatus" className="block text-sm font-medium text-gray-700">RESIDENT STATUS</label>
                        <select
                            id="residentStatus"
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
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">GENDER</label>
                        <select
                            id="gender"
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
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">DATE OF BIRTH</label>
                        <div className="relative">
                            <input
                                type="date"
                                id="dateOfBirth"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10" // Added padding for icon
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">NATIONALITY</label>
                        <select
                            id="nationality"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Nationality</option>
                            {/* Example nationalities (add more as needed) */}
                            <option value="us">United States</option>
                            <option value="ca">Canada</option>
                            <option value="gb">United Kingdom</option>
                            <option value="fr">France</option>
                            <option value="de">Germany</option>
                            {/* Add more options here */}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="countryOfResidence" className="block text-sm font-medium text-gray-700">COUNTRY OF RESIDENCE</label>
                        <select
                            id="countryOfResidence"
                            value={countryOfResidence}
                            onChange={(e) => setCountryOfResidence(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Country of Residence</option>
                            {/* Example countries (add more as needed) */}
                            <option value="us">United States</option>
                            <option value="ca">Canada</option>
                            <option value="gb">United Kingdom</option>
                            <option value="fr">France</option>
                            <option value="de">Germany</option>
                            {/* Add more options here */}
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
                        <label htmlFor="specifiedOtherNationalities" className="block text-sm font-medium text-gray-700">SPECIFY OTHER NATIONALITIES (IF APPLICABLE)</label>
                        <select
                            id="specifiedOtherNationalities"
                            value={specifiedOtherNationalities}
                            onChange={(e) => setSpecifiedOtherNationalities(e.target.value)}
                            disabled={!otherNationalities}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Select Other Nationalities</option>
                            {/* Example nationalities */}
                            <option value="us">United States</option>
                            <option value="ca">Canada</option>
                            <option value="gb">United Kingdom</option>
                            <option value="fr">France</option>
                            <option value="de">Germany</option>

                            {/* Add more options as necessary */}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="nationalIdNumber" className="block text-sm font-medium text-gray-700">NATIONAL ID NUMBER</label>
                        <input
                            type="text"
                            id="nationalIdNumber"
                            value={nationalIdNumber}
                            onChange={(e) => setNationalIdNumber(e.target.value)}
                            placeholder="Enter National ID Number"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="nationalIdExpiry" className="block text-sm font-medium text-gray-700">NATIONAL ID EXPIRY</label>
                        <div className="relative">
                            <input
                                type="date"
                                id="nationalIdExpiry"
                                value={nationalIdExpiry}
                                onChange={(e) => setNationalIdExpiry(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10" // Added padding for icon
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700">PASSPORT NUMBER</label>
                        <input
                            type="text"
                            id="passportNumber"
                            value={passportNumber}
                            onChange={(e) => setPassportNumber(e.target.value)}
                            placeholder="Enter Passport Number"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="passportExpiry" className="block text-sm font-medium text-gray-700">PASSPORT EXPIRY</label>
                        <div className="relative">
                            <input
                                type="date"
                                id="passportExpiry"
                                value={passportExpiry}
                                onChange={(e) => setPassportExpiry(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10" // Added padding for icon

                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>

                    </div>
                </div>

                {/* Contact Information */}
                <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-900">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">ADDRESS</label>
                        <input
                            type="text"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter address"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">STATE</label>
                        <select
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select State</option>
                            {/* Add state options here */}
                            <option value="AL">Alabama</option>
                            <option value="AK">Alaska</option>
                            <option value="AZ">Arizona</option>
                            <option value="AR">Arkansas</option>
                            {/* ... add all US states ... */}
                            <option value="WY">Wyoming</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">CITY</label>
                        <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city" className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZIP CODE/POSTAL CODE</label>
                        <input
                            type="text"
                            id="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="Enter zip code"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="dialingCode" className="block text-sm font-medium text-gray-700">DIALING CODE</label>
                        <input
                            type="text"
                            id="dialingCode"
                            value={dialingCode}
                            onChange={(e) => setDialingCode(e.target.value)}
                            placeholder="e.g., +1"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">CONTACT NUMBER</label>
                        <input
                            type="tel"
                            id="contactNumber"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            placeholder="Enter phone number"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Profile Information */}
                <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-900">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="workType" className="block text-sm font-medium text-gray-700">WORK TYPE</label>
                        <select
                            id="workType"
                            value={workType}
                            onChange={(e) => setWorkType(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Work Type</option>
                            <option value="employee">Employee</option>
                            <option value="contractor">Contractor</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="business_owner">Business Owner</option>
                            {/* Add more options as needed */}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700">INDUSTRY</label>
                        <select
                            id="industry"
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
                            {/* Add more industry options here */}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="productTypeOffered" className="block text-sm font-medium text-gray-700">PRODUCT TYPE OFFERED TO CUSTOMER</label>
                        <select
                            id="productTypeOffered"
                            value={productTypeOffered}
                            onChange={(e) => setProductTypeOffered(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Product Type</option>
                            <option value="goods">Physical Goods</option>
                            <option value="services">Services</option>
                            <option value="digital">Digital Products</option>
                            {/* Add more product type options */}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="productOffered" className="block text-sm font-medium text-gray-700">PRODUCT OFFERED</label>
                        <input
                            type="text"
                            id="productOffered"
                            value={productOffered}
                            onChange={(e) => setProductOffered(e.target.value)}
                            placeholder="Enter Product Offered"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">COMPANY NAME</label>
                        <input
                            type="text"
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Enter Company Name"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="positionInCompany" className="block text-sm font-medium text-gray-700">POSITION IN COMPANY</label>
                        <input
                            type="text"
                            id="positionInCompany"
                            value={positionInCompany}
                            onChange={(e) => setPositionInCompany(e.target.value)}
                            placeholder="Enter Position in Company"
                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <button type="submit" className="mt-4 px-6 py-2 bg-[#4A1D96] text-white rounded-lg hover:bg-[#3c177d] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                    SEND LINK
                </button>
            </form>
        </div>
    );
}

export default IndividualOB;