import xml2js from "xml2js";

export default async function getTranscriptForVideo(videoId) {
    const html = await fetch(`https://www.youtube.com/watch?v=${videoId}`).then(r => r.text());

    const videoPageHtml = html.split('"captions":');

    let captionsUrl = JSON.parse(videoPageHtml[1].split(',"videoDetails')[0].replace('\n', ''));

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
    
    captionsUrl = captionsUrl.find((track) => {
        return /en/i.test(track?.languageCode);
    });

    if (!captionsUrl) {
        console.warn(`no english captions for ${videoId}`);
        return { transcript: null, parts: [] };
    }

    const transcriptXml = await fetch(captionsUrl.baseUrl).then(r => r.text());

    const parser = new xml2js.Parser();
    
    let parts = await parser.parseStringPromise(transcriptXml);
    parts = parts.transcript.text.map((part) => ({
        text: unescape(part._).replaceAll('[Music]', '').replaceAll(/[\t\n]/g, ' ').replaceAll('  ', ' ').trim(),
        start: +part.$.start,
        duration: +part.$.dur
    })).filter((part) => part.text.length > 0);

    let transcript = parts.map(p => p.text).join(" ");

    return {
        transcript: transcript,
        parts: parts
    }
}