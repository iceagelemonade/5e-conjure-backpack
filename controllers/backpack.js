// Import Dependencies
const express = require('express')
const Example = require('../models/example')
const Backpack = require('../models/backpack')
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
	Backpack.find({})
		.then(backpacks => {
			req.session.currentBackpackName = ''
			req.session.currentBackpackId = ''
			const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
			
			res.render('backpacks/index', { backpacks, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


// new route -> GET route that renders our page with the form
router.get('/new', (req, res) => {
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	res.render('backpacks/new', { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
})

// put route for adding to backpack
router.put('/add/:id', (req, res) => {
	const itemId = req.params.id
	const backpackId = req.session.currentBackpackId
	Backpack.findById(backpackId)
		.then(backpack => {
			backpack.items.push(itemId)
			backpack.save()
			res.redirect(`/backpacks/${backpackId}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// post route for new backpack
router.post('/', (req, res) => {
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	req.body.campaign = currentCampaignId
	req.body.owner = userId
	
	Backpack.create(req.body)
	.then(backpack => {
		res.redirect('/backpacks')
	})
})


router.get('/search/', (req, res) => {
	const term = req.query.name
	console.log(term)
	Item.find({ name: term })
		.then(examples => {
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			
			res.render('examples/show', { examples, username, loggedIn })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


// index that shows only the user's examples
router.get('/mine', (req, res) => {
    // destructure user info from req.session
    const { username, userId, loggedIn } = req.session
	Item.find({ owner: userId })
		.then(examples => {
			res.render('examples/index', { examples, username, loggedIn })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// new route -> GET route that renders our page with the form
router.get('/new', (req, res) => {
	const { username, userId, loggedIn } = req.session
	res.render('examples/new', { username, loggedIn })
})

// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {
	req.body.ready = req.body.ready === 'on' ? true : false

	req.body.owner = req.session.userId
	Item.create(req.body)
		.then(example => {
			console.log('this was returned from create', example)
			res.redirect('/examples')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})




// edit route -> GET that takes us to the edit form view
router.get('/:id/edit', (req, res) => {
	// we need to get the id
	const exampleId = req.params.id
	Item.findById(exampleId)
		.then(example => {
			res.render('examples/edit', { example })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// update route
router.put('/:id', (req, res) => {
	const exampleId = req.params.id
	req.body.ready = req.body.ready === 'on' ? true : false

	Item.findByIdAndUpdate(exampleId, req.body, { new: true })
		.then(example => {
			res.redirect(`/examples/${example.id}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// show route
// Here we want to display items in a players pack. since the backpack only knows the id of a given item we will use the $in operator after finding the backpack by the sent id
// then, we only send the items registered to the given backpack, and let our viewer layout determin wether or not they're still registered to the campaign via our session value
router.get('/:id', (req, res) => {
	const backpackId = req.params.id

	Backpack.findById(backpackId)
		.then(backpack => {
            req.session.currentBackpackId = backpack.id
			req.session.currentBackpackName = backpack.name
			
			Item.find({ _id: { $in: backpack.items}, inCampaign: req.session.currentCampaignId })
				.then(items => {
				const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session					
				res.render('backpacks/backpack', { items, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
				})
				.catch((error) => {
					res.redirect(`/error?error=${error}`)
				})
			
		})
		
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// put route for removing items from a backpack
router.put('/:backpackId/:itemId', (req, res) => {
	const backpackId = req.params.backpackId
	const itemId = req.params.itemId

	Backpack.findById(backpackId)
		.then(backpack => {

			for ( let i = 0; i < backpack.items.length; i++){
				if ( backpack.items[i] == itemId) {
					backpack.items.splice(i,1)
					console.log('new arr ', backpack.items)
					i--
					
				}
			}
			
			backpack.save()
			res.redirect(`/backpacks/${backpackId}`)
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
			res.redirect('/examples')
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
