import React, { useState, useEffect } from 'react';
import { CreditCard, Loader2, CreditCard as CreditCardIcon } from 'lucide-react';
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

const Credits: React.FC<CreditsProps> = () => {
    const { user } = useAuth();
    const [credits, setCredits] = useState<number>(0);
    const [loadingCredits, setLoadingCredits] = useState<boolean>(true);
    const [purchaseAmount, setPurchaseAmount] = useState<number>(100);
    const [processingPayment, setProcessingPayment] = useState<boolean>(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paypal' | 'card'>('paypal');
    
    // PayPal script loading state
    const [paypalReady, setPaypalReady] = useState<boolean>(false);
    const [paypalError, setPaypalError] = useState<string | null>(null);

    useEffect(() => {
        fetchCredits();
        
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

    // Legacy method (will be replaced with PayPal)
    const handlePurchase = async () => {
        // This is kept for backward compatibility
        alert(`Please use PayPal to purchase credits`);
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