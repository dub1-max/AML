import React from 'react';

const ComplianceSection: React.FC = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-purple-700 mb-2">Compliance & Regulations</h2>
          <p className="text-lg text-gray-600 mb-12">Stay ahead of regulatory requirements in the UAE</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* National Oversight */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-purple-700 mb-4">National Oversight</h3>
            <p className="text-gray-600">
              The National Committee for Combating Money Laundering and the Financing of Terrorism and Illegal Organizations (NAMLCFTC) oversees the national risk assessment process.
            </p>
          </div>

          {/* New Regulations */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-purple-700 mb-4">New Regulations</h3>
            <p className="text-gray-600">
              As per the recent AML-CFT Act of Parliament, the UAE has introduced new regulations regarding digital ID for Customer Due Diligence (CDD).
            </p>
          </div>

          {/* Regulatory Framework */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-purple-700 mb-4">Regulatory Framework</h3>
            <p className="text-gray-600">
              Effective navigation and implementation of Anti-Money Laundering (AML) and Know Your Customer (KYC) compliance in the UAE, calls for the thorough understanding of the regulatory framework at hand.
            </p>
          </div>
        </div>

        {/* Consulting Service Section */}
        <div className="mt-16 bg-purple-700 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Consulting Service for Anti-Money Laundering</h3>
          <p className="max-w-3xl mx-auto">
            Utilize our anti money laundering consulting service to conduct a comprehensive risk assessment process and evaluate the potential threats of money laundering and terrorism financing to your business.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComplianceSection; 