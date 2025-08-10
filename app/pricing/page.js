"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PricingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [apiKey, setApiKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Get the YouTube URL from query params if it exists
    const youtubeUrl = searchParams.get('url');
    // Get the redirect URL if it exists (for invalid API key errors)
    const redirectFrom = searchParams.get('redirect_from');
    // Get the reason for redirect to customize messaging
    const redirectReason = searchParams.get('redirect_reason');

    const handleApiKeySubmit = async (e) => {
        e.preventDefault();
        if (!apiKey.trim()) return;
        
        setIsLoading(true);
        
        try {
            // Create a pro session record in the database
            const response = await fetch('/api/create-pro-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: apiKey,
                    youtube_url: youtubeUrl
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create pro session');
            }
            
            const { pro_session_id } = await response.json();
            
            // Store the pro session ID locally
            localStorage.setItem('pro_session_id', pro_session_id);
            
            // If there's a redirect URL (from invalid API key error), go back there
            if (redirectFrom) {
                router.push(redirectFrom);
            } else if (youtubeUrl) {
                // If there's a YouTube URL, redirect back to process it
                router.push(`/?url=${encodeURIComponent(youtubeUrl)}&proSessionId=${encodeURIComponent(pro_session_id)}`);
            } else {
                // Otherwise go back to homepage
                router.push('/');
            }
        } catch (error) {
            console.error('Error creating pro session:', error);
            setIsLoading(false);
            // You might want to show an error message to the user here
        }
    };

    const handleProSignup = async () => {
        setIsLoading(true);
        
        try {
            // Create a pro session and get the Stripe payment link
            const response = await fetch('/api/create-payment-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_url: redirectFrom || youtubeUrl || '/'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create payment link');
            }
            
            const { url: paymentUrl, id: proSessionId } = await response.json();
            
            // Store the pro session ID locally (it will be validated after payment)
            localStorage.setItem('pro_session_id', proSessionId);
            
            // Open the Stripe payment page
            window.open(paymentUrl, "_blank");
            
        } catch (error) {
            console.error('Error creating payment link:', error);
            alert('Failed to create payment link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToHome = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={handleBackToHome}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15,18 9,12 15,6" />
                        </svg>
                        Back to Home
                    </button>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {redirectReason === 'INVALID_API_KEY' ? 'API Key Issue Detected' : 'Choose Your Plan'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {redirectReason === 'INVALID_API_KEY' 
                            ? 'Your OpenAI API key appears to be invalid or has expired. Please provide a new valid API key or upgrade to Pro to continue using Transvribe.'
                            : 'To continue using Transvribe, you can either provide your own OpenAI API key or upgrade to Pro for unlimited access for 24h.'
                        }
                    </p>
                </div>

                {/* Redirect Reason Banner */}
                {redirectReason === 'INVALID_API_KEY' && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-600 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-yellow-800">
                                    You were redirected here because your API key is no longer valid.
                                </p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Enter a new API key below or upgrade to Pro to continue.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* API Key Option */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 transition-colors shadow-sm">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                    <polyline points="10,17 15,12 10,7" />
                                    <line x1="15" y1="12" x2="3" y2="12" />
                                </svg>
                            </div>
                            <div>
                                                        <h3 className="text-xl font-semibold text-gray-900">
                            {redirectReason === 'INVALID_API_KEY' ? 'Update Your API Key' : 'Use Your Own API Key'}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {redirectReason === 'INVALID_API_KEY' ? 'Replace your invalid key' : 'Free • You pay OpenAI directly'}
                        </p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleApiKeySubmit} className="space-y-4">
                            <div>
                                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                                    OpenAI API Key
                                </label>
                                <input
                                    type="password"
                                    id="apiKey"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!apiKey.trim() || isLoading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {isLoading ? "Setting up..." : (redirectReason === 'INVALID_API_KEY' ? "Update API Key" : "Continue with API Key")}
                            </button>
                        </form>
                    </div>

                    {/* Pro Option */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-purple-500 transition-colors shadow-sm">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Upgrade to Pro</h3>
                                <p className="text-sm text-gray-600">$0.99/day • Unlimited access for 24h</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                                Unlimited video processing
                            </div>
                            <div className="flex items-center text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                                Zero commitment
                            </div>
                            <div className="flex items-center text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                                Unlimited messages
                            </div>
                        </div>
                        
                        <button
                            onClick={handleProSignup}
                            disabled={isLoading}
                            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isLoading ? "Creating Payment..." : "Upgrade to Pro"}
                        </button>
                        
                        <p className="text-sm text-gray-500 mt-3 text-center">
                            After payment, you'll be redirected back to continue using Transvribe with Pro access for 24 hours.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        By continuing, you agree to our{" "}
                        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <PricingContent />
        </Suspense>
    );
} 