// Vercel Serverless Function format: (req, res)
module.exports = async (req, res) => {
    // Environment variables must be set in Vercel project settings
    const paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY;

    if (!paystackPublicKey) {
        // Use res.status().json() for Vercel
        return res.status(500).json({ error: 'Paystack public key is not configured.' });
    }

    return res.status(200).json({ publicKey: paystackPublicKey });
};