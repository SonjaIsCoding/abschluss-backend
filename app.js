require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const connect = require("./lib/connect");
const Note = require("./models/Note");
const Node = require("./models/Node");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.type("json").send({ message: "Hello World!" }));

app.get("/nodes", async (req, res) => {
  await connect();
  const nodes = (await Node.find()).map((node) => ({
    ...node._doc,
    id: node.id,
  }));

  res.type("json").send(nodes);
});

app.get("/notes/:id", async (req, res) => {
  await connect();
  try {
    const note = await Note.findOne({ node: req.params.id });
    res.type("json").send(note || { message: "Note not found." });
  } catch (error) {
    res.type("json").send({ message: "Note not found." });
  }
});

app.post("/notes", async (req, res) => {
  await connect();
  const { node } = req.body;
  const note = new Note({
    content: "",
    node,
  });
  await note.save();
  res.type("json").send(note);
});

app.put("/notes/:id", async (req, res) => {
  await connect();
  const { content } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    note.content = content;
    await note.save();
    res.type("json").send(note);
  } catch (error) {
    res.type("json").send({ message: "Note not changed." });
  }
});

app.post("/nodes", async (req, res) => {
  await connect();
  const { name, isBranch, parent } = req.body;
  const node = new Node({
    name,
    isBranch,
    parent,
    children: [],
  });
  await node.save();
  res.type("json").send({ ...node._doc, id: node.id });
});

app.patch("/nodes/:id", async (req, res) => {
  await connect();
  const { nodeId } = req.body;
  const node = await Node.findById(req.params.id);
  node.children.push(nodeId);
  await node.save();
  res.type("json").send({ ...node._doc, id: node.id });
});

const server = app.listen(port, () =>
  console.log(`Express app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
