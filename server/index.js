const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chat");
const outageRoutes = require("./routes/outage");
const routerRoutes = require("./routes/router");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.use("/api/chat", chatRoutes);
app.use("/api/outages", outageRoutes);
app.use("/api/router", routerRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});