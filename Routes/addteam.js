const express = require('express');
const router = express.Router();
const Team = require('../Models/Team');
const { verifyToken, isManager } = require('../Middleware/authmiddleware');

// POST /api/manager/team/add
router.post('/add', verifyToken, isManager, async (req, res) => {
  try {
    const { name } = req.body;
    const managerId = req.user.id;

    if (!name) {
      return res.status(400).json({ msg: 'Team name is required' });
    }

    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ msg: 'Team name already exists' });
    }

    const newTeam = new Team({
      name,
      managerId,
      createdAt: new Date(),
    });

    await newTeam.save();

    res.json({ msg: 'Team created successfully', team: newTeam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
