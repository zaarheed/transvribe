import xml2js from "xml2js";

export default async function getTranscriptForVideo(videoId) {
    const html = await fetch(`https://www.youtube.com/watch?v=${videoId}`).then(r => r.text());

    const videoPageHtml = html.split('"captions":');

    let captionsUrl = JSON.parse(videoPageHtml[1].split(',"videoDetails')[0].replace('\n', ''));
    captionsUrl = captionsUrl?.playerCaptionsTracklistRenderer?.captionTracks;
    captionsUrl = captionsUrl.find((track) => {
        return /english/i.test(track?.name?.simpleText)
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