import pg from "@/server-utils/pg";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { ChatVectorDBQAChain } from "langchain/chains";
import { OpenAI } from "langchain/llms";
import { OPENAI_API_KEY } from "@/constants/config";
import uniqid from "uniqid";

export default async function handler(req, res) {
    const { youtubeVideoId, s, youtubePlaylistId } = req.query;

    let fullTranscript = "", author = "", id = "";

    if (youtubePlaylistId) {

        const videos = await pg.execute(`
            SELECT videos.*, transcripts.text
            FROM youtube_videos videos
            JOIN youtube_playlist_youtube_video_map map
            ON videos.youtube_id = map.youtube_video_id
            JOIN youtube_video_transcripts transcripts
            ON videos.youtube_id = transcripts.youtube_id
            WHERE map.youtube_playlist_id = '${youtubePlaylistId}'
        `);

        if (videos.length < 1) {
            res.status(400).json({ message: "Could not retrieve transcript" });
            return;
        }

        author = videos[0].author;
        id = youtubePlaylistId;

        fullTranscript = videos.map(video => video.text).join("\n\n\n");
    }

    if (youtubeVideoId) {
        let [{ text, author, id }] = await pg.execute(`
            select t.text, v.author, v.id
            from youtube_video_transcripts t
            join youtube_videos v on t.youtube_id = v.youtube_id
            where t.youtube_id = '${youtubeVideoId}'
        `);

        fullTranscript = text;
    }


    if (!fullTranscript) {
        res.status(400).json({ message: "Could not retrieve transcript" });
        return;
    }

    const model = new OpenAI({
        openAIApiKey: OPENAI_API_KEY
    });

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 50,
    });

    const doc = new Document({ pageContent: fullTranscript, metadata: { source: "youtube", type: "youtube-video", author: author, youtubeId: youtubeVideoId } });

    const docs = await splitter.splitDocuments([doc]);

    console.log(docs);

    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    const chain = ChatVectorDBQAChain.fromLLM(model, vectorStore);

    const response = await chain.call({
        question: s,
        chat_history: []
    });

    await pg.execute(`
        insert into searches
            (id, question, answer, video_id, video_type)
        values
            ('${uniqid()}', '${s.replaceAll("'", "''")}', '${response.text.replaceAll("'", "''")}', '${id}', 'youtube-video')
    `);

    res.json(response);
}