import React from 'react';
import { Shield, Database, Bell, Search, LineChart, Lock, User, Ban, Newspaper, CreditCard, Building } from 'lucide-react';

const Documentation: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Advanced KYC/AML Compliance Solution
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Screen your customers with speed and accuracy in an increasingly complex regulatory environment.
              </p>
              <div className="flex gap-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                  Request Demo
                </button>
                <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition">
                  Learn More
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img src="/images/hero-image.svg" alt="AML Checker Dashboard" className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600">
              Our comprehensive solution offers everything you need for regulatory compliance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Seal Verification"
              description="The KYCSync Verified Seal helps you showcase the credibility of your business by highlighting that you are fulfilling AML/KYC regulations."
            />
            <FeatureCard
              icon={<Database className="w-8 h-8" />}
              title="Risk Assessment"
              description="Comprehensive individual and business risk assessment to identify potential compliance issues."
            />
            <FeatureCard
              icon={<Bell className="w-8 h-8" />}
              title="Ongoing Monitoring"
              description="Continuous screening and monitoring with alerts for any changes in customer status or risk profile."
            />
            <FeatureCard
              icon={<Search className="w-8 h-8" />}
              title="Global Screening"
              description="Access to comprehensive global database for thorough screening across multiple jurisdictions."
            />
            <FeatureCard
              icon={<LineChart className="w-8 h-8" />}
              title="Analytics Dashboard"
              description="Powerful visualization tools to help you monitor compliance status and identify trends or issues."
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8" />}
              title="Secure Data Storage"
              description="Enterprise-grade security to protect your sensitive customer information with encrypted storage."
            />
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Solutions</h2>
            <p className="text-xl text-gray-600">
              Stay ahead of regulatory compliance with our diverse solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SolutionCard
              icon={<User className="w-8 h-8" />}
              title="PEP Check"
              description="Gain access to a vast array of comprehensive data sets, derived from government sources, enabling you to easily detect politically exposed persons and any closely associated individuals."
            />
            <SolutionCard
              icon={<Ban className="w-8 h-8" />}
              title="Sanctions Check"
              description="Conduct rigorous screenings against updated government regulatory and law enforcement watchlists, along with over 100 International and National Sanctions lists."
            />
            <SolutionCard
              icon={<Newspaper className="w-8 h-8" />}
              title="Adverse Media Check"
              description="Access an AI-driven analysis of news related to financial crime and money laundering to facilitate due diligence efforts."
            />
            <SolutionCard
              icon={<CreditCard className="w-8 h-8" />}
              title="ID Verification"
              description="Using our ID and FaceMatch checking measures you are able to confirm if a person is really who they say they are."
            />
            <SolutionCard
              icon={<Building className="w-8 h-8" />}
              title="Know Your Business Check"
              description="Uncover the relationships between individuals and business entities using our powerful Know Your Business (KYB) solution."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscription Plans</h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              title="Starter"
              price="200"
              profiles="100"
              isPopular={false}
            />
            <PricingCard
              title="Essential"
              price="500"
              profiles="250"
              isPopular={true}
            />
            <PricingCard
              title="Business"
              price="1,000"
              profiles="500"
              isPopular={false}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
    <div className="text-blue-600 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

interface SolutionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ icon, title, description }) => (
  <div className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition">
    <div className="text-blue-600 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

interface PricingCardProps {
  title: string;
  price: string;
  profiles: string;
  isPopular: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, price, profiles, isPopular }) => (
  <div className={`bg-white p-8 rounded-lg shadow-md relative ${isPopular ? 'border-2 border-blue-600' : ''}`}>
    {isPopular && (
      <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg">
        Most Popular
      </div>
    )}
    <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
    <div className="text-4xl font-bold text-gray-900 mb-2">
      {price}<span className="text-lg text-gray-600">AED/Year</span>
    </div>
    <p className="text-gray-600 mb-4">Up to {profiles} profiles</p>
    <p className="text-sm text-gray-500 mb-6">All prices are exclusive of VAT</p>
    <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
      Get Started
    </button>
  </div>
);

export default Documentation; 