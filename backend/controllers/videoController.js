const { generateVideoToken } = require('../utils/twilio');

exports.getVideoToken = async (req, res) => {
  try {
    const { room, identity } = req.body;

    if (!room || !identity) {
      return res.status(400).json({ 
        error: 'Room name and identity are required' 
      });
    }

    const token = generateVideoToken(identity, room);
    
    res.json({ 
      token, 
      room,
      identity 
    });
  } catch (error) {
    console.error('Error generating video token:', error);
    res.status(500).json({ 
      error: 'Failed to generate video token' 
    });
  }
};
