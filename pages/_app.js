import "../styles/globals.css";
import Head from "next/head";
import SunsetOverlay from "@/components/shared/sunset-overlay";

function MyApp({ Component, pageProps }) {
	return (
	  <>
		<Head>
			<title>Transvribe | Ask any video any qustion</title>
		</Head>
		<SunsetOverlay />
		<Component {...pageProps} />
	  </>
	)
  }

export default MyApp

