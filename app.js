require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const connect = require("./lib/connect");
const Note = require("./Schema/contentSchema");
const Node = require("./Schema/treeSchema");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.type("json").send({ message: "Hello World!" }));

// gets all nodes
app.get("/nodes", async (req, res) => {
  await connect();
  const nodes = (await Node.find()).map((node) => ({
    ...node._doc,
    id: node.id,
  }));

  res.type("json").send(nodes);
});

// gets a file with a specific node(!) id
app.get("/notes/:id", async (req, res) => {
  await connect();
  try {
    const note = await Note.findOne({ node: req.params.id });
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    res.type("json").send(note);
  } catch (error) {
    res.type("json").send({ message: "Note not found." });
  }
});

// adds new "file"
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

// updates content of note
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

// adds new node
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

// adds new Child Node to selected node
app.post("/nodes/:id/addchild", async (req, res) => {
  await connect();
  const { nodeId } = req.body;
  const node = await Node.findById(req.params.id);
  node.children.push(nodeId);
  await node.save();
  res.type("json").send({ ...node._doc, id: node.id });
});

// removes a child node
app.post("/nodes/:id/removechild", async (req, res) => {
  try {
    await connect();
    const { nodeId } = req.body;
    const node = await Node.findById(req.params.id);
    console.log(node);
    node.children = node.children.filter(
      (child) => child.toString() !== nodeId
    );
    await node.save();
    console.log(node);
    return res.json({ msg: "ok" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ msg: "server error" });
  }

  // node.children = node.children.filter((child) => child._id !== nodeId);
});

const server = app.listen(port, () =>
  console.log(`Express app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
