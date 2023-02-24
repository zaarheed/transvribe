import getTranscriptForVideo from "@/server-utils/get-transcript-for-video";
import getYouTubeVideoInfo from "@/server-utils/get-youtube-video-info";
import pg from "@/server-utils/pg";
import uniqid from "uniqid";

export default async function loadYoutubeVideoFromId(id) {
    const [existingVideo] = await pg.execute(`
        select id from youtube_videos where youtube_id = '${id}'
    `);

    if (existingVideo) {
        console.info(`Video ${id} already exists`);
        return { id: id };
    }

    const { title, author, thumbUrl, url } = await getYouTubeVideoInfo(id);

    const { transcript, parts = [] } = await getTranscriptForVideo(id);

    const videoRecordId = uniqid();
    const [video] = await pg.execute(`
        insert into youtube_videos
        (id, slug, title, thumb_url, author, youtube_id, url, source, type)
        values
        ('${videoRecordId}', '${videoRecordId}', '${title.replaceAll("'", "''")}', '${thumbUrl}', '${author.replaceAll("'", "''")}', '${id}', '${url}', 'youtube', 'youtube-video')
        returning id
    `);


    const transcriptRecordId = uniqid();
    const [fullTranscript] = await pg.execute(`
        insert into youtube_video_transcripts
        (id, youtube_id, text)
        values
        ('${transcriptRecordId}', '${id}', '${transcript.replaceAll("'", "''")}')
        returning text
    `);

    await pg.execute(`
        insert into youtube_video_parts
        (id, youtube_id, text, start, duration)
        values
        ${parts.map(p => `('${uniqid()}', '${p.id}', '${p.text.replaceAll("'", "''")}', ${+p.start}, ${+p.duration})`).join(", ")}
    `);
    
    const response = {
        id: id
    };

    return response;
}