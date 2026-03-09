const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const guides = [
    {
      step: 1,
      instruction: "Connect your router to the modem using an Ethernet cable."
    },
    {
      step: 2,
      instruction: "Open your browser and go to 192.168.1.1."
    },
    {
      step: 3,
      instruction: "Login using your router username and password."
    },
    {
      step: 4,
      instruction: "Configure WiFi name and password."
    }
  ];

  res.json(guides);
});

module.exports = router;