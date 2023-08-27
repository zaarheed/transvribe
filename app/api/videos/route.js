import pg from "@/server-utils/pg";
import { NextResponse } from "next/server";

export async function GET(request) {
    const url = new URL(request.url);

    const sortBy = url.searchParams.get("sort");
    
    if (sortBy === "popular") {
        const popularVideos = await pg.execute(`
            SELECT s.video_id, COUNT(*) as frequency, y.title, y.thumb_url, y.youtube_id as slug
            FROM searches s
            LEFT JOIN youtube_videos y ON s.video_id = y.id
            WHERE s.video_id != '' AND y.thumb_url IS NOT NULL
            GROUP BY s.video_id, y.title, y.thumb_url, y.youtube_id
            ORDER BY frequency DESC
            LIMIT 6;
        `);

        return NextResponse.json({ videos: popularVideos });
    }

    if (sortBy === "latest") {
        const popularVideos = await pg.execute(`
            SELECT s.video_id, COUNT(*) as frequency, y.title, y.thumb_url, y.youtube_id as slug
            FROM searches s
            LEFT JOIN youtube_videos y ON s.video_id = y.id
            WHERE s.video_id != '' AND y.thumb_url IS NOT NULL
            GROUP BY s.video_id, y.title, y.thumb_url, y.youtube_id
            ORDER BY frequency DESC
            LIMIT 6 OFFSET 20;
        `);

        return NextResponse.json({ videos: popularVideos });
    }

    return NextResponse.json({ videos: [] });
}