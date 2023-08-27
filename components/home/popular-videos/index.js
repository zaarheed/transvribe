import { BASE_URL } from "@/constants/config";
import Link from "next/link";

async function fetchPopularVideos() {
    const res = await fetch(`${BASE_URL}/api/videos?sort=latest`, { next: { revalidate: 60 * 60 } });
    const response = await res.json();
    return response.videos;
}

export default async function PopularVideos() {
    const videos = await fetchPopularVideos();

    return (
        <div className="w-full flex flex-col">
            <p className="mb-2 font-medium text-sm">
                Or try one of these popular videos
            </p>
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4 relative">
                {videos.map((video, i) => (
                    <div className="relative" key={i}>
                        <Link href={`/ytv/${video.slug}`} className="relative w-full flex flex-col aspect-[16/8] rounded-lg overflow-hidden bg-white group hover:scale-105 duration-200">
                            <img src={video.thumb_url} className="w-full h-full object-cover rounded-lg overflow-hidden group-hover:opacity-30 duration-200" />
                            <div className="absolute bottom-0 left-0 w-full overflow-hidden font-semibold text-xs p-2 translate-y-32 group-hover:translate-y-0 duration-200">
                                {video.title}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}