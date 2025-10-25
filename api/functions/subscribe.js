import { createClient } from "@supabase/supabase-js";

// Vercel Serverless Function format: (req, res)
module.exports = async (req, res) => {
    // 1. Vercel uses req.method instead of event.httpMethod
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    try {
        // 2. Vercel parses the JSON body automatically into req.body
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Environment variables must be set in Vercel project settings
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { error } = await supabase.from("subscribe").insert([{ email }]);

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ message: "Subscription successful!" });

    } catch (error) {
        console.error("Subscription error:", error);
        return res.status(400).json({ error: 'Invalid request body or internal error.' });
    }
};