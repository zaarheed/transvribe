import pg from "@/server-utils/pg";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAI } from "@langchain/openai";
import { OPENAI_API_KEY } from "@/constants/config";
import uniqid from "uniqid";
import loadYoutubeVideoFromId from "@/server-utils/load-youtube-video-from-id";

export default async function handler(req, res) {
    let { youtubeVideoId, s, youtubePlaylistId, url, pro_session_id } = req.query;

    let llm_api_key = OPENAI_API_KEY; // Default to environment API key
    const session_id = pro_session_id;

    if (!session_id) {
        return res.status(400).json({
            error: "NO_SESSION"
        });
    }

    const [session] = await pg.execute(`
        SELECT llm_api_key, expires_at , paid
        FROM pro_sessions 
        WHERE id = '${session_id}'
    `);

    if (!session) {
        return res.status(400).json({
            error: "INVALID_SESSION"
        });
    }

    if (new Date() > new Date(session.expires_at)) {
        return res.status(400).json({
            error: "SESSION_EXPIRED"
        });
    }

    const { paid } = session;

    if (!paid && !session.llm_api_key) {
        return res.status(400).json({
            error: "PAYMENT_REQUIRED"
        });
    }

    llm_api_key = session.llm_api_key || OPENAI_API_KEY;

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

    if (url) {
        if (url.includes("youtu.be")) {
            youtubeVideoId = url.split("/").pop().split("?").shift();
        }
        else {
            youtubeVideoId = url.split("v=").pop().split("&").shift();
        }
    }

    if (youtubeVideoId) {
        let [videoRecord] = await pg.execute(`
            select t.text, v.author, v.id
            from youtube_video_transcripts t
            join youtube_videos v on t.youtube_id = v.youtube_id
            where t.youtube_id = '${youtubeVideoId}'
        `);

        if (videoRecord) {
            fullTranscript = videoRecord.text;
            author = videoRecord.author;
            id = videoRecord.id;
        }
    }

    if (!fullTranscript) {
        const [error, videoData] = await loadYoutubeVideoFromId(youtubeVideoId);
        if (error) {
            res.status(400).json({ message: error });
            return;
        }
        // Update the id variable with the newly created video's database ID
        id = videoData.id;
        // We need to get the transcript and author for the newly loaded video
        let [videoRecord] = await pg.execute(`
            select t.text, v.author, v.id
            from youtube_video_transcripts t
            join youtube_videos v on t.youtube_id = v.youtube_id
            where t.youtube_id = '${youtubeVideoId}'
        `);
        if (videoRecord) {
            fullTranscript = videoRecord.text;
            author = videoRecord.author;
        }
    }

    if (!fullTranscript) {
        res.status(400).json({ message: "Could not retrieve transcript" });
        return;
    }

    const model = new OpenAI({
        openAIApiKey: llm_api_key || OPENAI_API_KEY
    });

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 50,
    });

    const doc = new Document({ pageContent: fullTranscript, metadata: { source: "youtube", type: "youtube-video", author: author, youtubeId: youtubeVideoId } });

    const docs = await splitter.splitDocuments([doc]);

    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    const chain = ConversationalRetrievalQAChain.fromLLM(
        model,
        vectorStore.asRetriever()
    );

    let response;
    try {
        response = await chain.call({
            question: `You are a helpful chatbot that answers questions and requests about a video using the transcript provided as context.
                Given the snippet, answer the following question: ${s}
            `,
            chat_history: []
        });
    } catch (error) {
        if (error.message && error.message.includes("401 Incorrect API key")) {
            return res.status(400).json({
                error: "INVALID_API_KEY"
            });
        }
    }

    await pg.execute(`
        insert into searches
            (id, question, answer, video_id, video_type)
        values
            ('${uniqid()}', '${s.replaceAll("'", "''")}', '${response.text.replaceAll("'", "''")}', '${id}', 'youtube-video')
    `);

    if (response.text.includes("I don't know")) {
        let newQuestion;
        try {
            newQuestion = await chain.call({
                question: `Suggest an alternative way to ask the following question: ${s}
                `,
                chat_history: []
            });
            
            await pg.execute(`
                insert into searches
                    (id, question, answer, video_id, video_type)
                values
                    ('${uniqid()}', '${s.replaceAll("'", "''")}', '${newQuestion.text.replaceAll("'", "''")}', '${id}', 'youtube-video')
            `);

            console.log("new question", newQuestion.text);

            response = await chain.call({
                question: `You are a helpful chatbot that answers questions and requests about a video using the transcript provided as context.
                    Given the snippet, answer the following question: ${s}
                `,
                chat_history: []
            });
        } catch (error) {
            console.log("=== Alternative Question Generation Failed ===");
            console.log("Error:", error.message);
            // Continue with the original response if alternative question generation fails
        }
    }

    console.log(response.text)

    res.json({
        ...response,
        text: response.text.trim()
    });
}