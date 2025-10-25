exports.handler = async function(event, context) {
    const paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY;

    if (!paystackPublicKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Paystack public key is not configured.' }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ publicKey: paystackPublicKey }),
    };
};