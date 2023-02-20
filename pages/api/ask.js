import pg from "@/server-utils/pg";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAI } from "langchain/llms";
import { OPENAI_API_KEY } from "@/constants/config";

export default async function handler(req, res) {
    const { youtubeVideoId, s } = req.query;

    const [{ text: fullTranscript, author }] = await pg.execute(`
        select t.text, v.author
        from youtube_video_transcripts t
        join youtube_videos v on t.youtube_id = v.youtube_id
        where t.youtube_id = '${youtubeVideoId}'
    `);

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

    const docs = splitter.splitDocuments([doc]);

    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    const chain = VectorDBQAChain.fromLLM(model, vectorStore);

    const response = await chain.call({
        input_documents: docs,
        query: s,
    });

    console.log(response);
    res.json(response);

    // const pineconeClient = new PineconeClient({
    // 	apiKey: process.env.PINECONE_API_KEY,
    // 	baseUrl: process.env.PINECONE_BASE_URL,
    // 	namespace: process.env.PINECONE_NAMESPACE
    // });

    // const vectorStore = await PineconeStore.fromDocuments(
    //     pineconeClient,
    //     docs
    // );

    // fromTexts(
    //     pineconeClient,
    //     ["Hello world", "Bye bye", "hello nice world"],
    //     [{ id: 2 }, { id: 1 }, { id: 3 }],
    //     new OpenAIEmbeddings()
    //   );
}