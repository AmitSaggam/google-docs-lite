const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  _id: String,
  name: {
    type: String,
    default: "Untitled Document"
  },
  data: Object,
});

module.exports = mongoose.model("Document", DocumentSchema);
