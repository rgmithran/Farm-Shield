const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/disease", require("./routes/diseaseRoutes"));
app.use("/api/weather", require("./routes/weatherRoutes"));
app.use("/api/crops", require("./routes/cropRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/forum", require("./routes/forumRoutes"));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Connection Error: ", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
