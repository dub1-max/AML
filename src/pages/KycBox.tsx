import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Eye, Database } from 'lucide-react';

const KycBox: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-purple-800">KYCBOX</div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center font-medium text-purple-700 hover:text-purple-900 transition-colors"
          >
            Log In <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
          Powerful <span className="text-purple-700">KYC & AML</span> Solution
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced anti-money laundering screening with real-time watchlist monitoring and risk assessment
        </p>
        <div className="mt-10">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-purple-700 hover:bg-purple-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
            <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-lg text-purple-700 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Comprehensive Screening</h3>
            <p className="mt-2 text-gray-600">
              Screen individuals and entities against global watchlists, sanctions, and PEP databases.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
            <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-lg text-purple-700 mb-4">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Ongoing Monitoring</h3>
            <p className="mt-2 text-gray-600">
              Continuously monitor profiles for changes in risk status with real-time alerts.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
            <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-lg text-purple-700 mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Risk Assessment</h3>
            <p className="mt-2 text-gray-600">
              Automatically calculate risk scores based on comprehensive factors and thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16">
        <div className="bg-purple-700 rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Ready to strengthen your compliance?
          </h2>
          <p className="mt-4 text-purple-100 max-w-2xl mx-auto">
            Join thousands of businesses using our platform to meet regulatory requirements and prevent financial crime.
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-purple-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycBox; 