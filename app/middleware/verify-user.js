const User = require("../api/models/user-model.js");
const oauth = require("../services/oauth.js");
const getAccessToken = require("../services/get-access-token.js");

// /**
// * Requests a new user access token from Discord's API
// *
// * @param {String} id - Discord user ID
// * @returns {Promise} - New access token
// */
// function getNewAccessToken(id){return new Promise((resolve, reject) => {

// 	User.findOne({id: id})
// 	.then(user => {
// 		return cryptr.decrypt(user.refresh_token);
// 	})
// 	.then(refresh_token => {
// 		return rp({
// 			method: 'POST',
// 			uri: `https://discordapp.com/api/oauth2/token?grant_type=refresh_token&client_id=${process.env.DISCORD_APP_ID}&client_secret=${process.env.DISCORD_APP_SECRET}&refresh_token=${refresh_token}`
// 		})
// 	})
// 	.then(data => {
// 		resolve(JSON.parse(data).access_token);
// 	})
// 	.catch(err => {
// 		reject(err);
// 	});

// })};

/**
 * Delete stored refresh token from database
 * If request is ajax, respond with 401, otherwise redirect to /login
 */
// function handleExpiredRefreshToken(req, res, next, options) {
//   User.findOne({ id: req.session.id })
//     .then((user) => {
//       user.refresh_token = "";
//       return user.save();
//     })
//     .then(() => {
//       if (options.ajax) return res.status(401).send("Unauthorized");
//       return res.redirect("/login");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// }

/**
 * Verify that request is coming from the correct user, or from official Sticker Surge bot
 *
 * options {Object}
 * - ajax {Boolean} - If true, request is ajax
 */
module.exports = (options = { ajax: false }) => {
  return async (req, res, next) => {
    // Verify bot acting on user's behalf
    let bot_auth = `Basic ${Buffer.from(
      process.env.DISCORD_BOT_TOKEN_HASH
    ).toString("base64")}`;

    if (req.headers.authorization && req.headers.authorization === bot_auth) {
      res.locals.userId = req.headers["author-id"]; // also add res.locals for user guilds
      return next();
    }

    // If there's no token or user ID, request user to log in
    if (!req.session.token || !req.session.id) {
      return options.ajax
        ? res.status(401).send("Unauthorized")
        : res.redirect("/login");
    }


    // Verify if user token is currently valid
    try {
      console.log('Trying to authenticate with Discord...')
      let data = await oauth.getUser(req.session.token);
      console.log(`Authenticated correctly. Hello, ${data.username}`);
      return next();
    } catch (err) {
      console.log('Token invalid!')
      // If user token is expired, get a new one using refresh token
      const now = new Date();
      console.log("Looking up user to get a new token");
      const user = await User.findOne({ id: req.session.id });
      if (user && user.token_expiry_time && user.token_expiry_time <= now) {
        const tokenResponse = await getAccessToken({ userId: req.session.id });
        req.session.token = tokenResponse.access_token;
        console.log(`New token assigned: ${tokenResponse.access_token}`);
        return next();
      } else {
        // If user token is invalid, and we can't use a refresh token to get a new one,
        // User must log in again
        console.log(`Token isn't old. So maybe it doesn't exist? Redirecting to log in again.`);
        return options.ajax
          ? res.status(401).send("Unauthorized")
          : res.redirect("/login");
      }
    }
  };
};
