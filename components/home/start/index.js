import Modal from "@/components/shared/modal";
import { lambda } from "@/services/api";
import hasValidProSession from "@/utils/valid-pro-session";
import { Formik } from "formik";
import { useRouter } from "next/router";
import { Fragment, useRef, useState } from "react";
import * as Yup from "yup";
import PlaylistModal from "./playlist-modal";

const startSchema = Yup.object().shape({
    url: Yup.string().required("Enter a valid url"),
    question: Yup.string().required("Enter a valid question including the question mark")
});

export default function Start() {
	const formRef = useRef();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [showPlaylistModal, setPlaylistModal] = useState(false);

	const handleSubmit = async ({ url, question }) => {
		setLoading(true);
		let id = null;

		if (url.includes("/playlist?list=")) {
			await handleSubmitForPlaylist({ url, question });
			return;
		}

		if (url.includes("youtu.be")) {
			id = url.split("/").pop().split("?").shift();
		}
		else {
			id = url.split("v=").pop().split("&").shift();
		}

		const { youtubeId } = await lambda.get(`/load-video?url=${encodeURIComponent(url)}`).then(r => r.json());
		router.push(`/ytv/${youtubeId}?firstQuestion=${encodeURIComponent(question)}`);
		// await lambda.get(`/search?s=${form.question}`)
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
			<Formik
				initialValues={{ url: "", question: "" }}
				onSubmit={handleSubmit}
				validationSchema={startSchema}
				innerRef={formRef}
			>
				{({ values, handleChange, handleBlur, handleSubmit, errors, isValid }) => (
					<form className="mx-auto mt-6 max-w-2xl" onSubmit={handleSubmit}>
						<div className="relative w-full rounded-lg border-2 border-transparent bg-white px-5 shadow hover:border-blue-500 mb-4">
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
								autoComplete="off"
								value={values.url}
								onChange={handleChange}
								onBlur={handleBlur}
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
						</div>
						<div className="relative w-full rounded-lg border-2 border-transparent bg-white px-5 shadow hover:border-blue-500 mb-4 flex flex-row items-center">
							<input
								type="question"
								name="question"
								id="question"
								placeholder="Enter a question"
								className={`
									peer w-full rounded-md px-3 py-3
									placeholder:text-transparent
									focus:border-gray-500 focus:outline-none
								`}
								autoComplete="off"
								values={values.question}
								onChange={handleChange}
								onBlur={handleBlur}
							/>
							<label
								htmlFor="email"
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
								Ask your first question
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
						<p className="text-xs text-center text-gray-700">
							Note: The page will not load if your video does not have English captions. Support for more languages coming soon.
						</p>
					</form>
				)}
			</Formik>
			<Modal show={showPlaylistModal} onClose={() => setPlaylistModal(false)} showCloseButton={true} size="playlist">
				<PlaylistModal url={formRef?.current?.values?.url} />
			</Modal>
		</Fragment>
	)
}
