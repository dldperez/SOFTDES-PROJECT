const express = require("express");
const router = express.Router();

// Mock outage records with coordinates
let outages = [
  {
    id: 1,
    area: "Quezon City",
    lat: 14.6760,
    lng: 121.0437,
    status: "Investigating",
    severity: "high",
    affectedUsers: 240,
    estimatedRestoration: "2026-03-10 8:30 PM",
    lastUpdated: "2026-03-10 6:10 PM"
  },
  {
    id: 2,
    area: "Novaliches",
    lat: 14.7222,
    lng: 121.0364,
    status: "Monitoring",
    severity: "medium",
    affectedUsers: 120,
    estimatedRestoration: "2026-03-10 7:45 PM",
    lastUpdated: "2026-03-10 6:05 PM"
  },
  {
    id: 3,
    area: "Manila",
    lat: 14.5995,
    lng: 120.9842,
    status: "Resolved",
    severity: "low",
    affectedUsers: 60,
    estimatedRestoration: "Completed",
    lastUpdated: "2026-03-10 5:50 PM"
  }
];

router.get("/", (req, res) => {
  res.json(outages);
});

// Optional mock update endpoint for testing
router.post("/mock-update", (req, res) => {
  outages = outages.map((item) => {
    if (item.status === "Investigating") {
      return {
        ...item,
        status: "Monitoring",
        lastUpdated: new Date().toLocaleString()
      };
    }
    return item;
  });

  res.json({
    message: "Mock outage data updated.",
    outages
  });
});

module.exports = router;