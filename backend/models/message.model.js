import mongoose from "mongoose";
import crypto from "crypto";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    encryptionKey: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

messageSchema.methods.encryptMessage = function () {
  const key = crypto.randomBytes(32).toString("hex");
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    Buffer.from(key, "hex"),
    Buffer.alloc(16, 0)
  );
  this.message =
    cipher.update(this.message, "utf8", "hex") + cipher.final("hex");
  this.encryptionKey = key;
};

messageSchema.methods.decryptMessage = function () {
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    Buffer.from(this.encryptionKey, "hex"),
    Buffer.alloc(16, 0)
  );
  this.message =
    decipher.update(this.message, "hex", "utf8") + decipher.final("utf8");
};

const Message = mongoose.model("Message", messageSchema);
export default Message;
