import pg from "@/server-utils/pg";
import uniqid from "uniqid";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { api_key, youtube_url } = req.body;

        if (!api_key || !api_key.trim()) {
            return res.status(400).json({ 
                message: 'API key is required',
                error: 'MISSING_API_KEY'
            });
        }

        // Generate a unique pro session ID
        const pro_session_id = uniqid();
        
        // Set expiration to 24 hours from now
        const expires_at = new Date();
        expires_at.setHours(expires_at.getHours() + 24);

        // Insert the pro session into the database
        const [session] = await pg.execute(`
            INSERT INTO pro_sessions
            (id, llm_api_key, created_at, expires_at, first_url)
            VALUES
            ('${pro_session_id}', '${api_key.replaceAll("'", "''")}', now(), '${expires_at.toISOString()}', '${youtube_url ? youtube_url.replaceAll("'", "''") : null}')
            RETURNING id, created_at, expires_at
        `);

        console.log("=== Pro Session Created ===");
        console.log("Session ID:", pro_session_id);
        console.log("Expires at:", expires_at);
        console.log("==========================");

        res.status(201).json({
            pro_session_id: session.id,
            created_at: session.created_at,
            expires_at: session.expires_at,
            message: 'Pro session created successfully'
        });

    } catch (error) {
        console.error('Error creating pro session:', error);
        res.status(500).json({ 
            message: 'Failed to create pro session',
            error: 'DATABASE_ERROR',
            details: error.message
        });
    }
} 