import React, { useState } from 'react';
import { Upload, FileText, ArrowRight, ArrowLeft, Eye, X, File } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getApiBaseUrl } from './config';
import { useNavigate } from 'react-router-dom';
import { getSortedCountries, statesByCountry } from './utils/countries';

interface FormData {
  companyName: string;
  registrationNumber: string;
  companyType: string;
  incorporationDate: string;
  businessNature: string;
  industrySector: string;
  annualTurnover: string;
  employeeCount: string;
  websiteUrl: string;
  registeredAddress: string;
  operatingAddress: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  taxNumber: string;
  regulatoryLicenses: string;
}

function SelfLinkCompanyOB() {
    const API_BASE_URL = getApiBaseUrl();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Step management
    const [currentStep, setCurrentStep] = useState<'upload' | 'form'>('upload');
    
    // Image upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPdf, setIsPdf] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    
    // Form state
    const [formData, setFormData] = useState<FormData>({
        companyName: "",
        registrationNumber: "",
        companyType: "",
        incorporationDate: "",
        businessNature: "",
        industrySector: "",
        annualTurnover: "",
        employeeCount: "",
        websiteUrl: "",
        registeredAddress: "",
        operatingAddress: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",
        contactPersonName: "",
        contactEmail: "",
        contactPhone: "",
        taxNumber: "",
        regulatoryLicenses: "",
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get sorted countries list
    const countries = getSortedCountries();
    
    // Get states for selected country
    const states = formData.country ? statesByCountry[formData.country] || [] : [];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                setSelectedFile(file);
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                setIsPdf(file.type === 'application/pdf');
            } else {
                alert('Please select an image or PDF file');
            }
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setIsPdf(file.type === 'application/pdf');
        } else {
            alert('Please drop an image or PDF file');
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
        setIsPdf(false);
    };

    const analyzeImage = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('document', selectedFile);
        uploadFormData.append('documentType', isPdf ? 'pdf' : 'image');

        try {
            const response = await fetch(`${API_BASE_URL}/analyze-company-document`, {
                method: 'POST',
                body: uploadFormData,
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to analyze document');
            }

            const data = await response.json();
            console.log("Received extracted company data:", data);
            setExtractedData(data);
            
            // Track which fields were successfully extracted
            const extractedFields = [];
            
            // Pre-fill form with extracted data
            const updatedFormData = { ...formData };
            
            if (data.companyName) {
                updatedFormData.companyName = data.companyName;
                extractedFields.push('Company Name');
            }
            if (data.registrationNumber) {
                updatedFormData.registrationNumber = data.registrationNumber;
                extractedFields.push('Registration Number');
            }
            if (data.incorporationDate) {
                updatedFormData.incorporationDate = data.incorporationDate;
                extractedFields.push('Incorporation Date');
            }
            if (data.businessNature) {
                updatedFormData.businessNature = data.businessNature;
                extractedFields.push('Business Nature');
            }
            if (data.registeredAddress) {
                updatedFormData.registeredAddress = data.registeredAddress;
                extractedFields.push('Registered Address');
            }
            if (data.city) {
                updatedFormData.city = data.city;
                extractedFields.push('City');
            }
            if (data.postalCode) {
                updatedFormData.postalCode = data.postalCode;
                extractedFields.push('Postal Code');
            }
            if (data.contactEmail) {
                updatedFormData.contactEmail = data.contactEmail;
                extractedFields.push('Contact Email');
            }
            if (data.contactPhone) {
                updatedFormData.contactPhone = data.contactPhone;
                extractedFields.push('Contact Phone');
            }
            if (data.taxNumber) {
                updatedFormData.taxNumber = data.taxNumber;
                extractedFields.push('Tax Number');
            }
            
            setFormData(updatedFormData);
            
            if (extractedFields.length > 0) {
                alert(`Document analyzed successfully! Extracted fields: ${extractedFields.join(', ')}.\n\nPlease review and complete any missing information.`);
            } else {
                alert('Document processed, but no fields could be automatically extracted. Please fill the form manually.');
            }
            
            setCurrentStep('form');
        } catch (error) {
            console.error('Error analyzing document:', error);
            alert('Failed to analyze document. Please try again or fill the form manually.');
            setCurrentStep('form');
        } finally {
            setIsUploading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        
        // Reset state when country changes
        if (name === 'country') {
            setFormData(prev => ({...prev, state: ''}));
        }
    };

    const formatDate = (dateString: string): string | null => {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.warn("Invalid date string:", dateString);
                return null;
            }
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error("Date formatting error", error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formattedFormData = {
            ...formData,
            incorporationDate: formatDate(formData.incorporationDate),
            // Include extracted data if available
            extractedData: extractedData
        };

        try {
            const response = await fetch(`${API_BASE_URL}/registerCompanySelfLink`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify(formattedFormData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            alert("Company registration successful! Redirecting to Active Tracking.");
            
            // Reset form
            setCurrentStep('upload');
            removeFile();
            setFormData({
                companyName: "",
                registrationNumber: "",
                companyType: "",
                incorporationDate: "",
                businessNature: "",
                industrySector: "",
                annualTurnover: "",
                employeeCount: "",
                websiteUrl: "",
                registeredAddress: "",
                operatingAddress: "",
                country: "",
                state: "",
                city: "",
                postalCode: "",
                contactPersonName: "",
                contactEmail: "",
                contactPhone: "",
                taxNumber: "",
                regulatoryLicenses: "",
            });
            
            const params = new URLSearchParams({
                section: 'activeTracking',
                refresh: 'true',
                t: Date.now().toString()
            });
            
            window.location.href = `/mainapp?${params.toString()}`;
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || "An unexpected error occurred");
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
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
                    <h1 className="text-3xl font-bold mb-6">Upload Company Documents</h1>
                    <p className="mb-8 text-gray-600">
                        Upload an image or PDF of your business registration, incorporation certificate, or other company documents to automatically extract information.
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
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Company Document</h3>
                                <p className="text-gray-600 mb-4">
                                    Drag and drop your company document here, or click to browse
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
                                        {isPdf ? (
                                            <div className="flex flex-col items-center border rounded-lg p-4 bg-gray-50">
                                                <File className="w-16 h-16 text-red-500 mb-2" />
                                                <p className="text-sm font-medium">PDF Document</p>
                                                <a 
                                                    href={previewUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="mt-2 text-blue-600 hover:underline text-sm"
                                                >
                                                    View PDF
                                                </a>
                                                <object
                                                    data={previewUrl}
                                                    type="application/pdf"
                                                    width="100%"
                                                    height="300px"
                                                    className="mt-4 border rounded"
                                                >
                                                    <p>Your browser does not support PDF preview.</p>
                                                </object>
                                            </div>
                                        ) : (
                                            <img
                                                src={previewUrl}
                                                alt="Document preview"
                                                className="max-w-full h-64 object-contain border rounded-lg"
                                            />
                                        )}
                                    </div>
                                )}
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        {isPdf ? (
                                            <FileText className="w-4 h-4 text-red-500" />
                                        ) : (
                                            <FileText className="w-4 h-4" />
                                        )}
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
                /* Form Step - Same as CompanyOB but with back button */
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">Complete Company Profile</h1>
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
                    
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-lg"
                    >
                        {/* Company Information */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                COMPANY NAME
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="Enter company name"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                REGISTRATION NUMBER
                            </label>
                            <input
                                type="text"
                                name="registrationNumber"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                placeholder="Enter registration number"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                COMPANY TYPE
                            </label>
                            <select
                                name="companyType"
                                value={formData.companyType}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Select company type</option>
                                <option value="llc">LLC</option>
                                <option value="corporation">Corporation</option>
                                <option value="partnership">Partnership</option>
                                <option value="sole_proprietorship">Sole Proprietorship</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                INCORPORATION DATE
                            </label>
                            <input
                                type="date"
                                name="incorporationDate"
                                value={formData.incorporationDate}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        {/* Business Details */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                BUSINESS NATURE
                            </label>
                            <input
                                type="text"
                                name="businessNature"
                                value={formData.businessNature}
                                onChange={handleChange}
                                placeholder="Enter nature of business"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                INDUSTRY SECTOR
                            </label>
                            <select
                                name="industrySector"
                                value={formData.industrySector}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Select industry sector</option>
                                <option value="technology">Technology</option>
                                <option value="finance">Finance</option>
                                <option value="healthcare">Healthcare</option>
                                <option value="retail">Retail</option>
                                <option value="manufacturing">Manufacturing</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                ANNUAL TURNOVER
                            </label>
                            <input
                                type="number"
                                name="annualTurnover"
                                value={formData.annualTurnover}
                                onChange={handleChange}
                                placeholder="Enter annual turnover"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                NUMBER OF EMPLOYEES
                            </label>
                            <input
                                type="number"
                                name="employeeCount"
                                value={formData.employeeCount}
                                onChange={handleChange}
                                placeholder="Enter number of employees"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        {/* Contact Information */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                WEBSITE URL
                            </label>
                            <input
                                type="url"
                                name="websiteUrl"
                                value={formData.websiteUrl}
                                onChange={handleChange}
                                placeholder="Enter website URL"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                REGISTERED ADDRESS
                            </label>
                            <input
                                type="text"
                                name="registeredAddress"
                                value={formData.registeredAddress}
                                onChange={handleChange}
                                placeholder="Enter registered address"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                OPERATING ADDRESS
                            </label>
                            <input
                                type="text"
                                name="operatingAddress"
                                value={formData.operatingAddress}
                                onChange={handleChange}
                                placeholder="Enter operating address"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                COUNTRY
                            </label>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                STATE
                            </label>
                            <select
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                disabled={!formData.country || states.length === 0}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                CITY
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Enter city"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                POSTAL CODE
                            </label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                placeholder="Enter postal code"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        {/* Contact Person Details */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                CONTACT PERSON NAME
                            </label>
                            <input
                                type="text"
                                name="contactPersonName"
                                value={formData.contactPersonName}
                                onChange={handleChange}
                                placeholder="Enter contact person name"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                CONTACT EMAIL
                            </label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                placeholder="Enter contact email"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                CONTACT PHONE
                            </label>
                            <input
                                type="tel"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                placeholder="Enter contact phone"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                TAX NUMBER
                            </label>
                            <input
                                type="text"
                                name="taxNumber"
                                value={formData.taxNumber}
                                onChange={handleChange}
                                placeholder="Enter tax number"
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                REGULATORY LICENSES
                            </label>
                            <textarea
                                name="regulatoryLicenses"
                                value={formData.regulatoryLicenses}
                                onChange={handleChange}
                                placeholder="Enter regulatory licenses"
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-4 px-6 py-2 bg-[#4A1D96] text-white rounded-lg hover:bg-[#3c177d] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "REGISTER"}
                            </button>
                            {error && <p className="mt-2 text-red-500">{error}</p>}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default SelfLinkCompanyOB; 