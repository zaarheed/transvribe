import { useRef, useEffect, useState, cloneElement } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";

export default function Modal({ children, selector = "#modal", onClose = () => {}, show = false, size = "md", showCloseButton = false }) {
    useEffect(() => {
        if (show === false) return;
        document.body.classList.add("overflow-hidden");

        return () => {
            document.body.classList.remove("overflow-hidden");
        }
    }, [show]);

    return (
        show && (
            <Portal selector={selector}>
                <AnimatePresence>
                    <div className="w-screen h-full max-h-screen bg-white bg-opacity-10 backdrop-blur fixed top-0 left-0 overflow-hidden z-40">
                        <div className="w-full h-full relative flex justify-center items-center p-2">
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.95 }}
                                    className={classNames(
                                        "relative shadow-lg overflow-hidden flex flex-col relative border bg-white",
                                        size === "playlist" ? "w-[600px] h-[420px]" : null
                                    )}
                                >
                                    {showCloseButton && (
                                        <button
                                            className={`
                                                absolute top-3 right-3 focus:outline-none appearance-none
                                                text-red-500 rounded-full p-px hover:scale-105 duration-200
                                                cursor-pointer
                                            `}
                                            style={{ zIndex: 999 }}
                                            type="button"
                                            onClick={onClose}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    )}
                                    {cloneElement(children, { onClose })}
                                </motion.div>
                        </div>
                    </div>
                </AnimatePresence>
            </Portal>
        )
    );
}

function Portal({ children, selector }) {
    const ref = useRef()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        ref.current = document.querySelector(selector);
        setMounted(true)
    }, [selector])

    return mounted ? createPortal(children, ref.current) : null
}