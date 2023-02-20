export default function VideoHeader({ video }) {
    return (
        <header
            className="fixed top-0 left-0 z-20 py-2 bg-white w-full shadow text-gray-700"
        >
            <a
                className="w-full max-w-5xl px-2 flex flex-row space-x-4 mx-auto"
                href={video.url}
                target="_blank"
            >
                <figure
                    className="w-3/12 md:w-2/12 aspect-video relative shrink-0"
                >
                        <img src={video.thumb_url} className="w-full h-full object-cover" />
                </figure>
                <div className="w-full">
                    <p className="font-semibold text-sm md:text-2xl">
                        {video.title.slice(0, 55)}{video.title.length > 55 ? '...' : ''}
                    </p>
                    <p className="font-base text-xs text-gray-500">
                        by {video.author}
                    </p>
                </div>
            </a>
        </header>
    )
}