// import dependencies
const mongoose = require('./connection')

// import user model for populate
const User = require('./user')

// destructure the schema and model constructors from mongoose
const { Schema, model } = mongoose

const campaignSchema = new Schema(
	{

		name: String,
		owner: {
			type: Schema.Types.ObjectID,
			ref: 'User',
		},
		players : []
	},
	{ timestamps: true }
)

const Campaign = model('Campaign', campaignSchema)

/////////////////////////////////
// Export our Model
/////////////////////////////////
module.exports = Campaign
