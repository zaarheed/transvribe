import loadYoutubeVideoFromId from "@/server-utils/load-youtube-video-from-id";

export default async function handler(req, res) {
    const { id } = req.query;
    
    const payload = {
        id: await loadYoutubeVideoFromId(id)
    };

    res.json(payload);
}