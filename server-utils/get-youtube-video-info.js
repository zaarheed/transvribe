import { YOUTUBE_API_KEY } from "@/constants/config";
import { google } from "googleapis";

export default async function getYouTubeVideoInfo(videoId) {
    const youtube = google.youtube({
		version: "v3",
		auth: YOUTUBE_API_KEY
	});

    const { data } = await youtube.videos.list({
        id: videoId,
        part: ["id", "contentDetails", "localizations", "snippet", "status"],
        maxResults: 1
    });
    
    const { items: videos } = data;
    const video = videos.pop();
    const title = video.snippet.title;
    const author = video.snippet.channelTitle;
    const thumbUrl = video.snippet.thumbnails.high.url;

    return {
        title: title,
        author: author,
        thumbUrl: thumbUrl,
        url: `https://www.youtube.com/watch?v=${videoId}`
    }
}