import { SESSION_KEY } from "@/constants/config";
import { lambda } from "@/services/api";
import { useRouter } from "next/router";
import { useEffect } from "react"

export default function Process() {
    const router = useRouter();
    const { pro_session_id } = router.query;

    useEffect(() => {
        if (!pro_session_id) return;
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || null);
        if (!session) return;
        validateSession();
    }, [pro_session_id]);

    const validateSession = async () => {
        const { expiresIn, expiresAt, first_url } = await lambda.get(`/validate-session?id=${pro_session_id}`).then(res => res.json());

        if (expiresIn < 1) {
            localStorage.removeItem(SESSION_KEY);
            router.replace("/");
            return;
        }

        // import playlist
        let playlistId = first_url.split("/").pop().split("list=").pop();

		const { id: youtubeId } = await lambda.get(`/load-youtube-playlist?id=${playlistId}`).then(r => r.json());
		router.push(`/ytp/${youtubeId}`);
    }

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <p className="text-xl">
                    Processing
                </p>
            </div>
        </div>
    )
}