import { lambda } from "@/services/api";
import { Formik } from "formik";
import { useRef } from "react";
import * as Yup from "yup";

const startSchema = Yup.object().shape({
    url: Yup.string().required("Enter a valid url"),
    question: Yup.string().required("Enter a valid question including the question mark")
});

export default function Start() {
	const formRef = useRef();

	const handleSubmit = async (form) => {
		console.log(form);
		const id = form.url.split("v=").pop();
		const { id: videoId } = await lambda.get(`/load-video?id=${id}`);
		// await lambda.get(`/search?s=${form.question}`)
	};

	return (
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
						<button
							className={`
								rounded-full p-1 text-white bg-blue-500 hover:bg-blue-600
							`}
							type="submit"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</button>
					</div>
				</form>
			)}
		</Formik>
	)
}