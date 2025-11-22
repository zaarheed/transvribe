import "@/styles/globals.css";
import SunsetOverlay from "@/components/shared/sunset-overlay";

export const metadata = {
	title: "Transvribe | Ask any video any qustion"
}

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				<SunsetOverlay />
				{children}
				<div id="modal" />
			</body>
		</html>
	)
}
