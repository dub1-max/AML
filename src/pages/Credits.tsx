import React, { useState, useEffect } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import Layout from '../components/Layout';
import { getApiBaseUrl } from '../config';

const API_BASE_URL = getApiBaseUrl();

interface CreditsProps {}

const Credits: React.FC<CreditsProps> = () => {
    const { user } = useAuth();
    const [credits, setCredits] = useState<number>(0);
    const [loadingCredits, setLoadingCredits] = useState<boolean>(true);
    const [purchaseAmount, setPurchaseAmount] = useState<number>(100);

    useEffect(() => {
        fetchCredits();
    }, []);

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

    const handlePurchase = async () => {
        // Implement credit purchase logic here
        alert(`Purchase ${purchaseAmount} credits - To be implemented`);
    };

    return (
        <Layout
            activeSection="credits"
            credits={credits}
            loadingCredits={loadingCredits}
        >
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-4xl mx-auto pt-8 pb-12 px-6">
                    <header className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">Manage Credits</h1>
                    </header>
                    
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                    <CreditCard className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">Current Balance</h2>
                            </div>
                            
                            {loadingCredits ? (
                                <div className="flex items-center mt-4">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-purple-600" />
                                    <span className="text-gray-600">Loading credits...</span>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <div className="text-4xl font-bold text-purple-700">{credits}</div>
                                    <p className="text-gray-500 mt-1">Available credits</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Purchase Credits</h2>
                            
                            <div className="mb-6">
                                <label htmlFor="creditAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    id="creditAmount"
                                    value={purchaseAmount}
                                    onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                                    min="10"
                                    step="10"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                                />
                            </div>
                            
                            <button
                                onClick={handlePurchase}
                                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors shadow-sm font-medium"
                            >
                                Purchase Credits
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Credits; 