import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { getApiBaseUrl } from './config';
import { getSortedCountries, statesByCountry } from './utils/countries';
import ConfirmationDialog from './components/ui/ConfirmationDialog';

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

function CompanyOB() {
  const navigate = useNavigate();
  const API_BASE_URL = getApiBaseUrl();
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
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  // Handle confirmation dialog
  const confirmAction = (action: () => void, message: string) => {
    setPendingAction(() => action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
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
    };

    try {
      const response = await fetch(`${API_BASE_URL}/registerCompany`, {
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
      
      // Redirect to Active Tracking tab using URL parameters instead of state
      const params = new URLSearchParams({
        section: 'activeTracking',
        refresh: 'true',
        t: Date.now().toString()
      });
      
      // Use window.location for a clean navigation
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

  // Get sorted countries list
  const countries = getSortedCountries();
  
  // Get states for selected country
  const states = formData.country ? statesByCountry[formData.country] || [] : [];

  // Note: We're using the statesByCountry from the imported utils

  return (
    <div className="p-8 bg-gray-50">
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title="Confirmation Required"
        description="Are you sure you want to proceed? Any unsaved changes will be lost."
      />
      
      <h1 className="text-3xl font-bold mb-6">Register Company Profile</h1>
      <p className="mb-8 text-gray-600">
        Complete the form below to register your company profile.
      </p>
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
        <div className="md:col-span-2 flex space-x-4">
          <button
            type="button"
            onClick={() => confirmAction(() => navigate('/mainapp'), "Are you sure you want to go back? All entered data will be lost.")}
            disabled={loading}
            className="mt-4 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            BACK
          </button>
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
  );
}

export default CompanyOB;