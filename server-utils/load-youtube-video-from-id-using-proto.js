// This looks cool:
// https://github.com/algolia/youtube-captions-scraper/issues/30#issuecomment-2313319115

import axios from 'axios';
import protobuf from 'protobufjs';
import { Buffer } from 'buffer';

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
		const headers = { 'Content-Type': 'application/json' };
		const data = {
			context: {
				client: {
					clientName: 'WEB',
					// clientVersion: '2.20240826',
					clientVersion: '2.20240826.01.00',
				},
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
	}
}