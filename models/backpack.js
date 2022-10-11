// import dependencies
const mongoose = require('./connection')

// import user model for populate
const User = require('./user')
// import campaign model for populate
const Campaign = require('./campaign')


// destructure the schema and model constructors from mongoose
const { Schema, model } = mongoose

const backpackSchema = new Schema(
	{
		characterName: String,
		owner: {
			type: Schema.Types.ObjectID,
			ref: 'User',
		},
		campaign: {
			type: Schema.Types.ObjectID,
			ref: 'Campaign',
		},
		items : []
	},
	{ timestamps: true }
)

const Backpack = model('Backpack', backpackSchema)

/////////////////////////////////
// Export our Model
/////////////////////////////////
module.exports = Backpack
