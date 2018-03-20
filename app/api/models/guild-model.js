const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guildSchema = Schema({
	id: {type: String, unique: true, required: true},
	guildName: {type: String, required: true},
	icon: {type: String, default: null},
	commandPrefix: {type: String, default: '$', maxlength: 3},
	customStickers: [{
		name: {type: String, required: true, maxlength: 20},
		url: {type: String, required: true},
		uses: {type: Number, default: 0},
		creatorId: {type: String, required: true, default: 'unknown'},
		createdAt: {type: Date, default: Date.now},
		createdVia: {type: String, required: true, default: 'unknown'},
		groupType: {type: String, required: true, default: 'guild'},
		groupId: {type: String, required: true, default: 'unknown'}

	}],
	recentStickers: [String],
	stickerPacks: [String],
	guildManagerIds: [String],
	stickerManagerRole: {type: String, required: true, default: '@everyone'},
	stickerManagerIds: [String],
	isActive: {type: Boolean, default: true}
});

let Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;
