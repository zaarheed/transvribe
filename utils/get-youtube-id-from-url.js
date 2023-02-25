export default function getYoutubeIdFromUrl(url) {
    if (!url) return null;

    let id = null;

    if (url.includes("youtu.be")) {
        id = url.split("/").pop().split("?").shift();
    }
    
    if (url.includes("youtube.com")) {
        id = url.split("v=").pop().split("&").shift();
    }
    
    return id;
}