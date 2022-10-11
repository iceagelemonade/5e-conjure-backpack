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
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			const userId = req.session.userId
			
			res.render('campaigns/index', { campaigns, username, loggedIn, userId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


// index that shows only the user's examples
router.get('/mine', (req, res) => {
    // destructure user info from req.session
    const { username, userId, loggedIn } = req.session
	Campaign.find({ owner: userId })
		.then(campaigns => {
			res.render('campaigns/index', { campaigns, username, loggedIn })
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
	Campaign.findById(campaignId)
		.then(campaign => {
			
			res.redirect('/items')
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// updates session to have current campaign id
router.put('/:id/enter', (req, res) => {
	const campaignId = req.params.id
	const username = req.session.username
	const userId = req.session.userId
	const loggedIn = req.session.loggedIn
	req.session.currentCampaign = campaignId
	
	Campaign.findById(campaignId)
		.then(campaign => {
			if (campaign.owner == userId ) {
				req.session.isMaster = true
			}
			res.redirect(`/items`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})




// update route
router.put('/:id', (req, res) => {
	const exampleId = req.params.id
	req.body.ready = req.body.ready === 'on' ? true : false

	Campaign.findByIdAndUpdate(exampleId, req.body, { new: true })
		.then(campaign => {
			res.redirect(`/examples/${example.id}`)
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
