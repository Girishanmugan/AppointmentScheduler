const twilio = require('twilio');

const generateVideoToken = (identity, room) => {
  const AccessToken = twilio.jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;

  const videoGrant = new VideoGrant({ room });
  
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity }
  );
  
  token.addGrant(videoGrant);
  return token.toJwt();
};

module.exports = { generateVideoToken };
