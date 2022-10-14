// Import Dependencies
const express = require('express')
const Example = require('../models/example')
const Campaign = require('../models/campaign')
const User = require('../models/user')
const Item = require('../models/item')
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
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	Campaign.create(req.body)
		.then(campaign => {
			
			res.render('campaigns/import', { campaign, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// get route for adding player to campaign
router.get('/addplayer', (req, res) => {
	req.session.currentBackpackId =''
	req.session.currentBackpackName = ''
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	Campaign.findById(currentCampaignId)
		.then(campaign => {
		res.render('campaigns/addplayer', { campaign, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } )
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
	})
// put route for adding players
router.put('/addplayer/:id', (req, res) => {
	const id = req.params.id
	console.log('an id: ',id)
	Campaign.findById(id)
		.then(campaign => {
			campaign.players.push(req.body.name)
			campaign.save()
			res.redirect('/backpacks')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// get route for removing player to campaign
router.get('/removeplayer', (req, res) => {
	req.session.currentBackpackId =''
	req.session.currentBackpackName = ''
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	Campaign.findById(currentCampaignId)
		.then(campaign => {
		res.render('campaigns/removeplayer', { campaign, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } )
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})
// put route for removing players
router.put('/removeplayer/:id', (req, res) => {
	const campaignId = req.params.id
	const playerName = req.body.name
	Campaign.findById(campaignId)
		.then(campaign => {
			for ( let i = 0; i < campaign.players.length; i++){
				if ( campaign.players[i] == playerName) {
					campaign.players.splice(i,1)
					i--
				}
			}
			campaign.save()
			res.redirect('/backpacks')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


// get route to go back to selection for new or existing campaign
router.get('/select', (req, res) => {
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	res.render('auth/select', { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } )
})

// put route for adding SRD(seeded) items to campaign
router.put('/import/:id', (req, res) => {
	const campaignId = req.params.id
	Item.find({ fromSeed: true})
		.then(items => {
			
			items.forEach(item => {
				console.log(item)
				item.inCampaign.push(campaignId)
				item.save()
			})
		})
		.then(items => {
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
			res.redirect(`../../backpacks/`)
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
