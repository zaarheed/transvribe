import { BASE_URL, STRIPE_PRICE_ID, STRIPE_SECRET_KEY } from "@/constants/config";
import pg from "@/server-utils/pg";
import Stripe from "stripe";
import uniqid from "uniqid";

const stripe = new Stripe(STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    const id = uniqid();
    const { first_url } = req.body;

    const [session] = await pg.execute(`
        insert into pro_sessions
        (id, created_at, expires_at, first_url, llm_api_key)
        values
        ('${id}', now(), now(), '${first_url.replaceAll("'", "''")}', null)
    `);

    const { url } = await stripe.paymentLinks.create({
        line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
        after_completion: { type: "redirect", redirect: { url: `${BASE_URL}/process?pro_session_id=${id}` } },
        allow_promotion_codes: true,
        metadata: {
            pro_session_id: id
        }
    });


    res.json({
        url: url,
        id: id
    });
}
