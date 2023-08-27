import "@/styles/globals.css";

export const metadata = {
	title: "Transvribe | Ask any video any qustion"
}

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				{children}
				<div id="modal" />
			</body>
		</html>
	)
}
