import pg from "@/server-utils/pg";
import uniqid from "uniqid";
import getYoutubePlaylistInfo from "./get-youtube-playlist-info";

export default async function createYoutubePlaylistFromId(id) {
    // const [existingPlaylist] = await pg.execute(`
    //     select id from youtube_playlists where youtube_id = '${id}'
    // `);

    const { title, author, url, thumbUrl, videos = [], youtubeId } = await getYoutubePlaylistInfo(id);

    const playlistRecordId = uniqid();
    const [playlist] = await pg.execute(`
        insert into youtube_playlists
        (id, slug, title, thumb_url, author, youtube_id, url, source, type)
        values
        ('${playlistRecordId}', '${playlistRecordId}', '${title.replaceAll("'", "''")}', '${thumbUrl}', '${author.replaceAll("'", "''")}', '${youtubeId}', '${url}', 'youtube', 'youtube-playlist')
    `);
    
    const response = {
        id: playlistRecordId,
        youtubeId: youtubeId,
        videos: videos
    };

    return response;
}