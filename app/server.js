require('dotenv').config({ path: require('find-config')('.env') });
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true });
const sessions = require('client-sessions');
const cors = require('cors');
const verifyUser = require('./middleware/verify-user.js')({ajax: false});
const setGuildsCookie = require('./middleware/set-guilds-cookie.js');

const app = express();
const port = 3000;


//Useful stack trace for unhandledRejection errors
process.on('unhandledRejection', r => console.error(r));

//DB init
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/stickers-for-discord', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', err => {if(err) throw err});

//Middleware
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(cors());
app.use(sessions({
	cookieName: 'session',
	secret: process.env.SESSION_SECRET,
	duration: 365 * 24 * 60 * 60 * 1000,
	cookie: {
		httpOnly: true
	}
}));

//Public dir 
app.use('/', express.static(`${__dirname}/public`));

//Sitemap
app.use('/sitemap.xml', require('./routes/sitemap.js'));

//Routes
app.use('/login', require('./routes/auth.js').login);
app.use('/logout', require('./routes/auth.js').logout);
app.use('/callback', require('./routes/auth.js').callback);

app.get('/stickers', verifyUser, (req, res) => {	
	res.redirect(`/user/${req.session.id}`);
});

app.get('/undefined', (req, res) => {
	res.redirect('/');
});

//API
app.use('/api/users', require('./api/users.js'));
app.use('/api/guilds', require('./api/guilds.js'));
app.use('/api/sticker-packs', require('./api/sticker-packs.js'));

app.use('/api/stats', require('./api/stats.js'));
app.get('/api/set-guilds', verifyUser, setGuildsCookie, (req, res) => {
	res.send('Guilds cookie updated');
});
// app.get('/api/update-user-info', verifyUser, setUserAvatar, (req, res) => {
// 	res.send({
// 		updated: res.locals.updated,
// 		username: res.locals.username,
// 		avatar: res.locals.avatar
// 	});
// });
app.get('/api/invalidate-token', (req, res) => {
	req.session.token = 'invalidated';
	res.send('Token invalidated');
});
app.get('/api/check-token', (req, res) => {	
	res.send(req.session.token);
});
app.get('/api/dbl-integrated', (req, res) => {
	res.send({dbl_integrated: !!process.env.TOPGG_ENABLED});
});

//Redirect all other traffic to app root
app.get('*', (req, res) => {
	res.sendFile(`${__dirname}/public/index.html`);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}!`);
});
