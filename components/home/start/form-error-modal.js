export default function FormErrorModal({ onClose, error }) {
    return (
        <div className="w-full h-full py-14 px-10 flex flex-col text-gray-700 flex flex-col justify-center">
            <div className="w-full flex flex-row justify-center mb-3">
                <img src="/assets/monkey-error.png" className="w-32 md:w-40" />
            </div>
            <p className="md:text-3xl font-bold text-center text-gray-900">
                There's an error with your request
            </p>

            <p className="mt-4">
                {error.message}
            </p>

            <p className="mt-3">
                If you believe this is a mistake, please let me know on Twitter: <a className="underline" href="https://twitter.com/zaarheed" target="_blank">@transvribe</a>.
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
                    Try again
                </button>
            </div>
        </div>
    );
}