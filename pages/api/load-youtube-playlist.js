import createYoutubePlaylistFromId from "@/server-utils/create-youtube-playlist-from-id";

export default async function handler(req, res) {
    const { id } = req.query;

    const playlist = await createYoutubePlaylistFromId(id);

    res.json(playlist);
}