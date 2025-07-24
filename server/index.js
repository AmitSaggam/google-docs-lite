const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();

const Document = require("./models/Document");

const app = express();

// ✅ CORS whitelist
const allowedOrigins = [
  "https://google-docs-lite-topaz.vercel.app",
  "https://google-docs-lite-git-main-amit-saggams-projects.vercel.app",
  "https://google-docs-lite-9kp669n5u-amit-saggams-projects.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// 📦 REST API

app.get("/documents", async (req, res) => {
  const docs = await Document.find({}, "_id name");
  res.json(docs);
});

app.post("/documents", async (req, res) => {
  const { _id } = req.body;
  const doc = await Document.create({
    _id,
    name: "Untitled Document",
    data: ""
  });
  res.json(doc);
});

app.put("/documents/:id", async (req, res) => {
  const { name } = req.body;
  await Document.findByIdAndUpdate(req.params.id, { name });
  res.json({ success: true });
});

app.delete("/documents/:id", async (req, res) => {
  try {
    console.log("Deleting document:", req.params.id);
    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ success: false, message: "Error deleting document." });
  }
});

// ⚡ Real-time Collaboration
io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  if (!id) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: "", name: "Untitled Document" });
}

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
