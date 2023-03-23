import { YOUTUBE_API_KEY } from "@/constants/config";
import { google } from "googleapis";

export default async function getYoutubePlaylistInfo(playlistId) {
    const youtube = google.youtube({
		version: "v3",
		auth: YOUTUBE_API_KEY
	});

    let playlistInfo = {};

    let { data } = await youtube.playlists.list({
        id: playlistId,
        maxResults: 1,
        part: ["snippet"]
    });

    if (data.items.length < 1) {
        return null;
    }

    const playlist = data.items.pop();

    playlistInfo.title = playlist.snippet.title;
    playlistInfo.author = playlist.snippet.channelTitle;
    playlistInfo.youtubeId = playlistId;
    playlistInfo.thumbUrl = playlist.snippet.thumbnails.high.url;;
    playlistInfo.type = "youtube-playlist";
    playlistInfo.source = "youtube";
    playlistInfo.url = `https://www.youtube.com/playlist?list=${playlistId}`

    const { data: playlistData } = await youtube.playlistItems.list({
        playlistId: playlistId,
        maxResults: 50,
        part: ["snippet", "contentDetails"]
    });
    
    const { items: videos } = playlistData;
    playlistInfo.videos = videos.map(video => ({
        title: video.snippet.title,
        thumbUrl: video.snippet.thumbnails.high?.url,
        author: video.snippet.channelTitle,
        youtubeId: video.contentDetails.videoId,
        url: `https://www.youtube.com/watch?v=${video.contentDetails.videoId}`,
        type: "youtube-video",
        source: "youtube"
    }));

    return playlistInfo;
}