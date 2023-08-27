import PopularVideos from "@/components/home/popular-videos";
import Start from "@/components/home/start";

export default function Root() {
	return (
		<section className="w-full relative">
            <img src="/assets/beams.jpg" alt="" className="absolute w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[url(/assets/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
			<div className="flex min-h-screen flex-col items-center pt-10 px-4 z-10 relative sm:justify-center">
				<div className="w-full max-w-screen-sm">
					<div className="">
						<div className="flex flex-row space-x-1 items-center justify-center">
							<h1 className="text-center text-3xl font-bold tracking-tight sm:text-5xl">Transvribe</h1>
							<svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
								<path d="m22 8-6 4 6 4V8Z" />
								<rect x={2} y={6} width={14} height={12} rx={2} ry={2} />
							</svg>
						</div>
						<p className="mt-1 md:mt-3 text-center text-sm md:text-lg text-black/50">Search any video, powered by AI embeddings</p>
					</div>
					<Start />
					
					<div className="w-full flex flex-row justify-center mt-4">
						<PopularVideos />
					</div>
				</div>
			</div>

			<div className="w-full z-10 relative py-2">
				<div className="w-full max-w-7xl mx-auto px-4 flex flex-row justify-center text-xs md:text-base">
					<div className="flex flex-row space-x-1 items-center">
						<img src="https://zmdev.com/assets/profile.jpg" className="relative rounded-full border border-2 border-black w-7 h-7" />
						<p className="">
							<b className="font-semibold">
								Built by <a className="underline" href="https://www.twitter.com/zaarheed">Zahid</a>
							</b>
							, to make learning on YouTube 10x more productive. <a className="underline" href="https://www.github.com/zaarheed/transvribe">🍜 on GitHub</a>
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}