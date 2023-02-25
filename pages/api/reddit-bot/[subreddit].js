import { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_PASSWORD, REDDIT_USERNAME } from "@/constants/config";
import loadYoutubeVideoFromId from "@/server-utils/load-youtube-video-from-id";
import pg from "@/server-utils/pg";
import generateRedditMessage from "@/utils/generate-reddit-message";
import getYoutubeIdFromUrl from "@/utils/get-youtube-id-from-url";
import Snoowrap from "snoowrap";
import uniqid from "uniqid";

export default async function handler(req, res) {
    const { subreddit } = req.query;

    if (!subreddit) {
        return res.status(400).json({ error: "No subreddit provided" });
    }

    const client = new Snoowrap({
        userAgent: "transvribe-bot",
        clientId: REDDIT_CLIENT_ID,
        clientSecret: REDDIT_CLIENT_SECRET,
        username: REDDIT_USERNAME,
        password: REDDIT_PASSWORD
    });

    const posts = await client.getSubreddit(subreddit).getNew();

    const postsWithYoutubeVideo = posts.filter(p => getYoutubeIdFromUrl(p.url) !== null).map(p => ({
        permalink: p.permalink,
        redditPostId: p.id,
        videoUrl: p.url,
        youtubeId: getYoutubeIdFromUrl(p.url)
    }));

    for (let i = 0; i < postsWithYoutubeVideo.length; i++) {
        const video = postsWithYoutubeVideo[i];

        const existingPosts = await pg.execute(`
            select id from reddit_post_comments where reddit_post_id = '${video.redditPostId}'
        `);

        if (existingPosts.length > 0) continue;

        const record = await loadYoutubeVideoFromId(video.youtubeId);

        const link = `https://www.transvribe.com/ytv/${video.youtubeId}`

        const message = generateRedditMessage();
        await client.getSubmission(video.redditPostId).reply(`${message} ${link}`);

        await pg.execute(`
            insert into reddit_post_comments
                (id, reddit_post_id, text, permalink, video_url, youtube_id, reddit_post_type)
            values
                ('${uniqid()}', '${video.redditPostId}', '', '${video.permalink.replaceAll("'", "''")}', '${video.videoUrl.replaceAll("'", "''")}', '${video.youtubeId}', 'post')
        `);
    }

    res.json(postsWithYoutubeVideo);
}