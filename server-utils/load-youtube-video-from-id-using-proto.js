// This looks cool:
// https://github.com/algolia/youtube-captions-scraper/issues/30#issuecomment-2313319115

import axios from 'axios';
import protobuf from 'protobufjs';
import { Buffer } from 'buffer';

async function extractSessionDataFromYouTubePage(videoId) {
	try {
		const html = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
			}
		}).then(r => r.data);

		// Extract visitorData - usually in ytInitialData or ytInitialPlayerResponse
		let visitorData = '';
		let configInfo = {
			appInstallData: '',
			coldConfigData: '',
			coldHashData: '',
			hotHashData: ''
		};

		// Try to find visitorData in the HTML - look for it in various places
		const visitorDataMatches = [
			html.match(/"visitorData":"([^"]+)"/),
			html.match(/"visitorData":\s*"([^"]+)"/),
			html.match(/visitorData["\s]*:["\s]*"([^"]+)"/)
		];
		for (const match of visitorDataMatches) {
			if (match && match[1]) {
				visitorData = match[1];
				break;
			}
		}

		// Try to find configInfo fields individually
		const appInstallDataMatch = html.match(/"appInstallData":"([^"]*)"/);
		if (appInstallDataMatch) {
			configInfo.appInstallData = appInstallDataMatch[1] || '';
		}

		const coldConfigDataMatch = html.match(/"coldConfigData":"([^"]*)"/);
		if (coldConfigDataMatch) {
			configInfo.coldConfigData = coldConfigDataMatch[1] || '';
		}

		const coldHashDataMatch = html.match(/"coldHashData":"([^"]*)"/);
		if (coldHashDataMatch) {
			configInfo.coldHashData = coldHashDataMatch[1] || '';
		}

		const hotHashDataMatch = html.match(/"hotHashData":"([^"]*)"/);
		if (hotHashDataMatch) {
			configInfo.hotHashData = hotHashDataMatch[1] || '';
		}

		// Alternative: try to extract from ytInitialData or ytInitialPlayerResponse JSON
		if (!visitorData || !configInfo.appInstallData) {
			const jsonMatches = [
				html.match(/var ytInitialData = ({.+?});/s),
				html.match(/var ytInitialPlayerResponse = ({.+?});/s),
				html.match(/window\["ytInitialData"\] = ({.+?});/s)
			];
			
			for (const jsonMatch of jsonMatches) {
				if (jsonMatch) {
					try {
						const jsonData = JSON.parse(jsonMatch[1]);
						// Try to find visitorData in responseContext
						if (jsonData?.responseContext?.visitorData && !visitorData) {
							visitorData = jsonData.responseContext.visitorData;
						}
						// Try to find configInfo - it might be nested in various places
						// Look for it recursively or in common locations
						if (!configInfo.appInstallData) {
							const findConfigInfo = (obj) => {
								if (!obj || typeof obj !== 'object') return null;
								if (obj.configInfo && obj.configInfo.appInstallData) {
									return obj.configInfo;
								}
								for (const key in obj) {
									const result = findConfigInfo(obj[key]);
									if (result) return result;
								}
								return null;
							};
							const foundConfigInfo = findConfigInfo(jsonData);
							if (foundConfigInfo) {
								configInfo = foundConfigInfo;
							}
						}
					} catch (e) {
						// Continue to next match
					}
				}
			}
		}

		return { visitorData, configInfo };
	} catch (error) {
		console.warn('Failed to extract session data from YouTube page:', error.message);
		return { visitorData: '', configInfo: { appInstallData: '', coldConfigData: '', coldHashData: '', hotHashData: '' } };
	}
}

function getBase64Protobuf(message) {
	const root = protobuf.Root.fromJSON({
		nested: {
			Message: {
				fields: {
					param1: { id: 1, type: 'string' },
					param2: { id: 2, type: 'string' },
				},
			},
		},
	});
	const MessageType = root.lookupType('Message');

	const buffer = MessageType.encode(message).finish();

	return Buffer.from(buffer).toString('base64');
}
export default async function loadYoutubeVideoFromIdUsingProto(videoId) {
	try {
		// Extract fresh session data from YouTube page
		const { visitorData, configInfo } = await extractSessionDataFromYouTubePage(videoId);
		
		if (!visitorData) {
			console.warn('Could not extract visitorData from YouTube page');
		}

		const message1 = {
			param1: 'asr',
			param2: 'en',
		};

		const protobufMessage1 = getBase64Protobuf(message1);

		const message2 = {
			param1: videoId,
			param2: protobufMessage1,
		};

		const params = getBase64Protobuf(message2);

		const url = 'https://www.youtube.com/youtubei/v1/get_transcript';
		const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0,gzip(gfe)';
		const headers = { 
			'Content-Type': 'application/json',
			'User-Agent': userAgent,
			'Origin': 'https://www.youtube.com',
			'Referer': `https://www.youtube.com/watch?v=${videoId}`,
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
		};
		
		// Build context object with dynamically extracted session data
		const clientContext = {
			hl: 'en-GB',
			gl: 'GB',
			deviceMake: 'Apple',
			deviceModel: '',
			visitorData: visitorData,
			userAgent: userAgent,
			clientName: 'WEB',
			clientVersion: '2.20251121.01.00',
			osName: 'Macintosh',
			osVersion: '10_15_7',
			originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
			screenPixelDensity: 2,
			platform: 'DESKTOP',
			clientFormFactor: 'UNKNOWN_FORM_FACTOR',
			windowWidthPoints: 1175,
			configInfo: configInfo,
			screenDensityFloat: 2,
			userInterfaceTheme: 'USER_INTERFACE_THEME_DARK',
			timeZone: 'Europe/London',
			browserName: 'Edge Chromium',
			browserVersion: '141.0.0.0',
			memoryTotalKbytes: '8000000',
			acceptHeader: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
			mainAppWebInfo: {
				graftUrl: `https://www.youtube.com/watch?v=${videoId}`,
				webDisplayMode: 'WEB_DISPLAY_MODE_BROWSER',
				isWebNativeShareAvailable: true
			}
		};

		const data = {
			context: {
				client: clientContext,
				user: {
					lockedSafetyMode: false
				},
				request: {
					useSsl: true,
					internalExperimentFlags: [],
					consistencyTokenJars: []
				}
			},
			params,
		};

		const response = await axios.post(url, data, { headers });

		let parts =
			response.data.actions[0].updateEngagementPanelAction.content.transcriptRenderer.content.transcriptSearchPanelRenderer.body.transcriptSegmentListRenderer.initialSegments.map(
				(segment) => {
					const { endMs, startMs, snippet } = segment.transcriptSegmentRenderer;

					const text = snippet.runs.map((run) => run.text).join('');

					return {
						start: parseInt(startMs) / 1000,
						duration: (parseInt(endMs) - parseInt(startMs)) / 1000,
						text,
					};
				},
			).filter((part) => part.text.length > 0);

		console.info(`Found ${parts.length} parts for ${videoId}`);

		let transcript = parts.map(p => p.text).join(" ");

		return {
			transcript: transcript,
			parts: parts
		}
	} catch (err) {
		console.error('Error:', err);
		// Log the actual error response from YouTube if available
		if (err.response && err.response.data) {
			console.error('YouTube API error response:', JSON.stringify(err.response.data, null, 2));
		}
		throw err; // Rethrow so calling code can handle fallback
	}
}