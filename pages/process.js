import { SESSION_KEY } from "@/constants/config";
import { lambda } from "@/services/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react"

export default function Process() {
    const router = useRouter();
    const { pro_session_id } = router.query;
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pro_session_id) {
            setError('No pro session ID provided');
            setStatus('error');
            return;
        }
        
        validateSession();
    }, [pro_session_id]);

    const validateSession = async () => {
        console.log("validateSession", pro_session_id);
        try {
            setStatus('validating');
            
            // Call validate-session API to extend the session
            const [validateError, validateResponse] = await lambda.get(`/validate-session?id=${pro_session_id}`);
            
            if (validateError) {
                console.error('Validation error:', validateError);
                setError('Failed to validate session');
                setStatus('error');
                return;
            }

            const { expiresIn, expiresAt, first_url } = validateResponse;

            if (expiresIn < 1) {
                setError('Session has expired');
                setStatus('error');
                return;
            }

            // Store the pro session ID in localStorage
            localStorage.setItem('pro_session_id', pro_session_id);

            // Handle different types of URLs
            if (!first_url) {
                // No specific URL, redirect to homepage
                router.push('/');
                return;
            }

            setStatus('processing');

            if (first_url.includes("/playlist?list=")) {
                // Handle playlist URL
                try {
                    const playlistId = first_url.split("list=").pop().split("&")[0];
                    const [playlistError, playlistResponse] = await lambda.get(`/load-youtube-playlist?id=${playlistId}`);
                    
                    if (playlistError) {
                        console.error('Playlist loading error:', playlistError);
                        // Redirect to homepage if playlist fails
                        router.push('/');
                        return;
                    }

                    const { id: youtubeId } = playlistResponse;
                    router.push(`/ytp/${youtubeId}`);
                } catch (playlistError) {
                    console.error('Playlist processing error:', playlistError);
                    router.push('/');
                }
            } else if (first_url.includes("youtu.be") || first_url.includes("youtube.com/watch")) {
                // Handle single video URL
                try {
                    let videoId;
                    if (first_url.includes("youtu.be")) {
                        videoId = first_url.split("/").pop().split("?").shift();
                    } else {
                        videoId = first_url.split("v=").pop().split("&").shift();
                    }

                    await lambda.get(`/load-video?url=${encodeURIComponent(first_url)}`);
                    
                    router.push(`/ytv/${videoId}`);
                } catch (videoError) {
                    console.error('Video processing error:', videoError);
                    router.push('/');
                }
            } else {
                // Generic URL or homepage, redirect to homepage
                router.push('/');
            }

        } catch (error) {
            console.error('Session validation error:', error);
            setError('An unexpected error occurred');
            setStatus('error');
        }
    };

    if (status === 'error') {
        return (
            <div className="w-screen h-screen flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-red-500 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <p className="text-xl text-red-600 mb-4">
                        {error}
                    </p>
                    <button 
                        onClick={() => router.push('/')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <p className="text-xl mb-2">
                    {status === 'validating' ? 'Validating Session...' : 'Processing...'}
                </p>
                <p className="text-sm text-gray-500">
                    Please wait while we set up your Pro access
                </p>
            </div>
        </div>
    );
}