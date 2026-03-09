const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Message is required." });
  }

  const text = message.toLowerCase();

  if (
    text.includes("outage") ||
    text.includes("walang internet") ||
    text.includes("no internet")
  ) {
    return res.json({
      intent: "check_outage",
      reply: "There may be a service issue in your area. Please check the outage page for updates."
    });
  }

  if (
    text.includes("router") ||
    text.includes("wifi") ||
    text.includes("password") ||
    text.includes("reset")
  ) {
    return res.json({
      intent: "router_help",
      reply: "I can help with router setup or troubleshooting. Please visit the Router Setup page."
    });
  }

  return res.json({
    intent: "fallback",
    reply: "Thanks for your message. Please describe your issue in more detail."
  });
});

module.exports = router;