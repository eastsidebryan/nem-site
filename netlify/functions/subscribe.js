import { createClient } from "@supabase/supabase-js";

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { email } = JSON.parse(event.body);

        if (!email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Email is required" }),
            };
        }

        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { error } = await supabase.from("subscribe").insert([{ email }]);

        if (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Subscription successful!" }),
        };

    } catch (error) {
        console.error("Subscription error:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid request body.' }),
        };
    }
};