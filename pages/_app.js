import "../styles/globals.css";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
	return (
	  <>
		<Head>
			<title>Transvribe | Ask any video any qustion</title>
		</Head>
		<Component {...pageProps} />
	  </>
	)
  }

export default MyApp

