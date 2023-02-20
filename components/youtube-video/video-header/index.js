export default function VideoHeader({ video }) {
    return (
        <header
            className="fixed top-0 left-0 z-10 relative py-2 bg-white w-full shadow text-gray-700"
        >
            <div className="w-full max-w-5xl px-2 flex flex-row space-x-4">
                <figure
                    className="w-3/12 aspect-video relative shrink-0"
                >
                        <img src={video.thumb_url} className="w-full h-full object-cover" />
                </figure>
                <div className="w-full">
                    <p className="font-semibold text-sm">
                        {video.title}
                    </p>
                    <p className="font-base text-xs text-gray-500">
                        by {video.author}
                    </p>
                </div>
            </div>
        </header>
    )
}