import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";

const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("Message Controller", () => {
  let mongoServer;
  let user1Id, user2Id;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    user1Id = new mongoose.Types.ObjectId();
    user2Id = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Message.deleteMany();
    await Conversation.deleteMany();
    jest.clearAllMocks();
  });

  test("sendMessage", async () => {
    const req = {
      body: {
        senderId: user1Id.toString(),
        receiverId: user2Id.toString(),
        message: "Hello",
      },
    };
    const res = mockResponse();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    const sentMessage = res.json.mock.calls[0][0];
    expect({
      senderId: sentMessage.senderId.toString(),
      receiverId: sentMessage.receiverId.toString(),
    }).toMatchObject({
      senderId: user1Id.toString(),
      receiverId: user2Id.toString(),
    });

    expect(sentMessage.message).toBeDefined();
    expect(sentMessage.encryptionKey).toBeDefined();
  });

  test("getMessages", async () => {
    const msg1 = new Message({
      senderId: user1Id,
      receiverId: user2Id,
      message: "Hi",
      encryptionKey: "",
    });
    msg1.encryptMessage();
    await msg1.save();

    const msg2 = new Message({
      senderId: user2Id,
      receiverId: user1Id,
      message: "Yo",
      encryptionKey: "",
    });
    msg2.encryptMessage();
    await msg2.save();

    const req = {
      params: {
        user1: user1Id.toString(),
        user2: user2Id.toString(),
      },
    };
    const res = mockResponse();

    await getMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const returnedMessages = res.json.mock.calls[0][0];
    const contents = returnedMessages.map((msg) => msg.message);
    expect(contents).toContain("Hi");
    expect(contents).toContain("Yo");
  });
});
