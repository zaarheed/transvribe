import loadYoutubeVideoFromId from "@/server-utils/load-youtube-video-from-id";

export default async function handler(req, res) {
    let { id, url } = req.query;

    if (url) {
        if (url.includes("youtu.be")) {
			id = url.split("/").pop().split("?").shift();
		}
		else {
			id = url.split("v=").pop().split("&").shift();
		}
    }

    if (!id) {
        res.status(400).json({ error: "No id or url provided" });
    }
    
    const [error, payload] = await loadYoutubeVideoFromId(id);

    if (error) {
        res.status(400).json({ message: error });
        return;
    }

    res.json(payload);
}
