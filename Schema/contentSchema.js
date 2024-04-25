const mongoose = require("mongoose");

const { Schema } = mongoose;

const noteSchema = new Schema(
  {
    content: { type: String },
    node: { type: Schema.Types.ObjectId, ref: "Node" },
  },
  { versionKey: false }
);

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

module.exports = Note;
