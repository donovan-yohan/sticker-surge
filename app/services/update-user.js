const oauth = require("./oauth.js");
const User = require("../api/models/user-model.js");

const updateUser = async (accessToken) => {
  const discordUserInfo = await oauth.getUser(accessToken);
  const { id, username, avatar } = discordUserInfo;

  await User.findOneAndUpdate(
    { id },
    { id, username, avatar },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { id, username, avatar };
};

module.exports = updateUser;
