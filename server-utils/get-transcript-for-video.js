import xml2js from "xml2js";

export default async function getTranscriptForVideo(videoId) {
    const html = await fetch(
        `https://www.youtube.com/watch?v=${videoId}`,
        {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        }
    ).then(r => r.text());

    console.info(`Fetched html for video ${videoId}`);

    const videoPageHtml = html.split('"captions":');

    console.info(videoPageHtml.length > 1 ? `Successfully identified captions for video ${videoId}` : `Captions section for video ${videoId} not found (${videoPageHtml.length} indexes)`);

    const videoDetails = videoPageHtml[1].split(',"videoDetails');

    console.info(`Extracted video details for video ${videoId} (${videoDetails.length} indexes)`);

    const dirtyVideoDetails = videoDetails[0];

    console.info(`Extracted dirty video details for video ${videoId}`, dirtyVideoDetails);

    const sanitizedVideoDetails = dirtyVideoDetails.replace('\n', '');

    console.info(`Sanitized video details for video ${videoId}`, sanitizedVideoDetails);

    let captionsUrl = JSON.parse(sanitizedVideoDetails);

    console.info(`Extracted captions object for video ${videoId}`);

    // 4th Sept 2024
    // `captionsUrl.playerCaptionsTracklistRenderer` dissapeared from the payload
    // so I introduced a backwards-compatible change to check for `captionsUrl.playerCaptionsTracklistRenderer` first
    // and if it doesn't exist, then use the new `captionTracks` field directly on `captionsUrl`
    if (captionsUrl?.playerCaptionsTracklistRenderer) {
        captionsUrl = captionsUrl?.playerCaptionsTracklistRenderer.captionTracks;
    }
    else {
        captionsUrl = captionsUrl?.captionTracks
    }

    console.info(`Found ${captionsUrl.length} caption sets for video ${videoId}`);
    
    captionsUrl = captionsUrl.find((track) => {
        return /en/i.test(track?.languageCode);
    });

    if (!captionsUrl) {
        console.error(`no english captions for ${videoId}`);
        return { transcript: null, parts: [] };
    }

    console.info(`Found captions for ${videoId}`);

    const transcriptXml = await fetch(captionsUrl.baseUrl).then(r => r.text());

    const parser = new xml2js.Parser();
    
    let parts = await parser.parseStringPromise(transcriptXml);
    parts = parts.transcript.text.map((part) => ({
        text: unescape(part._).replaceAll('[Music]', '').replaceAll(/[\t\n]/g, ' ').replaceAll('  ', ' ').trim(),
        start: +part.$.start,
        duration: +part.$.dur
    })).filter((part) => part.text.length > 0);

    console.info(`Found ${parts.length} parts for ${videoId}`);

    let transcript = parts.map(p => p.text).join(" ");

    return {
        transcript: transcript,
        parts: parts
    }
}