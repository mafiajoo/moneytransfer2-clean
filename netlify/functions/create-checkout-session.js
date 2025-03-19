require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    try {
        console.log("Received request:", event.body);

        if (!event.body) {
            throw new Error("Request body is empty.");
        }

        const { amount } = JSON.parse(event.body);
        if (!amount || amount <= 0) {
            throw new Error("Invalid amount provided.");
        }

        console.log(`Processing payment for amount: ${amount} USD`);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { name: "Money Transfer" },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: "https://moneyexchange.netlify.app/success",
            cancel_url: "https://moneyexchange.netlify.app/cancel",
        });

        console.log("Session created successfully:", session.id);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",  // Fix CORS issue
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ sessionId: session.id, url: session.url }),
        };
    } catch (error) {
        console.error("Error creating checkout session:", error.message);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
