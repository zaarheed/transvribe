"use client";

import { useEffect } from "react";

export default function SunsetOverlay() {
    // Prevent body scroll - overlay is always visible
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Background overlay with same style as site */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <img 
                src="/assets/beams.jpg" 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-50" 
            />
            <div className="absolute inset-0 bg-[url(/assets/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30" />
            
            {/* Content */}
            <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 md:p-12 overflow-y-auto max-h-[90vh]">

                {/* Header */}
                <div className="flex flex-row space-x-2 items-center justify-center mb-6">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Transvribe</h1>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 8-6 4 6 4V8Z" />
                        <rect x={2} y={6} width={14} height={12} rx={2} ry={2} />
                    </svg>
                </div>

                {/* Main content */}
                <div className="space-y-6 text-gray-700">

                    <div className="space-y-4 text-base leading-relaxed text-gray-700">
                        <p>
                            Unfortunately, <strong>Transvribe is no longer functional</strong> due to significant changes made by YouTube to their internal API.
                        </p>

                        <p>
                            YouTube has implemented stricter validation requirements for accessing video transcripts. 
                            Their API now requires session-specific authentication tokens that cannot be reliably obtained 
                            programmatically, making it impossible to extract transcripts without a real browser session.
                        </p>

                        <p>
                            YouTube's <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">get_transcript</code> endpoint now 
                            requires <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">visitorData</code> and 
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">configInfo</code> fields that are generated 
                            per-session and validated against IP addresses and browser fingerprints. These tokens expire 
                            quickly and cannot be reused, effectively blocking server-side transcript extraction.
                        </p>

                        <p>
                            Despite extensive efforts to work around these restrictions, including attempting to extract 
                            session tokens dynamically and implementing fallback methods, YouTube's validation is too strict 
                            to bypass reliably.
                        </p>

                        <p>
                            The full codebase is available on GitHub for anyone who wants to explore, fork, or potentially 
                            find a solution. If you discover a working approach, I'd love to hear about it!
                        </p>
                    </div>

                    {/* Sign off */}
                    <div className="text-left">
                        <p className="text-base text-gray-700">
                            Back to shipping,<br />
                            <span className="text-xl" style={{ fontFamily: "'Caveat', 'Brush Script MT', cursive" }}>
                                Zahid
                            </span>
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                        <a
                            href="https://github.com/zaarheed/transvribe"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium text-center hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            View on GitHub
                        </a>
                        <a
                            href="https://twitter.com/zaarheed"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-azure-500 text-white px-6 py-3 rounded-lg font-medium text-center hover:bg-azure-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            Follow Updates
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

