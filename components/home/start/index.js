"use client";

import Modal from "@/components/shared/modal";
import { lambda } from "@/services/api";
import hasValidProSession from "@/utils/valid-pro-session";
import { Fragment, useState, useEffect } from "react";
import EnglishCaptionsModal from "./english-captions-modal";
import FormErrorModal from "./form-error-modal";
import PlaylistModal from "./playlist-modal";

import { useRouter } from "next/navigation";

export default function Start() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [showPlaylistModal, setPlaylistModal] = useState(false);
	const [showCaptionsModal, setCaptionsModal] = useState(false);

	const [url, setUrl] = useState("");
	const [error, setError] = useState(null);

	// Check for URL parameters when component mounts
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const urlFromParams = urlParams.get('url');
		const proSessionIdFromParams = urlParams.get('proSessionId');

		if (urlFromParams && proSessionIdFromParams) {
			setUrl(decodeURIComponent(urlFromParams));
			// Store the pro session ID
			localStorage.setItem('pro_session_id', decodeURIComponent(proSessionIdFromParams));
			// Process the video immediately
			processVideoWithProSession(decodeURIComponent(urlFromParams));
			// Clean up the URL
			window.history.replaceState({}, document.title, window.location.pathname);
		}
	}, []);

	const processVideoWithProSession = async (videoUrl) => {
		setLoading(true);

		let id = null;

		if (videoUrl.includes("/playlist?list=")) {
			await handleSubmitForPlaylist({ url: videoUrl, question: "" });
			return;
		}

		if (videoUrl.includes("youtu.be")) {
			id = videoUrl.split("/").pop().split("?").shift();
		}
		else {
			id = videoUrl.split("v=").pop().split("&").shift();
		}

		const [error, response] = await lambda.get(`/load-video?url=${encodeURIComponent(videoUrl)}`);

		if (error) {
			setCaptionsModal(true);
			setLoading(false);
			return;
		}

		const { youtubeId } = response;

		router.push(`/ytv/${youtubeId}`);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		if (!url) {
			setError({ message: "Please enter a valid YouTube video or playlist URL." });
			setLoading(false);
			return;
		}

		if (url.indexOf("youtube.com") < 0 && url.indexOf("youtu.be") < 0) {
			setError({ message: "We don't recognise that to be a valid video or playlist URL. Please enter a valid YouTube video or playlist URL." });
			setLoading(false);
			return;
		}

		const pro_session_id = localStorage.getItem('pro_session_id');

		if (pro_session_id) {
			const [error, response] = await lambda.get(`/load-video?url=${encodeURIComponent(url)}`);

			if (error) {
				setCaptionsModal(true);
				setLoading(false);
				return;
			}

			const { youtubeId } = response;

			router.push(`/ytv/${youtubeId}`);
			setLoading(false);
			return;
		}

		// Check if user has provided API key or has pro session
		// For now, we'll redirect to pricing page - this will be enhanced later
		router.push(`/pricing?url=${encodeURIComponent(url)}`);
		setLoading(false);
		return;
	};

	const handleSubmitForPlaylist = async ({ url, question }) => {
		const hasSession = hasValidProSession("playlist");

		if (hasSession) {
			let playlistId = url.split("/").pop().split("list=").pop();

			const { id: youtubeId } = await lambda.get(`/load-youtube-playlist?id=${playlistId}`).then(r => r.json());
			router.push(`/ytp/${youtubeId}?firstQuestion=${encodeURIComponent(question)}`);
			setLoading(false);
			return;
		}

		setPlaylistModal(true);
		setLoading(false);
		return;
	};



	return (
		<Fragment>
			<form className="mx-auto mt-6 max-w-2xl" onSubmit={handleSubmit}>
				<div className="relative w-full rounded-lg border-2 border-transparent bg-white px-5 shadow hover:border-blue-500 mb-4 flex flex-row items-center">
					<input
						type="text"
						name="url"
						id="url"
						placeholder="Paste a YouTube URL"
						className={`
							peer w-full rounded-md px-3 py-3
							placeholder:text-transparent
							focus:border-gray-500 focus:outline-none
						`}
						disabled={loading}
						autoComplete="off"
						value={url}
						onChange={({ target }) => setUrl(target.value)}
					/>
					<label
						htmlFor="url"
						className={`
							pointer-events-none absolute top-0 left-0 ml-3 origin-left
							-translate-y-1/2 transform bg-blue-500 px-1 text-sm text-white
							transition-all duration-300 ease-in-out
							peer-placeholder-shown:top-1/2 peer-placeholder-shown:ml-4
							peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
							peer-focus:-top-0 peer-focus:ml-3 peer-focus:text-sm
							peer-focus:text-gray-800 peer-focus:bg-blue-500 peer-focus:text-white rounded
							peer-placeholder-shown:text-gray-500 peer-placeholder-shown:bg-white
						`}
					>
						Paste a YouTube URL
					</label>
					<div className="relative h-full flex flex-col justify-center">
						{!loading && (
							<button
								type="submit"
								disabled={loading}
								className="rounded-full p-1 text-white bg-blue-500 hover:bg-blue-600"
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
									<polyline points="9 18 15 12 9 6" />
								</svg>
							</button>
						)}
						{loading && (
							<svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M21 12a9 9 0 1 1-6.219-8.56" />
							</svg>
						)}
					</div>
				</div>
			</form>

			<Modal show={showPlaylistModal} onClose={() => setPlaylistModal(false)} showCloseButton={true} size="playlist">
				<PlaylistModal url={url} />
			</Modal>
			<Modal show={showCaptionsModal} onClose={() => setCaptionsModal(false)} showCloseButton={true} size="playlist">
				<EnglishCaptionsModal url={url} />
			</Modal>
			<Modal show={!!error} onClose={() => setError(null)} showCloseButton={true} size="playlist">
				<FormErrorModal error={error} />
			</Modal>
		</Fragment>
	)
}
