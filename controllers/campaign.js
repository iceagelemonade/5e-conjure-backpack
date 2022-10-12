// Import Dependencies
const express = require('express')
const Example = require('../models/example')
const Campaign = require('../models/campaign')
const User = require('../models/user')
const axios = require('axios').default


// Create router
const router = express.Router()

// Router Middleware
// Authorization middleware
// If you have some resources that should be accessible to everyone regardless of loggedIn status, this middleware can be moved, commented out, or deleted. 
router.use((req, res, next) => {
	// checking the loggedIn boolean of our session
	if (req.session.loggedIn) {
		// if they're logged in, go to the next thing(thats the controller)
		next()
	} else {
		// if they're not logged in, send them to the login page
		res.redirect('/auth/login')
	}
})

// Routes

// index ALL
router.get('/', (req, res) => {
	Campaign.find({})
		.then(campaigns => {
			req.session.currentCampaignName = ''
			req.session.currentCampaignId = ''
			req.session.currentBackpackName = ''
			req.session.currentBackpackId = ''
			const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
			res.render('campaigns/index', { campaigns, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


// new route -> GET route that renders our page with the form
router.get('/new', (req, res) => {
	const { username, userId, loggedIn } = req.session
	res.render('campaigns/new', { username, loggedIn, userId })
})

// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {
	console.log(req.body)
	req.body.owner = req.session.userId
	Campaign.create(req.body)
		.then(campaign => {
			console.log('this was returned from create', campaign)
			res.redirect('/campaigns')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// edit route -> GET that takes us to the edit form view
router.get('/:id/edit', (req, res) => {
	// we need to get the id
	const campaignId = req.params.id
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	Campaign.findById(campaignId)
		.then(campaign => {
			res.render('campaigns/edit', { campaign, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// updates session to have current campaign id
router.put('/:id/enter', (req, res) => {
	const campaignId = req.params.id
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	Campaign.findById(campaignId)
		.then(campaign => {
			req.session.currentCampaignId = campaign.id
			req.session.currentCampaignName = campaign.name
			if (campaign.owner == userId ) {
				req.session.isMaster = true
			}
			res.render(`/backpacks/index`, { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } )
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})




// update route
router.put('/:id', (req, res) => {
	const campaignId = req.params.id

	Campaign.findByIdAndUpdate(campaignId, { name: req.body.name, description: req.body.description}, { new: true })
		.then(campaign => {
			res.redirect('/campaigns')
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// show route
router.get('/:id', (req, res) => {
	const exampleId = req.params.id
	Campaign.findById(exampleId)
		.then(campaign => {
            const {username, loggedIn, userId} = req.session
			res.render('campaigns/show', { campaign, username, loggedIn, userId })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// delete route
router.delete('/:id', (req, res) => {
	const exampleId = req.params.id
	Campaign.findByIdAndRemove(exampleId)
		.then(campaign => {
			res.redirect('/campaigns')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// Export the Router
module.exports = router
