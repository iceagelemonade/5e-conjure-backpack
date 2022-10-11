// import dependencies
const mongoose = require('./connection')

// import user model for populate
const User = require('./user')

// destructure the schema and model constructors from mongoose
const { Schema, model } = mongoose

const testSchema = new Schema(
	{

		name: String,
		desc: [],
		weight: String
		
	},
	{ timestamps: true }
)

const Test = model('Test', testSchema)

/////////////////////////////////
// Export our Model
/////////////////////////////////
module.exports = Test
