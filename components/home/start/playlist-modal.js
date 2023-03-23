import { lambda } from "@/services/api";
import { useEffect, useState } from "react";

export default function PlaylistModal({ url }) {
    const [stripeUrl, setStripeUrl] = useState(null);
    
    useEffect(() => {
        getStripeLink();
    }, []);
    
    const getStripeLink = async () => {
        const { id, url: stripeUrl } = await lambda.post(`/create-payment-link`, {
            first_url: url
        }).then(r => r.json());
        localStorage.setItem("@transvribe/pro-session", JSON.stringify({ id: id, expiresAt: new Date() }));
        setStripeUrl(stripeUrl);
    };

    return (
        <div className="w-full h-full py-14 px-10 flex flex-col text-gray-700 flex flex-col justify-center">
            <p className="text-3xl font-bold text-center text-gray-900">
                Playlists require a Pro subscription
            </p>
            <p className="mt-4">
                Playlists are a great way to collect and organise videos. Transvribe allows you to ask
                questions across multiple videos by grouping them in YouTube playlists.
            </p>
            <p className="mt-3">
                To get started, click the button below to upgrade your account to pro for 24 hours.
            </p>

            <div className="w-full flex flex-row justify-center mt-5">
                <a
                    className={`
                        px-6 py-2 bg-blue-500 text-white font-medium rounded
                    `}
                    href={stripeUrl}
                >
                    Upgrade to Pro for £0.99
                </a>
            </div>
        </div>
    );
}