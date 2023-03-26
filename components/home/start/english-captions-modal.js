export default function EnglishCaptionsModal({ onClose }) {
    return (
        <div className="w-full h-full py-14 px-10 flex flex-col text-gray-700 flex flex-col justify-center">
            <div className="w-full flex flex-row justify-center mb-3">
                <img src="/assets/monkey-english.png" className="w-32 md:w-40" />
            </div>
            <p className="md:text-3xl font-bold text-center text-gray-900">
                This video is not supported... yet!
            </p>
            <p className="mt-4">
                For now Transvribe only works with YouTube videos that have English captions. We're working
                on adding support for more languages.
            </p>
            <p className="mt-3">
                Stay tuned for updates on Twitter: <a className="underline" href="https://twitter.com/zaarheed" target="_blank">@transvribe</a>.
            </p>

            <div className="w-full flex flex-row justify-center mt-5">
                <button
                    type="button"
                    onClick={onClose}
                    className={`
                        px-6 py-2 bg-blue-500 text-white font-medium rounded
                        appearance-none
                    `}
                >
                    Try another video
                </button>
            </div>
        </div>
    );
}