import Link from "next/link";
import { useRouter } from "next/router";

export default function MoreOptionsModal({ onClose, video }) {
    const router = useRouter();

    const handleOpenVideoInYouTube = () => {
        window.open(`https://www.youtube.com/watch?v=${video.youtube_id}`, "_blank");
    }

    const handleClearChat = () => {
        router.replace(`/ytv/${video.youtube_id}`);
    }

    return (
        <div className="w-full h-full py-8 px-8 flex flex-col text-gray-700 flex flex-col space-y-4">
            <Link
                href={`/ytv/${video.youtube_id}/transcript`}
                className={`
                    bg-gray-200 w-full rounded-md text-center py-2 px-4
                    font-medium h-14 hover:bg-blue-500 hover:text-white
                    focus:outline-none justify-center flex flex-col
                `}
                
            >
                Download full transcript
            </Link>
            <button
                type="button"
                className={`
                    bg-gray-200 w-full rounded-md text-center py-2 px-4
                    font-medium h-14 hover:bg-blue-500 hover:text-white
                    focus:outline-none
                `}
                onClick={handleOpenVideoInYouTube}
            >
                Open video in YouTube
            </button>
            <button
                type="button"
                className={`
                    bg-gray-200 w-full rounded-md text-center py-2 px-4
                    font-medium h-14 hover:bg-blue-500 hover:text-white
                    focus:outline-none
                `}
                onClick={handleClearChat}
            >
                Clear chat
            </button>
            <button
                type="button"
                className={`
                    bg-gray-200 w-full rounded-md text-center py-2 px-4
                    font-medium h-14 hover:bg-blue-500 hover:text-white
                    focus:outline-none
                `}
                onClick={onClose}
            >
                Ask another question
            </button>
        </div>
    );
}