// Import Dependencies
const express = require('express')
const Campaign = require('../models/campaign')
const Backpack = require('../models/backpack')
// Nit: remove unused User
const User = require('../models/user')
const Item = require('../models/item')
// Nit: remove unused unused `axios` call
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
			req.session.isMaster = false
			const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
			res.render('campaigns/index', { campaigns, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


// new route -> GET route that renders page with the form
router.get('/new', (req, res) => {
	const { username, userId, loggedIn } = req.session
	res.render('campaigns/new', { username, loggedIn, userId })
})

// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {
	// Nit: remove console.log 
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
	// Nit: remove console.log
	console.log('an id: ',id)
	Campaign.findById(id)
		.then(campaign => {
			if (!campaign.players.includes(req.body.name)) {
				campaign.players.push(req.body.name)
				// should return here
				campaign.save()
			}
			// Since you will have to return above this will become `unreachable code` move this to the next `.then()` in the promise chain.
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
			// Should return here. Best practice for Mongoose `.save()`
			campaign.save()
			
			// Since you will have to return above this will become `unreachable code` move this to the next `.then()` in the promise chain.
			res.redirect('/backpacks')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


// get route to go back to selection for new or existing campaign
router.get('/select', (req, res) => {
	req.session.currentCampaignName = ''
	req.session.currentCampaignId = ''
	req.session.currentBackpackName = ''
	req.session.currentBackpackId = ''
	req.session.isMaster = false
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	res.render('auth/select', { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } )
})

// put route for adding SRD(seeded) items to campaign
router.put('/import/:id', (req, res) => {
	const campaignId = req.params.id
	Item.find({ fromSeed: true})
		.then(items => {
			
			items.forEach(item => {
				// Nit: remove console.logs
				console.log(item)
				item.inCampaign.push(campaignId)
				// Should return here. Same as above
				item.save()
			})
		})
		// Nit: can remove `items` since it's unused
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
router.put('/enter/:id/:playerType', (req, res) => {
	const campaignId = req.params.id
	const playerType = req.params.playerType
	req.session.isMaster = false
	// Nit: most of these being destructured out can be remove because they are unused. Only destructor what is being used in this scope
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	Campaign.findById(campaignId)
		.then(campaign => {
			req.session.currentCampaignId = campaign.id
			req.session.currentCampaignName = campaign.name
			// Good best practice that we have to touched on in class but I'll point it out here. When we start to have mulitple checks in a condition it's a good idea to name it something meaningful then pass it in. This makes our code more human readable.  Ex:
			// const isOwnerAndMaster = campaign.owner == userId && playerType == 'master'
			// if (isOwnerAndMaster) {....}
			// this is not really needed here because it's already human readable but these conditions can become very confusing very quickly
			if (campaign.owner == userId && playerType == 'master') {
				req.session.isMaster = true
			}
			res.redirect(`/backpacks/`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})




// update route
router.put('/:id', (req, res) => {
	const campaignId = req.params.id

	Campaign.findByIdAndUpdate(campaignId, { name: req.body.name, description: req.body.description}, { new: true })
	// Nit: can remove unused `campaign`
		.then(campaign => {
			res.redirect('/campaigns')
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// show route for deleting campaign
router.get('/delete/:id', (req, res) => {
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	const campaignId = req.params.id
	Campaign.findById(campaignId)
		.then(campaign => {
			res.render('campaigns/delete', { campaign, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// delete route
router.delete('/delete/:id', (req, res) => {
	const campaignId = req.params.id
	Backpack.find({campaign: campaignId})
		.then(backpacks => {
			backpacks.forEach(backpack => {
				// Nit: remove console.log
				console.log(backpack.id)
				Backpack.findByIdAndRemove(backpack.id)
				// empty `.then()` here remove it or put something in it
					.then()
					.catch(error => {
						res.redirect(`/error?error=${error}`)
						})
			})
		})
		// Nit: can remove unused `drop`
		.then(drop =>{
			Campaign.findByIdAndRemove(campaignId)
			// Nit: can remove unused `campaign`
				.then(campaign => {
				res.redirect('/campaigns')
				})
				.catch(error => {
				res.redirect(`/error?error=${error}`)
				})
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// Export the Router
module.exports = router
