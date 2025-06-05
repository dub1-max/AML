import React, { useState } from 'react';
import { Upload, FileText, ArrowRight, ArrowLeft, Eye, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getApiBaseUrl } from './config';
import { useNavigate } from 'react-router-dom';
import { getSortedCountries, statesByCountry } from './utils/countries';

function SelfLinkIndividualOB() {
    const API_BASE_URL = getApiBaseUrl();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Step management
    const [currentStep, setCurrentStep] = useState<'upload' | 'form'>('upload');
    
    // Image upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    
    // Form data - same as IndividualOB
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

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setSelectedFile(file);
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                alert('Please select an image file (JPG, PNG, etc.)');
            }
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            alert('Please drop an image file (JPG, PNG, etc.)');
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setExtractedData(null);
    };

    const analyzeImage = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch(`${API_BASE_URL}/analyze-document`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to analyze document');
            }

            const data = await response.json();
            setExtractedData(data);
            
            // Pre-fill form with extracted data
            if (data.fullName) setFullName(data.fullName);
            if (data.email) setEmail(data.email);
            if (data.dateOfBirth) setDateOfBirth(data.dateOfBirth);
            if (data.nationality) setNationality(data.nationality);
            if (data.countryOfResidence) setCountryOfResidence(data.countryOfResidence);
            if (data.nationalIdNumber) setNationalIdNumber(data.nationalIdNumber);
            if (data.nationalIdExpiry) setNationalIdExpiry(data.nationalIdExpiry);
            if (data.passportNumber) setPassportNumber(data.passportNumber);
            if (data.passportExpiry) setPassportExpiry(data.passportExpiry);
            if (data.address) setAddress(data.address);
            if (data.city) setCity(data.city);
            if (data.zipCode) setZipCode(data.zipCode);
            if (data.contactNumber) setContactNumber(data.contactNumber);
            
            alert('Document analyzed successfully! Please review and complete the form.');
            setCurrentStep('form');
        } catch (error) {
            console.error('Error analyzing document:', error);
            alert('Failed to analyze document. Please try again or fill the form manually.');
            setCurrentStep('form');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!fullName || !email) {
            alert("Full Name and Email are required.");
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Invalid email format.");
            return;
        }

        const formatDate = (dateString: string) => {
            if (!dateString) return null;
            return new Date(dateString).toISOString().split('T')[0];
        };

        const formData = {
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
            positionInCompany,
            // Include extracted data if available
            extractedData: extractedData
        };

        try {
            const response = await fetch(`${API_BASE_URL}/registerIndividualSelfLink`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                alert("Individual registration successful! Redirecting to Active Tracking.");
                
                // Reset form
                setCurrentStep('upload');
                removeFile();
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
                
                const params = new URLSearchParams({
                    section: 'activeTracking',
                    refresh: 'true',
                    t: Date.now().toString()
                });
                
                window.location.href = `/mainapp?${params.toString()}`;
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred during submission. Please try again.');
        }
    };

    return (
        <div className="p-8 bg-gray-50">
            {/* Progress indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-center space-x-8">
                    <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-purple-600' : 'text-green-600'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            currentStep === 'upload' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
                        }`}>
                            {currentStep === 'upload' ? '1' : '✓'}
                        </div>
                        <span className="font-medium">Upload Documents</span>
                    </div>
                    <ArrowRight className="text-gray-400" />
                    <div className={`flex items-center space-x-2 ${currentStep === 'form' ? 'text-purple-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            currentStep === 'form' ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                            2
                        </div>
                        <span className="font-medium">Complete Profile</span>
                    </div>
                </div>
            </div>

            {currentStep === 'upload' ? (
                /* Upload Step */
                <div>
                    <h1 className="text-3xl font-bold mb-6">Upload Your Documents</h1>
                    <p className="mb-8 text-gray-600">
                        Upload an image of your ID, passport, or other documents to automatically extract information.
                    </p>

                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        {!selectedFile ? (
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-500 transition-colors cursor-pointer"
                                onClick={() => document.getElementById('file-input')?.click()}
                            >
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Document</h3>
                                <p className="text-gray-600 mb-4">
                                    Drag and drop your document here, or click to browse
                                </p>
                                <p className="text-sm text-gray-500">
                                    Supported formats: JPG, PNG, PDF (max 10MB)
                                </p>
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Selected Document</h3>
                                    <button
                                        onClick={removeFile}
                                        className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Remove</span>
                                    </button>
                                </div>
                                
                                {previewUrl && (
                                    <div className="relative">
                                        <img
                                            src={previewUrl}
                                            alt="Document preview"
                                            className="max-w-full h-64 object-contain border rounded-lg"
                                        />
                                    </div>
                                )}
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <FileText className="w-4 h-4" />
                                        <span>{selectedFile.name}</span>
                                        <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        onClick={() => document.getElementById('file-input')?.click()}
                                        className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50"
                                    >
                                        Choose Different File
                                    </button>
                                    <div className="space-x-4">
                                        <button
                                            onClick={() => setCurrentStep('form')}
                                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                        >
                                            Skip Analysis
                                        </button>
                                        <button
                                            onClick={analyzeImage}
                                            disabled={isUploading}
                                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            {isUploading ? 'Analyzing...' : 'Analyze & Continue'}
                                        </button>
                                    </div>
                                </div>
                                
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Form Step - Same as IndividualOB but with back button */
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">Complete Individual Profile</h1>
                            <p className="text-gray-600">Review and complete the information below.</p>
                        </div>
                        <button
                            onClick={() => setCurrentStep('upload')}
                            className="flex items-center space-x-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Upload</span>
                        </button>
                    </div>

                    {extractedData && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                            <div className="flex items-center space-x-2 text-green-800">
                                <Eye className="w-5 h-5" />
                                <span className="font-medium">Document Analysis Complete</span>
                            </div>
                            <p className="text-green-700 mt-1">
                                We've pre-filled the form with extracted information. Please review and update as needed.
                            </p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl shadow-lg">
                        {/* Same form fields as IndividualOB */}
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

                        {/* Contact Information */}
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

                        {/* Profile Information */}
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
                            <button 
                                type="submit" 
                                className="mt-4 px-6 py-2 bg-[#4A1D96] text-white rounded-lg hover:bg-[#3c177d] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                            >
                                REGISTER
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default SelfLinkIndividualOB; 