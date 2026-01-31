const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get messages for a session (only if session is accepted/completed and user is participant)
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const isParticipant =
      session.mentorId.toString() === req.user._id.toString() ||
      session.learnerId.toString() === req.user._id.toString();
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not a participant in this session' });
    }
    if (!['accepted', 'rescheduled', 'completed'].includes(session.status)) {
      return res.status(403).json({ error: 'Chat is enabled only after session is accepted' });
    }
    const messages = await Chat.find({ sessionId: session._id })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Send message
router.post(
  '/',
  auth,
  [
    body('sessionId').isMongoId().withMessage('Valid session ID required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
      const session = await Session.findById(req.body.sessionId);
      if (!session) return res.status(404).json({ error: 'Session not found' });
      const isParticipant =
        session.mentorId.toString() === req.user._id.toString() ||
        session.learnerId.toString() === req.user._id.toString();
      if (!isParticipant) {
        return res.status(403).json({ error: 'Not a participant' });
      }
      if (!['accepted', 'rescheduled', 'completed'].includes(session.status)) {
        return res.status(403).json({ error: 'Chat enabled only after session is accepted' });
      }
      const chat = new Chat({
        sessionId: session._id,
        senderId: req.user._id,
        message: req.body.message,
      });
      await chat.save();
      const populated = await Chat.findById(chat._id).populate('senderId', 'name');
      res.status(201).json(populated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

module.exports = router;
