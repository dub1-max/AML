import React from 'react';
import { Shield, Database, Bell, Search, LineChart, Lock, User, Ban, Newspaper, CreditCard, Building } from 'lucide-react';

const Documentation: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 w-full bg-white bg-opacity-95 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <nav className="flex justify-between items-center py-5">
            <div className="logo">
              <h1 className="text-[1.8rem] font-bold text-[#5e35b1]">KYCSync</h1>
            </div>
            <div className="nav-links hidden md:block" id="navLinks">
              <ul className="flex space-x-8">
                <li><a href="#home" className="font-medium text-gray-700 hover:text-[#5e35b1] transition-all duration-300 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-[#5e35b1] after:transition-all after:duration-300 hover:after:w-full">Home</a></li>
                <li><a href="#features" className="font-medium text-gray-700 hover:text-[#5e35b1] transition-all duration-300 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-[#5e35b1] after:transition-all after:duration-300 hover:after:w-full">Features</a></li>
                <li><a href="#compliance" className="font-medium text-gray-700 hover:text-[#5e35b1] transition-all duration-300 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-[#5e35b1] after:transition-all after:duration-300 hover:after:w-full">Compliance</a></li>
                <li><a href="#solutions" className="font-medium text-gray-700 hover:text-[#5e35b1] transition-all duration-300 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-[#5e35b1] after:transition-all after:duration-300 hover:after:w-full">Solutions</a></li>
                <li><a href="#pricing" className="font-medium text-gray-700 hover:text-[#5e35b1] transition-all duration-300 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-[#5e35b1] after:transition-all after:duration-300 hover:after:w-full">Pricing</a></li>
                <li><a href="#contact" className="font-medium text-gray-700 hover:text-[#5e35b1] transition-all duration-300 relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-[#5e35b1] after:transition-all after:duration-300 hover:after:w-full">Contact</a></li>
              </ul>
            </div>
            <button className="md:hidden text-2xl text-gray-700" id="openMenu">
              <i className="fas fa-bars"></i>
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center bg-gradient-to-r from-[#f5f5f5] from-60% to-[#e1d9f0] to-40% pt-[100px] relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 flex items-center justify-between">
          <div className="flex-1 pr-[50px]">
            <h1 className="text-[3rem] text-[#5e35b1] mb-5 leading-tight">
              Advanced KYC/AML Compliance Solution
            </h1>
            <p className="text-[1.2rem] text-[#757575] mb-8">
              Screen your customers with speed and accuracy in an increasingly complex regulatory environment.
            </p>
            <div className="flex gap-5">
              <a href="#contact" className="inline-block px-8 py-3 bg-[#5e35b1] text-white rounded-lg font-semibold hover:bg-[#7e57c2] hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300">
                Request Demo
              </a>
              <a href="#features" className="inline-block px-8 py-3 bg-transparent text-[#5e35b1] border-2 border-[#5e35b1] rounded-lg font-semibold hover:bg-[#5e35b1] hover:text-white hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300">
                Learn More
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center">
            <img src="/images/hero-image.svg" alt="AML Checker Dashboard" className="w-full" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[2.5rem] font-bold text-[#5e35b1] mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-[70px] after:h-[3px] after:bg-[#b39ddb]">About KYCSync</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-2/3">
              <p className="text-[#444] mb-6">
                In today's increasingly complex regulatory environment, it's more important than ever to ensure that your business is fully compliant with UAE laws and regulations. KYCSync understands the challenges that businesses in the UAE face when it comes to KYC and AML compliance, that's why we're here to help.
              </p>
              <p className="text-[#444]">
                By leveraging the latest digital onboarding solutions, we provide a streamlined customer journey that simplifies the compliance onboarding process for your business. Making it as easy as possible to carry out AML/KYC and IDV checks, so you can focus on running your business smoothly.
              </p>
            </div>
            <div className="md:w-1/3 grid grid-cols-1 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)] text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
                <h3 className="text-[2rem] font-bold text-[#5e35b1] mb-2">1200+</h3>
                <p className="text-[#444]">Satisfied Clients</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)] text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
                <h3 className="text-[2rem] font-bold text-[#5e35b1] mb-2">100+</h3>
                <p className="text-[#444]">Sanction Lists</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)] text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
                <h3 className="text-[2rem] font-bold text-[#5e35b1] mb-2">24/7</h3>
                <p className="text-[#444]">Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#f5f5f5]">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[2.5rem] font-bold text-[#5e35b1] mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-[70px] after:h-[3px] after:bg-[#b39ddb]">Key Features</h2>
            <p className="text-[1.1rem] text-[#757575] max-w-[700px] mx-auto">
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

      {/* Compliance Section */}
      <section id="compliance" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[2.5rem] font-bold text-[#5e35b1] mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-[70px] after:h-[3px] after:bg-[#b39ddb]">Compliance & Regulations</h2>
            <p className="text-[1.1rem] text-[#757575] max-w-[700px] mx-auto">
              Stay ahead of regulatory requirements in the UAE
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#f5f5f5] p-6 rounded-lg hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
              <h3 className="text-xl font-semibold text-[#5e35b1] mb-4">National Oversight</h3>
              <p className="text-[#444]">
                The National Committee for Combating Money Laundering and the Financing of Terrorism and Illegal Organizations (NAMLCFTC) oversees the national risk assessment process.
              </p>
            </div>
            <div className="bg-[#f5f5f5] p-6 rounded-lg hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
              <h3 className="text-xl font-semibold text-[#5e35b1] mb-4">New Regulations</h3>
              <p className="text-[#444]">
                As per the recent AML-CFT Act of Parliament, the UAE has introduced new regulations regarding digital ID for Customer Due Diligence (CDD).
              </p>
            </div>
            <div className="bg-[#f5f5f5] p-6 rounded-lg hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
              <h3 className="text-xl font-semibold text-[#5e35b1] mb-4">Regulatory Framework</h3>
              <p className="text-[#444]">
                Effective navigation and implementation of Anti-Money Laundering (AML) and Know Your Customer (KYC) compliance in the UAE, calls for the thorough understanding of the regulatory framework at hand.
              </p>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold text-[#5e35b1] mb-4">Consulting Service for Anti-Money Laundering</h3>
            <p className="text-[#444] mb-6 max-w-3xl mx-auto">
              Utilize our anti money laundering consulting service to conduct a comprehensive risk assessment process and evaluate the potential threats of money laundering and terrorism financing to your business.
            </p>
            <a href="#contact" className="inline-block px-8 py-3 bg-[#5e35b1] text-white rounded-lg font-semibold hover:bg-[#7e57c2] hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300">
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-[#f5f5f5]">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[2.5rem] font-bold text-[#5e35b1] mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-[70px] after:h-[3px] after:bg-[#b39ddb]">Our Solutions</h2>
            <p className="text-[1.1rem] text-[#757575] max-w-[700px] mx-auto">
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
      <section id="pricing" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[2.5rem] font-bold text-[#5e35b1] mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-[70px] after:h-[3px] after:bg-[#b39ddb]">Subscription Plans</h2>
            <p className="text-[1.1rem] text-[#757575] max-w-[700px] mx-auto">
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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[#f5f5f5]">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[2.5rem] font-bold text-[#5e35b1] mb-4 relative inline-block after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-[70px] after:h-[3px] after:bg-[#b39ddb]">Contact Us</h2>
            <p className="text-[1.1rem] text-[#757575] max-w-[700px] mx-auto">
              Get in touch with our team to learn more about our solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <i className="fas fa-map-marker-alt text-2xl text-[#5e35b1]"></i>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Address</h3>
                    <p className="text-[#444]">Dubai, United Arab Emirates</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <i className="fas fa-envelope text-2xl text-[#5e35b1]"></i>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Email</h3>
                    <p className="text-[#444]">info@kycsync.com</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <i className="fas fa-phone text-2xl text-[#5e35b1]"></i>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Phone</h3>
                    <p className="text-[#444]">+971 4 123 4567</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)]">
              <form id="contactForm" className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-[#444] mb-2">Name</label>
                  <input type="text" id="name" className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#5e35b1] transition-all duration-300" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-[#444] mb-2">Email</label>
                  <input type="email" id="email" className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#5e35b1] transition-all duration-300" required />
                </div>
                <div>
                  <label htmlFor="company" className="block text-[#444] mb-2">Company</label>
                  <input type="text" id="company" className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#5e35b1] transition-all duration-300" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-[#444] mb-2">Message</label>
                  <textarea id="message" rows={4} className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#5e35b1] transition-all duration-300" required></textarea>
                </div>
                <button type="submit" className="w-full bg-[#5e35b1] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#7e57c2] hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-[#5e35b1] text-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-[2.5rem] font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Stay updated with the latest news and updates about KYC/AML compliance
            </p>
          </div>
          <form id="newsletterForm" className="max-w-md mx-auto flex">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-l-lg focus:outline-none" required />
            <button type="submit" className="bg-[#333] text-white px-6 py-3 rounded-r-lg hover:bg-[#444] transition-all duration-300">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#333] text-white pt-20">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">KYCSync</h2>
              <p className="text-[#aaa]">
                Advanced KYC/AML compliance solutions for businesses in the UAE.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-[40px] after:h-[2px] after:bg-[#5e35b1]">Quick Links</h3>
              <ul className="space-y-2 mt-6">
                <li><a href="#home" className="text-[#aaa] hover:text-white transition-all duration-300">Home</a></li>
                <li><a href="#features" className="text-[#aaa] hover:text-white transition-all duration-300">Features</a></li>
                <li><a href="#solutions" className="text-[#aaa] hover:text-white transition-all duration-300">Solutions</a></li>
                <li><a href="#pricing" className="text-[#aaa] hover:text-white transition-all duration-300">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-[40px] after:h-[2px] after:bg-[#5e35b1]">Solutions</h3>
              <ul className="space-y-2 mt-6">
                <li><a href="#solutions" className="text-[#aaa] hover:text-white transition-all duration-300">PEP Check</a></li>
                <li><a href="#solutions" className="text-[#aaa] hover:text-white transition-all duration-300">Sanctions Check</a></li>
                <li><a href="#solutions" className="text-[#aaa] hover:text-white transition-all duration-300">Adverse Media</a></li>
                <li><a href="#solutions" className="text-[#aaa] hover:text-white transition-all duration-300">ID Verification</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-[40px] after:h-[2px] after:bg-[#5e35b1]">Connect With Us</h3>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="w-10 h-10 bg-[#444] rounded-full flex items-center justify-center hover:bg-[#5e35b1] transition-all duration-300">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-[#444] rounded-full flex items-center justify-center hover:bg-[#5e35b1] transition-all duration-300">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-[#444] rounded-full flex items-center justify-center hover:bg-[#5e35b1] transition-all duration-300">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#444] py-6 text-center">
            <p className="text-[#aaa]">
              © {new Date().getFullYear()} KYCSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button id="backToTop" className="fixed bottom-8 right-8 w-12 h-12 bg-[#5e35b1] text-white rounded-full flex items-center justify-center opacity-0 invisible transition-all duration-300 hover:bg-[#7e57c2] hover:-translate-y-1">
        <i className="fas fa-arrow-up"></i>
      </button>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
    <div className="text-[#5e35b1] mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-[#333] mb-2">{title}</h3>
    <p className="text-[#444]">{description}</p>
  </div>
);

interface SolutionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
    <div className="text-[#5e35b1] mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-[#333] mb-2">{title}</h3>
    <p className="text-[#444]">{description}</p>
  </div>
);

interface PricingCardProps {
  title: string;
  price: string;
  profiles: string;
  isPopular: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, price, profiles, isPopular }) => (
  <div className={`bg-white p-8 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)] relative ${isPopular ? 'border-2 border-[#5e35b1]' : ''}`}>
    {isPopular && (
      <div className="absolute top-0 right-0 bg-[#5e35b1] text-white px-4 py-1 rounded-bl-lg rounded-tr-lg">
        Most Popular
      </div>
    )}
    <h3 className="text-2xl font-bold text-[#333] mb-4">{title}</h3>
    <div className="text-4xl font-bold text-[#333] mb-2">
      {price}<span className="text-lg text-[#757575]">AED/Year</span>
    </div>
    <p className="text-[#444] mb-4">Up to {profiles} profiles</p>
    <p className="text-sm text-[#757575] mb-6">All prices are exclusive of VAT</p>
    <a href="#contact" className="block w-full bg-[#5e35b1] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#7e57c2] hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300 text-center">
      Get Started
    </a>
  </div>
);

export default Documentation; 