const mongoose = require("mongoose");

const SecretSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  key: {
    type: String,
  },
});

const Secret = mongoose.model("Secret", SecretSchema);

module.exports = Secret;
