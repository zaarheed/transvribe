import pg from "@/server-utils/pg";

export default function YoutubeVideo({ video }) {
    return (
        <div className="w-full min-h-screen h-full relative">
            {video.text}
        </div>
    )
}

export async function getServerSideProps({ params }) {
    const { id } = params;

    let [video] = await pg.execute(`
        select * from youtube_video_transcripts where youtube_id = '${id}'
    `);

    if (!video) {
        return {
            notFound: true
        }
    }

    video = {
        ...video,
        created_at: video.created_at.toISOString(),
    }

    return {
        props: { video }
    }
}