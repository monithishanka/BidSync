const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { isAuthenticated } = require('../middleware/auth');

// GET /api/notifications - Get user notifications
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    
    let query = { user: req.session.userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: req.session.userId, isRead: false })
    ]);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', isAuthenticated, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.session.userId,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/notifications/:id/read - Mark as read
router.put('/:id/read', isAuthenticated, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.session.userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ notification });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', isAuthenticated, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.session.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.session.userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
