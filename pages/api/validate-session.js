import pg from "@/server-utils/pg";
import { differenceInSeconds } from 'date-fns'

export default async function handler(req, res) {
    const { id } = req.query;

    const [session] = await pg.execute(`
        update pro_sessions
        set expires_at = now() + interval '1 day',
        paid = TRUE
        where id = '${id}'
        returning id, expires_at, first_url
    `);


    res.json({
        id: session.id,
        expiresAt: session.expires_at,
        expiresIn: differenceInSeconds(new Date(session.expires_at), new Date()),
        first_url: session.first_url
    });
}