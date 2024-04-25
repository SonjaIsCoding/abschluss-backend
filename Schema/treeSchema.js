const mongoose = require("mongoose");

const { Schema } = mongoose;

const nodesSchema = new Schema(
  {
    name: { type: String },
    children: [{ type: Schema.Types.ObjectId, ref: "Node" }],
    isBranch: { type: Boolean },
    parent: { type: Schema.Types.ObjectId, ref: "Node" },
  },
  { versionKey: false }
);

const Node = mongoose.models.Node || mongoose.model("Node", nodesSchema);

module.exports = Node;
