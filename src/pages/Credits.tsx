import React, { useState, useEffect } from 'react';
import { CreditCard, Loader2, CreditCard as CreditCardIcon, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../AuthContext';
import Layout from '../components/Layout';
import { getApiBaseUrl } from '../config';

const API_BASE_URL = getApiBaseUrl();

// Add PayPal type declarations
declare global {
    interface Window {
        paypal: any;
    }
}

interface CreditsProps {}

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    profileLimit: number;
    isPopular: boolean;
    isActive: boolean;
}

const Credits: React.FC<CreditsProps> = () => {
    const { user } = useAuth();
    const [credits, setCredits] = useState<number>(0);
    const [loadingCredits, setLoadingCredits] = useState<boolean>(true);
    const [purchaseAmount, setPurchaseAmount] = useState<number>(100);
    const [processingPayment, setProcessingPayment] = useState<boolean>(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paypal' | 'card'>('paypal');
    
    // Subscription state
    const [loadingSubscription, setLoadingSubscription] = useState<boolean>(true);
    const [activeSubscription, setActiveSubscription] = useState<SubscriptionPlan | null>(null);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([
        {
            id: 'starter',
            name: 'Starter',
            price: 200,
            currency: 'AED',
            profileLimit: 100,
            isPopular: false,
            isActive: false
        },
        {
            id: 'essential',
            name: 'Essential',
            price: 500, 
            currency: 'AED',
            profileLimit: 250,
            isPopular: true,
            isActive: false
        },
        {
            id: 'business',
            name: 'Business',
            price: 1000,
            currency: 'AED',
            profileLimit: 500,
            isPopular: false,
            isActive: false
        },
        {
            id: 'corporate',
            name: 'Corporate',
            price: 1500,
            currency: 'AED',
            profileLimit: 750,
            isPopular: false,
            isActive: false
        }
    ]);
    
    // PayPal script loading state
    const [paypalReady, setPaypalReady] = useState<boolean>(false);
    const [paypalError, setPaypalError] = useState<string | null>(null);
    
    // Processing states
    const [purchasingSubscription, setPurchasingSubscription] = useState<boolean>(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);

    useEffect(() => {
        fetchCredits();
        fetchSubscription();
        
        // Load PayPal SDK
        const loadPayPalScript = () => {
            const script = document.createElement('script');
            script.src = "https://www.paypal.com/sdk/js?client-id=AW_r5mx6frqH8LQR7iXk6x8H9UYQpZ6KtUJlz9paGXi4P5DGQM4E-IZrYHPt4MxlG-jnIm6Pv-9HFf15&currency=USD";
            script.async = true;
            script.onload = () => {
                console.log('PayPal SDK loaded');
                setPaypalReady(true);
            };
            script.onerror = () => {
                console.error('PayPal SDK loading failed');
                setPaypalError('Failed to load PayPal. Please try again later.');
            };
            document.body.appendChild(script);
        };

        if (!document.querySelector('script[src*="paypal.com/sdk"]')) {
            loadPayPalScript();
        } else {
            setPaypalReady(true);
        }
    }, []);

    // Initialize PayPal buttons when SDK is ready
    useEffect(() => {
        if (paypalReady && window.paypal) {
            try {
                const paypalButtonsContainer = document.getElementById('paypal-button-container');
                
                // Clear container first
                if (paypalButtonsContainer) {
                    paypalButtonsContainer.innerHTML = '';
                    
                    window.paypal.Buttons({
                        createOrder: async (_data: any, actions: any) => {
                            // Set up the transaction details
                            return actions.order.create({
                                purchase_units: [{
                                    amount: {
                                        value: purchaseAmount.toString(),
                                        currency_code: 'USD'
                                    },
                                    description: `Purchase ${purchaseAmount} credits for AML Checker`
                                }]
                            });
                        },
                        onApprove: async (_data: any, actions: any) => {
                            setProcessingPayment(true);
                            // Capture the funds
                            const order = await actions.order.capture();
                            console.log('Payment successful', order);
                            
                            // Process the credit purchase on your server
                            try {
                                const response = await fetch(`${API_BASE_URL}/credits/purchase`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                        amount: purchaseAmount,
                                        paymentMethod: 'paypal',
                                        paymentId: order.id,
                                        paymentDetails: order
                                    }),
                                });
                                
                                if (!response.ok) {
                                    throw new Error('Failed to process credits purchase');
                                }
                                
                                const result = await response.json();
                                
                                // Update credits balance
                                setCredits(result.newBalance);
                                alert(`Successfully purchased ${purchaseAmount} credits!`);
                            } catch (error) {
                                console.error('Error processing credit purchase:', error);
                                alert('Payment was successful, but we had trouble adding credits to your account. Please contact support.');
                            } finally {
                                setProcessingPayment(false);
                            }
                        },
                        onError: (err: any) => {
                            console.error('PayPal error:', err);
                            setPaypalError('An error occurred with PayPal. Please try again.');
                        }
                    }).render('#paypal-button-container');
                }
            } catch (error) {
                console.error('Error rendering PayPal buttons:', error);
                setPaypalError('Error setting up PayPal payment. Please try again later.');
            }
        }
    }, [paypalReady, purchaseAmount]);

    const fetchCredits = async () => {
        try {
            setLoadingCredits(true);
            const response = await fetch(`${API_BASE_URL}/credits`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch credits: ${response.status}`);
            }

            const data = await response.json();
            
            if (typeof data.credits === 'number') {
                setCredits(data.credits);
            } else {
                console.error('Invalid credits data received:', data);
                const parsedCredits = parseInt(data.credits);
                setCredits(isNaN(parsedCredits) ? 0 : parsedCredits);
            }
        } catch (error) {
            console.error('Error fetching credits:', error);
            setCredits(0);
        } finally {
            setLoadingCredits(false);
        }
    };
    
    const fetchSubscription = async () => {
        try {
            setLoadingSubscription(true);
            // This endpoint doesn't exist yet - you'll need to implement it
            const response = await fetch(`${API_BASE_URL}/subscription`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.subscription) {
                    setActiveSubscription(data.subscription);
                    
                    // Update subscription plans to mark active plan
                    setSubscriptionPlans(prevPlans => 
                        prevPlans.map(plan => ({
                            ...plan,
                            isActive: plan.id === data.subscription.id
                        }))
                    );
                }
            } else {
                // If endpoint doesn't exist yet or no subscription, we'll show defaults
                console.log('No active subscription or endpoint not available');
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoadingSubscription(false);
        }
    };

    // Legacy method (will be replaced with PayPal)
    const handlePurchase = async () => {
        // This is kept for backward compatibility
        alert(`Please use PayPal to purchase credits`);
    };
    
    const handleSubscriptionSelect = async (planId: string) => {
        if (activeSubscription?.id === planId) {
            alert('You are already subscribed to this plan.');
            return;
        }
        
        const confirmed = window.confirm(`Are you sure you want to purchase the ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan? Your payment method will be charged accordingly.`);
        
        if (!confirmed) return;
        
        try {
            setPurchasingSubscription(true);
            setPurchaseError(null);
            
            // For demonstration, using manual payment
            const response = await fetch(`${API_BASE_URL}/api/subscription/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    planId: planId,
                    paymentMethod: 'manual',
                    paymentId: `manual_${Date.now()}`
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to purchase subscription');
            }
            
            const result = await response.json();
            
            // Set purchase success and refresh subscription data
            setPurchaseSuccess(true);
            setActiveSubscription(result.subscription);
            
            // Update subscription plans to mark active plan
            setSubscriptionPlans(prevPlans => 
                prevPlans.map(plan => ({
                    ...plan,
                    isActive: plan.id === planId
                }))
            );
            
            // Show success message
            alert(`Successfully subscribed to ${result.subscription.name} plan!`);
            
            // Refresh subscription data
            await fetchSubscription();
            
        } catch (error: any) {
            setPurchaseError(error.message || 'An error occurred while purchasing the subscription');
            alert(`Error: ${error.message || 'Failed to purchase subscription'}`);
        } finally {
            setPurchasingSubscription(false);
        }
    };

    const creditPackages = [
        { amount: 50, price: '$50', popular: false },
        { amount: 100, price: '$100', popular: true },
        { amount: 200, price: '$200', popular: false },
    ];

    return (
        <Layout
            activeSection="credits"
            credits={credits}
            loadingCredits={loadingCredits}
        >
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-6">Manage Credits</h1>
                
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center mb-4">
                        <CreditCard className="w-6 h-6 mr-3 text-purple-600" />
                        <h2 className="text-xl font-semibold">Current Balance</h2>
                    </div>
                    
                    {loadingCredits ? (
                        <div className="flex items-center mt-4">
                            <Loader2 className="w-5 h-5 animate-spin mr-2 text-purple-600" />
                            <span>Loading credits...</span>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <div className="text-4xl font-bold text-purple-700">{credits}</div>
                            <p className="text-gray-500 mt-1">Available credits</p>
                        </div>
                    )}
                </div>
                
                {/* Subscription Plans Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-2xl font-bold text-center text-purple-700 mb-2">Subscription Plans</h2>
                    <p className="text-center text-gray-600 mb-8">Choose the plan that fits your business needs</p>
                    
                    {loadingSubscription ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <span className="ml-2">Loading subscription details...</span>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {subscriptionPlans.map(plan => (
                                    <div 
                                        key={plan.id}
                                        className={`relative rounded-lg border ${plan.isActive ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-200'} 
                                        p-6 flex flex-col items-center transition-all hover:shadow-md`}
                                    >
                                        {plan.isActive && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-xs text-white px-3 py-1 rounded-full flex items-center">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                CURRENT PLAN
                                            </div>
                                        )}
                                        
                                        {plan.isPopular && !plan.isActive && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-xs text-yellow-800 px-3 py-1 rounded-full">
                                                Most Popular
                                            </div>
                                        )}
                                        
                                        <h3 className="text-xl font-bold text-gray-800 mb-6">{plan.name}</h3>
                                        
                                        <div className="text-5xl font-bold text-purple-600 mb-1">
                                            {plan.price}
                                            <span className="text-base font-normal text-gray-500 ml-1">{plan.currency}/Year</span>
                                        </div>
                                        
                                        <div className="text-gray-600 my-4">Up to {plan.profileLimit} profiles</div>
                                        <div className="text-xs text-gray-500 mb-6">All prices are exclusive of VAT</div>
                                        
                                        <button
                                            onClick={() => handleSubscriptionSelect(plan.id)}
                                            className={`px-6 py-2 rounded-md transition-colors
                                                ${plan.isActive 
                                                    ? 'bg-gray-200 text-gray-500 cursor-default' 
                                                    : purchasingSubscription && plan.id === activeSubscription?.id
                                                        ? 'bg-gray-300 text-gray-500 cursor-wait'
                                                        : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                                            disabled={plan.isActive || purchasingSubscription}
                                        >
                                            {plan.isActive 
                                                ? 'Current Plan' 
                                                : purchasingSubscription && plan.id === activeSubscription?.id
                                                    ? (
                                                        <div className="flex items-center justify-center">
                                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                            Processing...
                                                        </div>
                                                    )
                                                    : 'Get Started'
                                            }
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            {purchaseError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
                                    <p className="font-semibold">Error!</p>
                                    <p>{purchaseError}</p>
                                </div>
                            )}
                            
                            {purchaseSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-6">
                                    <p className="font-semibold">Success!</p>
                                    <p>Your subscription has been updated successfully.</p>
                                </div>
                            )}
                            
                            <div className="text-center mt-10">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Need something custom?</h3>
                                <button 
                                    onClick={() => alert('Contact sales feature will be implemented in a future update.')}
                                    className="border border-purple-600 text-purple-700 hover:bg-purple-50 py-2 px-6 rounded-md transition-colors"
                                >
                                    Talk to Sales
                                </button>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Purchase Credits</h2>
                    
                    {/* Credit packages */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {creditPackages.map((pkg) => (
                            <div 
                                key={pkg.amount}
                                onClick={() => setPurchaseAmount(pkg.amount)}
                                className={`border ${purchaseAmount === pkg.amount ? 'border-purple-500 bg-purple-50' : 'border-gray-200'} 
                                    rounded-lg p-4 cursor-pointer relative transition-all hover:shadow-md`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-xs text-yellow-800 px-2 py-0.5 rounded-full">
                                        POPULAR
                                    </div>
                                )}
                                <div className="text-center">
                                    <div className="text-lg font-bold">{pkg.amount} Credits</div>
                                    <div className="text-2xl font-bold text-purple-600 mt-2">{pkg.price}</div>
                                    <div className="text-xs text-gray-500 mt-1">USD</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Custom amount */}
                    <div className="mb-6">
                        <label htmlFor="creditAmount" className="block text-sm font-medium text-gray-700 mb-2">
                            Or enter custom amount:
                        </label>
                        <input
                            type="number"
                            id="creditAmount"
                            value={purchaseAmount}
                            onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                            min="10"
                            step="10"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Payment method selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Payment Method
                        </label>
                        <div className="flex space-x-4">
                            <div 
                                className={`border rounded-lg p-4 flex items-center cursor-pointer transition-all ${selectedPaymentMethod === 'paypal' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                                onClick={() => setSelectedPaymentMethod('paypal')}
                            >
                                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6 mr-2" />
                                <span>PayPal</span>
                            </div>
                            <div 
                                className={`border rounded-lg p-4 flex items-center cursor-pointer transition-all ${selectedPaymentMethod === 'card' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                                onClick={() => { alert('Credit card payments coming soon!'); }}
                            >
                                <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
                                <span>Credit Card (Coming Soon)</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* PayPal button container */}
                    {selectedPaymentMethod === 'paypal' && (
                        <div className="mb-4">
                            {paypalError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
                                    {paypalError}
                                </div>
                            )}
                            
                            {!paypalReady && !paypalError && (
                                <div className="flex justify-center items-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                    <span className="ml-2">Loading PayPal...</span>
                                </div>
                            )}
                            
                            <div id="paypal-button-container" className="w-full"></div>
                        </div>
                    )}
                    
                    {selectedPaymentMethod === 'card' && (
                        <button
                            onClick={() => alert('Credit card payments coming soon!')}
                            disabled={true}
                            className="w-full bg-gray-400 text-white py-2 px-4 rounded-md transition duration-200 cursor-not-allowed"
                        >
                            Credit Card Payment (Coming Soon)
                        </button>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Credits; 