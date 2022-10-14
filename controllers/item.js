// Import Dependencies
const express = require('express')
const Example = require('../models/example')
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
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	Item.find({inCampaign: currentCampaignId})
		.then(examples => {
			
			
			res.render('examples/index', { examples, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

router.get('/filter/:type', (req, res) => {
	const type = req.params.type
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	Item.find({inCampaign: currentCampaignId, category: type})
		.then(examples => {
			
			
			res.render('examples/index', { examples, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


router.get('/search/', (req, res) => {
	const term = req.query.name
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	Item.find({ name: term })
		.then(examples => {

			
			res.render('examples/index', { examples, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


// put route for removing items from a campaign
router.put('/remove/:campaignId/:itemId', (req, res) => {
	const campaignId = req.params.campaignId
	const itemId = req.params.itemId

	Item.findById(itemId)
		.then(item => {
			for ( let i = 0; i < item.inCampaign.length; i++){
				if ( item.inCampaign[i] == campaignId) {
					item.inCampaign.splice(i,1)
					i--
				}
			}
			item.save()
			res.redirect(`/items`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// index that shows only the user's examples
router.get('/mine', (req, res) => {
    // destructure user info from req.session
    const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	Item.find({ owner: userId, inCampaign: currentCampaignId })
		.then(examples => {
			res.render('examples/index', { examples, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// new route -> GET route that renders our page with the form
router.get('/new', (req, res) => {
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	res.render('examples/new', { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
})

// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {
	req.body.owner = req.session.userId
	req.body.inCampaign = req.session.currentCampaignId
	req.body.isSecret = req.body.isSecret === 'on'?true:false

	Item.create(req.body)
		.then(item => {
			res.redirect('/items')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// edit route -> GET that takes us to the edit form view
router.get('/:id/edit', (req, res) => {
	// we need to get the id
	const itemId = req.params.id
	Item.findById(itemId)
		.then(item => {
			
			res.render('examples/edit', { item })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// update route
router.put('/:id', (req, res) => {
	const exampleId = req.params.id
	req.body.isSecret = req.body.isSecret === 'on'?true:false

	Item.findByIdAndUpdate(exampleId, req.body, { new: true })
		.then(example => {
			res.redirect(`/items/${example.id}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// show route
router.get('/:id', (req, res) => {
	const exampleId = req.params.id
	Item.findById(exampleId)
		.then(example => {
            const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
			
			res.render('examples/show', { example, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// delete route
router.delete('/:id', (req, res) => {
	const exampleId = req.params.id
	Item.findByIdAndRemove(exampleId)
		.then(example => {
			res.redirect('/items')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})




// 	Example.find({})
// 		.then(examples => {
// 			const username = req.session.username
// 			const loggedIn = req.session.loggedIn
			
// 			res.render('examples/index', { examples, username, loggedIn })
// 		})
// 		.catch(error => {
// 			res.redirect(`/error?error=${error}`)
// 		})
// })


// Export the Router
module.exports = router
