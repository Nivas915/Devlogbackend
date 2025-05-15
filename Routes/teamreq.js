const express = require('express');
const router = express.Router();
const TeamMembers = require('../Models/Teammembers'); // Adjust path if needed
const { verifyToken, isDeveloper } = require('../Middleware/authmiddleware');

// Developer requests to join a team
router.post('/request', verifyToken,isDeveloper, async (req, res) => {
 try {
    const developerId = req.user.id;
    const { teamId } = req.body;

    // Only developers can send request
    if (req.user.role !== 'Developer') {
      return res.status(403).json({ msg: 'Only developers can request to join teams' });
    }

    // Check if already requested or member of this team
    const existingRequest = await TeamMembers.findOne({ developerId, teamId });

    if (existingRequest) {
      return res.status(400).json({ msg: 'You have already requested or are a member of this team' });
    }

    // Add request with status 'pending'
    const teamRequest = new TeamMembers({
      developerId,
      teamId,
      status: 'pending',
      requestedAt: new Date(),
    });

    await teamRequest.save();

    res.json({ msg: 'Team join request sent', request: teamRequest });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
