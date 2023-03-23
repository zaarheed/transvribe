import classNames from "classnames";
import { useState } from "react";


export default function PlaylistHeader({ playlist }) {
    const [isOpen, setIsOpen] = useState(false);
    const { videos = [] } = playlist;

    return (
        <header
            className={classNames(
                "fixed top-0 left-0 z-20 py-2 bg-white w-full shadow text-gray-700 flex flex-col",
                isOpen ? "h-96" : null
            )}
        >
            <div className="w-full max-w-5xl mx-auto">
                <a
                    className="w-full px-2 flex flex-row space-x-4"
                    href={playlist.url}
                    target="_blank"
                >
                    <div className="w-3/12 md:w-2/12 aspect-video relative shrink-0 p-2">
                        <div className="relative w-full h-full group">
                            <figure
                                className="w-full h-full absolute top- left-0 -rotate-2 shadow group-hover:shadow-lg duration-200 group-hover:-rotate-3"
                            >
                                    <img src={playlist.thumb_url} className="w-full h-full object-cover" />
                            </figure>
                            {videos.slice(0, 2).map((video, index) => (
                                <figure
                                    key={video.id}
                                    className="w-full h-full absolute top-0 left-0"
                                >
                                        <img
                                            src={video.thumb_url}
                                            className={classNames(
                                                "w-full h-full object-cover shadow-md",
                                                index === 0 ? "-rotate-1 shadow group-hover:-rotate-1 duration-200" : null,
                                                index === 1 ? "rotate-2 shadow-lg group-hover:shadow-lg group-hover:scale-105 duration-200 group-hover:rotate-3" : null
                                            )} 
                                        />
                                </figure>
                            ))}
                                <figure
                                    className="w-full h-full absolute top-0 left-0"
                                >
                                        <img src={playlist.thumb_url} className="w-full h-full object-cover" />
                                </figure>
                        </div>
                    </div>
                    <div className="w-full">
                        <p className="font-semibold text-sm md:text-2xl">
                            Playlist: {playlist.title.slice(0, 55)}{playlist.title.length > 55 ? '...' : ''}
                        </p>
                        <p className="font-base text-xs text-gray-500">
                            by {playlist.author}
                        </p>
                    </div>
                </a>
            </div>
            {isOpen && (
                <div className="w-full max-w-5xl mx-auto px-2 grid grid-cols-3 md:grid-cols-8 gap-4 py-6 bg-white h-7/12 overflow-y-scroll">
                    {videos.map(video => (
                        <div key={video.id} className="w-full relative">
                            <figure
                                className="w-full overflow-hidden aspect-video bg-gradient-to-br from-gray-100 to-gray-200"
                            >
                                    <img src={video.thumb_url} className="w-full h-full object-cover" />
                            </figure>
                        </div>
                    ))}
                </div>
            )}
            <div className="absolute w-full -bottom-6 right-4 md:left-0 h-10 flex flex-row justify-end md:justify-center">
                <button
                    className={classNames(
                        "w-7 h-7 bg-white border shadow rounded-full hover:scale-105 duration-200",
                        "hover:shadow-lg",
                        isOpen ? "rotate-180" : null
                    )}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    &darr;
                </button>
            </div>
        </header>
    )
}