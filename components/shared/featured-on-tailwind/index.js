export default function FeaturedOnTailwind() {
    return (
        <a
            href="https://www.tailwindai.com/tool/transvribe"
            target="_blank"
            className={`
                block flex flex-row items-center justify-center px-6 py-1
                bg-white border-2 border-blue-500 rounded-lg
                bg-white shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-60
                group relative
            `}
        >
            <img
                src="https://www.tailwindai.com/assets/logo.svg"
                className="w-6 h-6 shrink-0 mr-2 group-hover:scale-125 duration-300"
            />
            <div className="flex flex-col shrink-0 mr-4">
                <span className="text-xs text-gray-400">Featured on</span>
                <span className="text-sm font-medium">TailwindAI</span>
            </div>
            <div className="h-full aspect-square flex flex-row shrink-0 justify-center items-center text-blue-500">
                <span className="font-medium text-center text-xs mr-1">
                    4,723
                </span>
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
            </div>
        </a>
    )
}