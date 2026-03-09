const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const outages = [
    {
      id: 1,
      area: "Manila",
      status: "Investigating",
      estimatedRestoration: "6:00 PM"
    },
    {
      id: 2,
      area: "Quezon City",
      status: "Monitoring",
      estimatedRestoration: "8:30 PM"
    },
    {
      id: 3,
      area: "Novaliches",
      status: "Resolved",
      estimatedRestoration: "Completed"
    }
  ];

  res.json(outages);
});

module.exports = router;