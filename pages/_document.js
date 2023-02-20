import { MICROSOFT_CLARITY_ID } from "@/constants/config";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { Fragment } from "react";

class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx)
		return { ...initialProps }
	}

	render() {
		return (
			<Html>
				<Head>
					<link rel="icon" href="/assets/icon.svg" />
					<Fragment>
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={{
								__html: `
									(function(c,l,a,r,i,t,y){
										c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
										t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
										y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
									})(window, document, "clarity", "script", "${MICROSOFT_CLARITY_ID}");
								`
							}}
						/>
					</Fragment>
				</Head>
				<body>
					<Main />
					<div id="modal" />
					<NextScript />
				</body>
			</Html>
		)
	}
}

export default MyDocument