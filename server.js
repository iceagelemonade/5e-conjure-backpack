////////////////////
//  Dependencies  //
////////////////////
require("dotenv").config() // make env variables available
const express = require("express")
const middleware = require('./utils/middleware')
const ItemRouter = require('./controllers/item')
const UserRouter = require('./controllers/user')
const CampaignRouter = require('./controllers/campaign')
const BackpackRouter = require('./controllers/backpack')
const User = require("./models/user")
// SEE MORE DEPENDENCIES IN ./utils/middleware.js
// user and resource routes linked in ./utils/middleware.js

//////////////////////////////
// Middleware + App Object  //
//////////////////////////////
const app = require("liquid-express-views")(express())

middleware(app)

////////////////////
//    Routes      //
////////////////////

app.use('/auth', UserRouter)
app.use('/items', ItemRouter)
app.use('/campaigns', CampaignRouter)
app.use('/backpacks', BackpackRouter)

app.get('/', (req, res) => {
	req.session.currentCampaignName = ''
	req.session.currentCampaignId = ''
	req.session.currentBackpackName = ''
	req.session.currentBackpackId = ''
	req.session.isMaster = false
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	res.render('index.liquid', {username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
})

app.get('/help', (req, res) => {
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	res.render('help.liquid', { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
})


app.get('/error', (req, res) => {
	const error = req.query.error || 'This Page Does Not Exist'
    const { username, loggedIn, userId } = req.session
	res.render('error.liquid', { error, username, loggedIn, userId })
})

// if page is not found, send to error page
app.all('*', (req, res) => {
	res.redirect('/error')
})



//////////////////////////////
//      App Listener        //
//////////////////////////////
app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`)
})