const oauth = require("./oauth.js");
const Cryptr = require("cryptr");
const User = require("../api/models/user-model.js");

const cryptr = new Cryptr(process.env.REFRESH_TOKEN_KEY);

/**
 * Uses the stored refresh token to get a new access token for the user
 *
 * @param {string} userId - ID of the user
 */
const refreshAccessToken = async (userId) => {
  let user = await User.findOne({ id: userId });
  const refreshToken = cryptr.decrypt(user.refresh_token);

  const tokenResponse = await oauth.tokenRequest({
    scope: ["identify", "guilds"],
    grantType: "refresh_token",
    refreshToken,
  });
  
  // MUST SAVE NEW REFRESH TOKEN HERE:
  // user.refresh_token = 
	
	return tokenResponse;
};

module.exports = refreshAccessToken;
