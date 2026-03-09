const express = require("express");
const router = express.Router();

// Simple in-memory session store
// Note: resets when the server restarts
const sessions = {};

function getSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      pendingAction: null,
      lastIntent: null,
      customerInfo: {
        location: null,
        accountNumber: null,
        billingType: null,
        losStatus: null
      }
    };
  }
  return sessions[sessionId];
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(message) {
  let text = message.toLowerCase().trim();

  // Keep letters, numbers, spaces
  text = text.replace(/[^\w\s]/g, " ");

  const typoMap = {
    wlang: "walang",
    walng: "walang",
    kamsta: "kamusta",
    kumsta: "kumusta",
    helo: "hello",
    helloo: "hello",
    routr: "router",
    modm: "modem",
    pasword: "password",
    passwrd: "password",
    conection: "connection",
    bilng: "billing",
    qc: "quezon city"
  };

  const words = text.split(/\s+/).map((word) => typoMap[word] || word);
  text = words.join(" ");

  const phraseMap = [
    { from: "wala internet", to: "no internet" },
    { from: "walang internet", to: "no internet" },
    { from: "wala kaming internet", to: "no internet" },
    { from: "walang internet kami", to: "no internet" },
    { from: "wala po kaming internet", to: "no internet" },
    { from: "walang net", to: "no internet" },
    { from: "wala net", to: "no internet" },
    { from: "no signal", to: "no internet" },
    { from: "no connection", to: "no internet" },

    { from: "mahina internet", to: "slow internet" },
    { from: "mahina wifi", to: "slow internet" },
    { from: "mahina net", to: "slow internet" },
    { from: "mabagal internet", to: "slow internet" },
    { from: "mabagal wifi", to: "slow internet" },
    { from: "bagal ng internet", to: "slow internet" },

    { from: "red light", to: "red los" },
    { from: "los red", to: "red los" },

    { from: "palit password", to: "change password" },
    { from: "change wifi pass", to: "change password" },
    { from: "change wifi password", to: "change password" },
    { from: "baguhin password", to: "change password" },

    { from: "reset modem", to: "reset router" },
    { from: "restart modem", to: "restart router" }
  ];

  for (const rule of phraseMap) {
    text = text.replace(new RegExp(`\\b${escapeRegExp(rule.from)}\\b`, "g"), rule.to);
  }

  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function detectIntent(text) {
  const intentPatterns = {
    greeting: [
      { phrase: "hello", weight: 3 },
      { phrase: "hi", weight: 2 },
      { phrase: "hey", weight: 2 },
      { phrase: "kamusta", weight: 3 },
      { phrase: "kumusta", weight: 3 }
    ],
    no_internet: [
      { phrase: "no internet", weight: 5 },
      { phrase: "cannot connect", weight: 3 },
      { phrase: "cant connect", weight: 3 },
      { phrase: "disconnected", weight: 2 }
    ],
    check_outage: [
      { phrase: "outage", weight: 4 },
      { phrase: "service interruption", weight: 4 },
      { phrase: "may outage", weight: 4 },
      { phrase: "red los", weight: 4 },
      { phrase: "network down", weight: 4 }
    ],
    slow_internet: [
      { phrase: "slow internet", weight: 5 },
      { phrase: "buffering", weight: 2 },
      { phrase: "lag", weight: 2 },
      { phrase: "unstable connection", weight: 3 }
    ],
    router_help: [
      { phrase: "router", weight: 2 },
      { phrase: "modem", weight: 2 },
      { phrase: "setup router", weight: 4 },
      { phrase: "configure router", weight: 4 },
      { phrase: "reset router", weight: 4 },
      { phrase: "restart router", weight: 4 }
    ],
    change_wifi_password: [
      { phrase: "change password", weight: 5 },
      { phrase: "wifi password", weight: 3 }
    ],
    billing: [
      { phrase: "billing", weight: 4 },
      { phrase: "bill", weight: 3 },
      { phrase: "payment", weight: 3 },
      { phrase: "invoice", weight: 3 },
      { phrase: "due date", weight: 3 },
      { phrase: "balance", weight: 3 }
    ]
  };

  const scores = {};
  const matchedKeywords = {};

  for (const intent in intentPatterns) {
    scores[intent] = 0;
    matchedKeywords[intent] = [];

    for (const rule of intentPatterns[intent]) {
      if (text.includes(rule.phrase)) {
        scores[intent] += rule.weight;
        matchedKeywords[intent].push(rule.phrase);
      }
    }
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestIntent, bestScore] = ranked[0];
  const secondScore = ranked[1] ? ranked[1][1] : 0;

  if (bestScore === 0) {
    return {
      intent: "fallback",
      confidence: 0,
      matchedKeywords: []
    };
  }

  if (bestScore === secondScore || bestScore < 2) {
    return {
      intent: "clarify",
      confidence: bestScore,
      matchedKeywords: matchedKeywords[bestIntent]
    };
  }

  return {
    intent: bestIntent,
    confidence: bestScore,
    matchedKeywords: matchedKeywords[bestIntent]
  };
}

function extractEntities(text) {
  const entities = {
    location: null,
    accountNumber: null,
    billingType: null,
    losStatus: null
  };

  const locations = [
    "manila",
    "quezon city",
    "novaliches",
    "diliman",
    "caloocan",
    "makati",
    "pasig",
    "taguig"
  ];

  const billingTypes = [
    "balance",
    "due date",
    "payment",
    "invoice",
    "reconnection",
    "disconnection"
  ];

  for (const location of locations) {
    if (text.includes(location)) {
      entities.location = location;
      break;
    }
  }

  for (const type of billingTypes) {
    if (text.includes(type)) {
      entities.billingType = type;
      break;
    }
  }

  if (
    text.includes("red los") ||
    text.includes("los is red") ||
    text.includes("yes red") ||
    text.includes("red")
  ) {
    entities.losStatus = "red";
  } else if (
    text.includes("not red") ||
    text.includes("green") ||
    text.includes("normal") ||
    text.includes("no red")
  ) {
    entities.losStatus = "normal";
  }

  const accountMatch = text.match(/\b\d{6,12}\b/);
  if (accountMatch) {
    entities.accountNumber = accountMatch[0];
  }

  return entities;
}

function maskAccountNumber(accountNumber) {
  if (!accountNumber) return "";
  if (accountNumber.length <= 4) return accountNumber;
  return "****" + accountNumber.slice(-4);
}

function buildResponse(payload) {
  return {
    originalMessage: payload.originalMessage,
    normalizedText: payload.normalizedText,
    intent: payload.intent,
    confidence: payload.confidence,
    matchedKeywords: payload.matchedKeywords || [],
    entities: payload.entities || {},
    reply: payload.reply,
    nextAction: payload.nextAction || "none"
  };
}

router.post("/", (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({
      intent: "error",
      confidence: 0,
      entities: {},
      matchedKeywords: [],
      reply: "Message is required.",
      nextAction: "none"
    });
  }

  const activeSessionId = sessionId || "default-session";
  const session = getSession(activeSessionId);

  const normalizedText = normalizeText(message);
  const entities = extractEntities(normalizedText);

  // 1. Handle pending flows first
  if (session.pendingAction === "ask_location") {
    if (!entities.location) {
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: "ask_location",
          confidence: 1,
          entities,
          reply: "Please provide your area or location, like Manila, Quezon City, or Novaliches.",
          nextAction: "ask_location"
        })
      );
    }

    session.customerInfo.location = entities.location;

    if (session.lastIntent === "no_internet") {
      session.pendingAction = "ask_los_status";
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: "no_internet",
          confidence: 5,
          entities,
          reply: `Thank you. I noted your location as ${entities.location}. Is your LOS light red?`,
          nextAction: "ask_los_status"
        })
      );
    }

    if (session.lastIntent === "check_outage") {
      session.pendingAction = null;
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: "check_outage",
          confidence: 5,
          entities,
          reply: `Thank you. There may be a service interruption in ${entities.location}. Please check the Outage Map page for updates.`,
          nextAction: "outage"
        })
      );
    }
  }

  if (session.pendingAction === "ask_los_status") {
    if (!entities.losStatus) {
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: "ask_los_status",
          confidence: 1,
          entities,
          reply: "Please tell me if your LOS light is red or not red.",
          nextAction: "ask_los_status"
        })
      );
    }

    session.customerInfo.losStatus = entities.losStatus;

    if (entities.losStatus === "red") {
      session.pendingAction = null;
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: "no_internet",
          confidence: 5,
          entities,
          reply: `A red LOS light usually means a line or outage issue${
            session.customerInfo.location ? ` in ${session.customerInfo.location}` : ""
          }. Please check the Outage Map. If you want account-specific verification, I can also ask for your account number.`,
          nextAction: "outage"
        })
      );
    }

    session.pendingAction = "ask_account_number";
    return res.json(
      buildResponse({
        originalMessage: message,
        normalizedText,
        intent: "no_internet",
        confidence: 5,
        entities,
        reply: "Thank you. Since the LOS light is not red, this may need account verification. Please provide your account number.",
        nextAction: "ask_account_number"
      })
    );
  }

  if (session.pendingAction === "ask_account_number") {
    if (!entities.accountNumber) {
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: "ask_account_number",
          confidence: 1,
          entities,
          reply: "Please provide your account number using digits only.",
          nextAction: "ask_account_number"
        })
      );
    }

    session.customerInfo.accountNumber = entities.accountNumber;

    if (session.lastIntent === "billing") {
      session.pendingAction = "ask_billing_type";
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: "billing",
          confidence: 5,
          entities,
          reply: `Thank you. I noted account number ${maskAccountNumber(
            entities.accountNumber
          )}. Is your billing concern about balance, due date, payment, invoice, reconnection, or disconnection?`,
          nextAction: "ask_billing_type"
        })
      );
    }

    if (session.lastIntent === "no_internet") {
      session.pendingAction = null;
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: "no_internet",
          confidence: 5,
          entities,
          reply: `Thank you. I noted account number ${maskAccountNumber(
            entities.accountNumber
          )}. Your concern may now need account-specific verification by support.`,
          nextAction: "none"
        })
      );
    }

    session.pendingAction = null;
    return res.json(
      buildResponse({
        originalMessage: message,
        normalizedText,
        intent: session.lastIntent || "account_verification",
        confidence: 5,
        entities,
        reply: `Thank you. I noted account number ${maskAccountNumber(entities.accountNumber)}.`,
        nextAction: "none"
      })
    );
  }

  if (session.pendingAction === "ask_billing_type") {
    if (!entities.billingType) {
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: "billing",
          confidence: 1,
          entities,
          reply: "Please tell me if your billing concern is about balance, due date, payment, invoice, reconnection, or disconnection.",
          nextAction: "ask_billing_type"
        })
      );
    }

    session.customerInfo.billingType = entities.billingType;
    session.pendingAction = null;

    return res.json(
      buildResponse({
        originalMessage: message,
        normalizedText,
        intent: "billing",
        confidence: 5,
        entities,
        reply: `Thank you. I noted that your billing concern is about ${entities.billingType} for account ${maskAccountNumber(
          session.customerInfo.accountNumber
        )}.`,
        nextAction: "none"
      })
    );
  }

  // 2. Normal intent detection
  const detected = detectIntent(normalizedText);

  session.lastIntent = detected.intent;
  if (entities.location) session.customerInfo.location = entities.location;
  if (entities.accountNumber) session.customerInfo.accountNumber = entities.accountNumber;

  switch (detected.intent) {
    case "greeting":
      session.pendingAction = null;
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: detected.intent,
          confidence: detected.confidence,
          matchedKeywords: detected.matchedKeywords,
          entities,
          reply: "Hello! I’m your PLDT Smart Support assistant. How can I help you today?",
          nextAction: "none"
        })
      );

    case "no_internet":
      if (!session.customerInfo.location && !entities.location) {
        session.pendingAction = "ask_location";
        return res.json(
          buildResponse({
            originalMessage: message,
            normalizedText,
            intent: detected.intent,
            confidence: detected.confidence,
            matchedKeywords: detected.matchedKeywords,
            entities,
            reply: "I can help with your no internet concern. What is your location?",
            nextAction: "ask_location"
          })
        );
      }

      session.pendingAction = "ask_los_status";
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: detected.intent,
          confidence: detected.confidence,
          matchedKeywords: detected.matchedKeywords,
          entities,
          reply: `I noted your location as ${
            entities.location || session.customerInfo.location
          }. Is your LOS light red?`,
          nextAction: "ask_los_status"
        })
      );

    case "check_outage":
      if (!session.customerInfo.location && !entities.location) {
        session.pendingAction = "ask_location";
        return res.json(
          buildResponse({
            originalMessage: message,
            normalizedText,
            intent: detected.intent,
            confidence: detected.confidence,
            matchedKeywords: detected.matchedKeywords,
            entities,
            reply: "I can check outage-related concerns. What is your location?",
            nextAction: "ask_location"
          })
        );
      }

      session.pendingAction = null;
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: detected.intent,
          confidence: detected.confidence,
          matchedKeywords: detected.matchedKeywords,
          entities,
          reply: `There may be a service interruption in ${
            entities.location || session.customerInfo.location
          }. Please check the Outage Map page for updates.`,
          nextAction: "outage"
        })
      );

    case "slow_internet":
      session.pendingAction = null;
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: detected.intent,
          confidence: detected.confidence,
          matchedKeywords: detected.matchedKeywords,
          entities,
          reply:
            "I can help with slow internet. Please try restarting your router, checking the signal lights, and reducing connected devices. You may also open the Router Setup page.",
          nextAction: "router"
        })
      );

    case "router_help":
      session.pendingAction = null;
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: detected.intent,
          confidence: detected.confidence,
          matchedKeywords: detected.matchedKeywords,
          entities,
          reply: "I detected a router concern. Please open the Router Setup page for guided troubleshooting.",
          nextAction: "router"
        })
      );

    case "change_wifi_password":
      session.pendingAction = null;
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: detected.intent,
          confidence: detected.confidence,
          matchedKeywords: detected.matchedKeywords,
          entities,
          reply:
            "I can help you change your WiFi password. Please open the Router Setup page and log in to your router admin panel.",
          nextAction: "router"
        })
      );

    case "billing":
      if (!session.customerInfo.accountNumber && !entities.accountNumber) {
        session.pendingAction = "ask_account_number";
        return res.json(
          buildResponse({
            originalMessage: message,
            normalizedText,
            intent: detected.intent,
            confidence: detected.confidence,
            matchedKeywords: detected.matchedKeywords,
            entities,
            reply: "I can help with billing. May I have your account number?",
            nextAction: "ask_account_number"
          })
        );
      }

      session.pendingAction = "ask_billing_type";
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: detected.intent,
          confidence: detected.confidence,
          matchedKeywords: detected.matchedKeywords,
          entities,
          reply: `Thank you. I noted account number ${maskAccountNumber(
            entities.accountNumber || session.customerInfo.accountNumber
          )}. Is your billing concern about balance, due date, payment, invoice, reconnection, or disconnection?`,
          nextAction: "ask_billing_type"
        })
      );

    case "clarify":
      session.pendingAction = null;
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: detected.intent,
          confidence: detected.confidence,
          matchedKeywords: detected.matchedKeywords,
          entities,
          reply:
            "I’m not fully sure yet. Is your concern about no internet, slow internet, outage, router setup, WiFi password, or billing?",
          nextAction: "clarify"
        })
      );

    default:
      session.pendingAction = null;
      return res.json(
        buildResponse({
          originalMessage: message,
          normalizedText,
          intent: "fallback",
          confidence: 0,
          matchedKeywords: [],
          entities,
          reply:
            "Sorry, I could not clearly identify your concern. Please tell me if your issue is about outage, no internet, slow internet, router setup, WiFi password, or billing.",
          nextAction: "clarify"
        })
      );
  }
});

module.exports = router;