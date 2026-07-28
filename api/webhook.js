export default async function handler(req, res) {
  // Handle GET request for Meta Webhook Verification
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // The verify token we want to use (can be overridden by environment variable)
    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "CapitalChronicleWebhookToken2026";

    if (mode && token) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("[Webhook] Verification successful!");
        // Return the challenge token as plain text as required by Meta
        res.setHeader("Content-Type", "text/plain");
        return res.status(200).send(challenge);
      } else {
        console.warn("[Webhook] Verification failed. Token mismatch.");
        return res.status(403).send("Forbidden: Verification failed. Token mismatch.");
      }
    }
    return res.status(400).send("Bad Request: Missing query parameters.");
  }

  // Handle POST request for incoming webhook events
  if (req.method === "POST") {
    try {
      const payload = req.body;
      console.log("[Webhook] Received event payload:", JSON.stringify(payload, null, 2));

      // Respond with 200 OK immediately as required by Meta Webhooks to prevent retries
      return res.status(200).json({ status: "success" });
    } catch (error) {
      console.error("[Webhook Error] Error processing event:", error.message);
      if (!res.headersSent) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  // Method Not Allowed for other HTTP methods
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method " + req.method + " Not Allowed" });
}
