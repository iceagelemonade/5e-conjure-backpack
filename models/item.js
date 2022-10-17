// import dependencies
const mongoose = require('./connection')

// import user model for populate
const User = require('./user')

// destructure the schema and model constructors from mongoose
const { Schema, model } = mongoose

const itemSchema = new Schema(
	{

		name: String,
		category: {
			type: String,
			required: true,
			enum: ['Weapon', 'Armor', 'Magic Item', 'Gear']
		},
		desc: String,
		weight: Number,
		cost: String,
		owner: {
			type: Schema.Types.ObjectID,
			ref: 'User',
		},
		inCampaign : [],
		fromSeed : {
			type: Boolean,
			required : true,
			default : false
		},
		isSecret: Boolean,
		secrets: String,

	},
	{ timestamps: true }
)

const Item = model('Item', itemSchema)

/////////////////////////////////
// Export our Model
/////////////////////////////////
module.exports = Item
