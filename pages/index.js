import Start from "@/components/home/start";

export default function Home() {
	return (
		<section className="w-screen h-screen relative">
			<div className="flex min-h-screen flex-col items-center justify-center p-10">
				<img src="/assets/beams.jpg" alt="" className="absolute w-full h-full object-cover" />
				<div className="absolute inset-0 bg-[url(/assets/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
				<div className="z-10 w-full max-w-screen-sm">
					<div className="">
						<div className="flex flex-row space-x-1 items-center justify-center">
							<h1 className="text-center text-xl font-bold tracking-tight sm:text-5xl">Transvribe</h1>
							<svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
								<path d="m22 8-6 4 6 4V8Z" />
								<rect x={2} y={6} width={14} height={12} rx={2} ry={2} />
							</svg>
						</div>
						<p className="mt-3 text-center text-lg text-black/50">Search any video, powered by AI embeddings</p>
					</div>
					<Start />
				</div>
			</div>

			<div className="w-full absolute bottom-2">
				<div className="w-full max-w-7xl mx-auto px-4 flex flex-row justify-center text-xs md:text-base">
					<div className="flex flex-row space-x-1 items-center">
						<img src="https://zmdev.com/assets/profile.jpg" className="relative rounded-full border border-2 border-black w-7 h-7" />
						<p className="">
							<b className="font-semibold">
								Built by <a className="underline" href="https://www.twitter.com/zaarheed">Zahid</a>
							</b>
							, to make learning on YouTube 10x more productive.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}