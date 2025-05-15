const express = require('express');
const router = express.Router();
const Log = require('../Models/Log');
const Team = require('../Models/Team');   // <-- import Team here
const Notification = require('../Models/Notification');
const User = require('../Models/User');  // for fetching managers
const { verifyToken, isManager, isDeveloper } = require('../Middleware/authmiddleware');

// Helper function to notify all managers
async function notifyAllManagers(message) {
  const managers = await User.find({ role: 'Manager' });
  const notifications = managers.map(manager => ({
    userId: manager._id,
    type: 'submission',
    message,
  }));
  await Notification.insertMany(notifications);
}

// Developer submits a new log
router.post('/', verifyToken, isDeveloper, async (req, res) => {
  try {
    const {
      managerId,
      teamId,
      developerId,
      logDescription,
      timeSpent,
      mood,
      blockers,
      submittedStatus,
      submittedAt,
    } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const newLog = new Log({
      managerId,
      teamId,
      developerId,
      logDescription,
      timeSpent,
      mood,
      blockers,
      submittedStatus: submittedStatus || false,
      submittedAt: submittedAt || new Date(),
      reviewedStatus: false,
    });

    await newLog.save();

    // Notify all managers about submission
    await notifyAllManagers(`${req.user.name} has submitted their daily log.`);

    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error submitting log:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Developer edits existing log
router.put('/:logId', verifyToken, isDeveloper, async (req, res) => {
  try {
    const { logId } = req.params;

    const log = await Log.findById(logId);
    if (!log) return res.status(404).json({ error: 'Log not found' });

    // Ensure only the developer who created the log can edit
    if (log.developerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this log' });
    }

    Object.assign(log, req.body);
    await log.save();

    // Notify all managers about update
    await notifyAllManagers(`${req.user.name} has updated their daily log.`);

    res.json(log);
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get logs with optional filters
router.get('/', verifyToken, async (req, res) => {
  try {
    const { developerId, teamId, submittedStatus, reviewedStatus, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (developerId) filter.developerId = developerId;
    if (teamId) filter.teamId = teamId;
    if (submittedStatus !== undefined) filter.submittedStatus = submittedStatus === 'true';
    if (reviewedStatus !== undefined) filter.reviewedStatus = reviewedStatus === 'true';

    const logs = await Log.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('developerId', 'name email')
      .populate('managerId', 'name email')
      .populate('teamId', 'name');

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manager reviews a log
router.patch('/:logId/review', verifyToken, isManager, async (req, res) => {
  try {
    const { logId } = req.params;
    const { feedback, reviewedStatus } = req.body;

    const log = await Log.findById(logId);
    if (!log) return res.status(404).json({ error: 'Log not found' });

    if (feedback !== undefined) log.feedback = feedback;
    if (reviewedStatus !== undefined) log.reviewedStatus = reviewedStatus;

    await log.save();

    // Notify developer that their log was reviewed
    await Notification.create({
      userId: log.developerId,
      type: 'feedback',
      message: `Your daily log was reviewed by ${req.user.name}.`,
    });

    res.json({ message: 'Log updated with feedback/review', log });
  } catch (error) {
    console.error('Error reviewing log:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
