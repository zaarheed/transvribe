import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import classNames from "classnames";
import { lambda } from "@/services/api";
import { useRouter } from "next/router";
import pg from "@/server-utils/pg";
import VideoHeader from "@/components/youtube-video/video-header";

export default function YoutubeVideo({ video }) {
    const router = useRouter();
    const { id, firstQuestion } = router.query;
    const [userInput, setUserInput] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            "message": `We're still processing your video but you can begin to ask any questions. Please keep in mind this is a work in progress and send all feedback on Twitter: [@zaarheed](https://www.twitter.com/zaarheed)`,
            "type": "apiMessage"
        }
    ]);

    const messageListRef = useRef(null);
    const textAreaRef = useRef(null);
    
    useEffect(() => {
        if (!window) return;
        window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!firstQuestion) return;
        if (messages.length > 1) return;

        setUserInput(decodeURIComponent(firstQuestion));
        ask(decodeURIComponent(firstQuestion));
    }, [firstQuestion])

    // Focus on text field on load
    useEffect(() => {
        textAreaRef.current.focus();
    }, []);

    // Handle errors
    const handleError = () => {
        setMessages((prevMessages) => [...prevMessages, { "message": "Oops! We're getting way too much traffic right now to handle your request. Please try again in a few hours.", "type": "apiMessage" }]);
        setLoading(false);
        setUserInput("");
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        await ask(userInput);
    };

    const ask = async (question) => {
        if (question.trim() === "") {
            return;
        }

        setLoading(true);
        setMessages((prevMessages) => [...prevMessages, { "message": question, "type": "userMessage" }]);

        // Send user question and history to API
        const response = await lambda.get(`/ask?youtubeVideoId=${id}&s=${encodeURIComponent(question)}`);

        if (!response.ok) {
            handleError();
            return;
        }

        // Reset user input
        setUserInput("");
        const data = await response.json();

        let message = data.text;

        if (messages.length === 5) {
            message = `${message}\n\n\nBy the way, thanks for using Transvribe! Please let me know what you're using it for and how I can make it better! [Press here to open Twitter: @zaarheed](https://www.twitter.com/zaarheed)`;
        }

        setMessages((prevMessages) => [...prevMessages, { "message": message, "type": "apiMessage" }]);
        setLoading(false);
    }

    // Prevent blank submissions and allow for multiline input
    const handleEnter = (e) => {
        if (e.key === "Enter" && userInput) {
            if (!e.shiftKey && userInput) {
                handleSubmit(e);
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    // Keep history in sync with messages
    useEffect(() => {
        if (messages.length >= 3) {
            setHistory([[messages[messages.length - 2].message, messages[messages.length - 1].message]]);
        }
    }, [messages])

    return (
        <div className="w-full min-h-screen h-full relative">
            <img src="/assets/beams.jpg" alt="" className="fixed w-full h-full object-cover" />
            <div className="fixed inset-0 bg-[url(/assets/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <VideoHeader video={video} />
            <main className="relative z-10 flex flex-col justify-between items-center p-1 h-full sm:p-2 pt-20 md:pt-28 w-full max-w-5xl mx-auto">
                <div ref={messageListRef} className="w-full rounded flex flex-col space-y-5 px-2 pt-4 pb-[20vh]">
                    {messages.map((message, index) => {
                        return (
                            <div
                                key={index}
                                className={classNames(
                                    "flex flex-col py-2 px-4 rounded-lg w-[94%]",
                                    message.type === "userMessage" && "bg-blue-500 text-white self-end",
                                    message.type === "apiMessage" && "bg-slate-400 text-white text-white self-start",
                                    loading && index === messages.length - 1 && "animate-pulse"
                                )}
                            >
                                <div className="w-full [&>a]:underline">
                                    <ReactMarkdown linkTarget={"_blank"} className="[&>a]:underline whitespace-pre-wrap">
                                        {message.message}
                                    </ReactMarkdown>
                                </div>

                                {message.type === "apiMessage" && (
                                    <div className="w-full flex flex-row space-x-1 opacity-80 justify-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m22 8-6 4 6 4V8Z" />
                                            <rect x={2} y={6} width={14} height={12} rx={2} ry={2} />
                                        </svg>
                                        <p className="text-xs uppercase">Transvribe</p>
                                    </div>
                                )}

                                {message.type === "userMessage" && (
                                    <div className="w-full flex flex-row space-x-1 opacity-80 justify-end">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <p className="text-xs uppercase">You</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
                <div className="fixed bottom-0 md:bottom-10 left-0 w-full bg-white md:bg-transparent pb-2 pt-4 border-t border-none">
                    <form className="relative w-full max-w-5xl px-4 mx-auto flex flex-row space-x-2 items-center md:bg-white md:p-4 md:rounded-xl md:shadow-xl" onSubmit={handleSubmit}>
                        <div className="relative w-full rounded-lg border-2 border-transparent bg-white px-5 shadow hover:border-blue-500 flex flex-row items-center">
                            <input
                                name="userInput"
                                id="userInput"
                                placeholder={loading ? "Waiting for response..." : "Ask a follow-up question"}
                                className={`
                                    peer w-full rounded-md px-0 py-3
                                    placeholder:text-transparent  focus:outline-none disabled:bg-white
                                `}
                                autoComplete="off"
                                disabled={loading}
                                onKeyDown={handleEnter}
                                ref={textAreaRef}
                                autoFocus={false}
                                type="text"
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
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
                                {loading ? "Waiting for response..." : "Ask a follow-up question"}
                            </label>
                        </div>
                        <div className="relative h-full flex flex-col justify-center">
                            {!loading && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-full p-1 text-white bg-blue-500 hover:bg-blue-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
                    </form>
                </div>
            </main>
        </div>
    )
}

export async function getServerSideProps({ params }) {
    const { id } = params;

    let [video] = await pg.execute(`
        select * from youtube_videos where youtube_id = '${id}'
    `);

    if (!video) {
        return {
            notFound: true
        }
    }

    video = {
        ...video,
        created_at: video.created_at.toISOString(),
    }

    return {
        props: { video }
    }
}