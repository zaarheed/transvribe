import pg from "@/server-utils/pg";
import uniqid from "uniqid";
import getYoutubePlaylistInfo from "./get-youtube-playlist-info";
import loadYoutubeVideoFromId from "./load-youtube-video-from-id";

export default async function createYoutubePlaylistFromId(id) {
    const existingPlaylists = await pg.execute(`
        select id from youtube_playlists where youtube_id = '${id}'
    `);

    if (existingPlaylists.length > 0) {
        console.info(`Playlist ${id} already exists`);
        return { id: id };
    }

    const { title, author, url, thumbUrl, videos = [], youtubeId } = await getYoutubePlaylistInfo(id);

    const playlistRecordId = uniqid();
    const [playlist] = await pg.execute(`
        insert into youtube_playlists
        (id, slug, title, thumb_url, author, youtube_id, url, source, type)
        values
        ('${playlistRecordId}', '${playlistRecordId}', '${title.replaceAll("'", "''")}', '${thumbUrl}', '${author.replaceAll("'", "''")}', '${youtubeId}', '${url}', 'youtube', 'youtube-playlist')
        returning id, youtube_id
    `);

    for (let i = 0; i < videos.length; i++) {
        let video = videos[i];

        video = await loadYoutubeVideoFromId(video.youtubeId);
        
        await pg.execute(`
            insert into youtube_playlist_youtube_video_map
            (video_id, playlist_id, youtube_video_id, youtube_playlist_id)
            values
            ('${video.id}', '${playlist.id}', '${video.youtubeId}', '${playlist.youtube_id}')
        `)
    }
    
    const response = {
        id: playlistRecordId,
        youtubeId: youtubeId,
        videos: videos
    };

    return response;
}