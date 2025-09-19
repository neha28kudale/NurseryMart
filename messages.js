const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Get conversations for current user (list of other users with last message and unread count)
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: 1 });

    const convMap = new Map();

    for (const msg of messages) {
      const other = msg.sender._id.equals(userId) ? msg.receiver : msg.sender;
      const key = other._id.toString();
      if (!convMap.has(key)) {
        convMap.set(key, { user: other, messages: [] });
      }
      convMap.get(key).messages.push(msg);
    }

    const conversations = Array.from(convMap.values()).map((c) => {
      const unreadCount = c.messages.filter(
        (m) => m.receiver._id.equals(userId) && !m.read
      ).length;
      return {
        user: c.user,
        lastMessage: c.messages[c.messages.length - 1],
        unreadCount
      };
    });

    conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.json({ success: true, data: { conversations } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load conversations' });
  }
});

// Get messages with a specific user
router.get('/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.otherUserId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: { messages } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load messages' });
  }
});

// Send a message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text) {
      return res.status(400).json({ success: false, message: 'receiverId and text are required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    const msg = await Message.create({ sender: req.user._id, receiver: receiverId, text });
    await msg.populate('sender', 'name email role');
    await msg.populate('receiver', 'name email role');

    res.status(201).json({ success: true, data: { message: msg } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Mark messages with other user as read
router.post('/:otherUserId/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.otherUserId;
    await Message.updateMany({ receiver: userId, sender: otherUserId, read: false }, { $set: { read: true } });
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

module.exports = router;


