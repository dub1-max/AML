// CompanyOB.tsx
import React from 'react';

function CompanyOB() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Company Onboarding</h1>
            <p>This is the Company Onboarding page. Add your content here.</p>
             {/*  Form, instructions, etc. would go here */}
            <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                    type="text"
                    id="companyName"
                    name="companyName"
                     className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">Registration Number</label>
                 <input
                    type="text"
                    id="registrationNumber"
                    name="registrationNumber"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
             <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Submit</button>
        </div>
    );
}

export default CompanyOB;