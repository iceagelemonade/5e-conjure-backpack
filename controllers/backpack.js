// Import Dependencies
const express = require('express')
const Backpack = require('../models/backpack')
const Campaign = require('../models/campaign')
const Item = require('../models/item')
// Nit: remove unused import
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
	Campaign.findById(currentCampaignId)
		.then(campaign => {
			if (campaign.players.includes(username)) {
			res.render('backpacks/new', { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
			} else {
				res.redirect(`/error?error=You%20are%20not%20a%20player%20in%20this%20campaign`)
			}
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
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
	const { userId, currentCampaignId} = req.session
	req.body.campaign = currentCampaignId
	req.body.owner = userId
	
	Backpack.create(req.body)
	// Nit: remove unused `backpack` here can just ignore the passing of anything here () => {}
	.then(backpack => {
		res.redirect('/backpacks')
	})
})

// show route for filtering items in bapack via search
// Remove the ending `/` here. In Express we always keep the leading `/` and leave off the ending `/`. In other frameworks we will see that this changes but here we should follow this rule. Should be just `/search`
router.get('/search/', (req, res) => {
	const term = req.query.name
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	Backpack.findById(currentBackpackId)
		.then(backpack => {	
			Item.find({ name: term, _id: backpack.items })
				.then(items => {
					res.render('backpacks/backpack', { items, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
				})
				.catch(error => {
					res.redirect(`/error?error=${error}`)
				})
			})
			.catch(error => {
				res.redirect(`/error?error=${error}`)
			})	
})

// // new route -> GET route that renders our page with the form
// router.get('/new', (req, res) => {
// 	const { username, userId, loggedIn } = req.session
// 	res.render('items/new', { username, loggedIn })
// })

// show route for deleting backpack
router.get('/delete/:id', (req, res) => {
	const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
	const backpackId = req.params.id
	Backpack.findById(backpackId)
		.then(backpack => {
			res.render('backpacks/delete', { backpack, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// delete route
router.delete('/delete/:id', (req, res) => {
	const backpackId = req.params.id
	Backpack.findByIdAndRemove(backpackId)
	// Nit: remove unused `backpack` here can just pass nothing () => {}
		.then(backpack => {
			res.redirect('/backpacks')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})
router.get('/:id/filter/:type', (req, res) => {
	const backpackId = req.params.id
	let type= req.params.type
	Backpack.findById(backpackId)
		.then(backpack => {
            req.session.currentBackpackId = backpack.id
			req.session.currentBackpackName = backpack.name
			
			Item.find({ _id: { $in: backpack.items}, inCampaign: req.session.currentCampaignId, category: type })
				.then(items => {
				const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session
				// Add some comments here on what logic you are doing here and wha the expected behaivor is. When doing one line fancy things we always want to leave a comment for other devs that might be looking at this and for yourself in about 6 months when you come back to this code
				type === 'Weapon'?type ='Weapons':type = type
				type === 'Magic Item'?type ='Magic Items':type = type					
				res.render('backpacks/backpack', { items, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId, type })
				})
				.catch((error) => {
					res.redirect(`/error?error=${error}`)
				})
			
		})
		
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})


// edit route -> GET that takes us to the edit form view
router.get('/:id/edit', (req, res) => {
	// we need to get the id
	const itemId = req.params.id
	Item.findById(itemId)
		.then(item => {
			res.render('items/edit', { item })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// // update route
// router.put('/:id', (req, res) => {
// 	const itemId = req.params.id
// 	req.body.ready = req.body.ready === 'on' ? true : false

// 	Item.findByIdAndUpdate(itemId, req.body, { new: true })
// 		.then(item => {
// 			res.redirect(`/items/${item.id}`)
// 		})
// 		.catch((error) => {
// 			res.redirect(`/error?error=${error}`)
// 		})
// })

// show route
// Here we want to display items in a players pack. since the backpack only knows the id of a given item we will use the $in operator after finding the backpack by the sent id
// then, we only send the items registered to the given backpack, and let our viewer layout determin wether or not they're still registered to the campaign via our session value
router.get('/:id', (req, res) => {
	const backpackId = req.params.id

	Backpack.findById(backpackId)
		.then(backpack => {
            req.session.currentBackpackId = backpack.id
			req.session.currentBackpackName = backpack.name
			let backpackWeight = 0
			Item.find({ _id: { $in: backpack.items}, inCampaign: req.session.currentCampaignId })
				.then(items => {
					// this lets us show how many of each item is in a backpack without showing the item multiple times. It does not save to the item ahow it will only show on a backpack by backpack basis (which is what we want). we will also use it to calculate the backpacks total weight
					items.forEach(item => {
						// Nit: remove unused `itemId`
						const itemId = item.id
						let qty = 0
						backpack.items.forEach(itemBP => {
							if (itemBP === item.id) {
								qty++
								if (item.weight) {
									backpackWeight += item.weight
								}
							}
						})
						
						item.qty = qty
					})
				const { username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId } = req.session					
				res.render('backpacks/backpack', { items, backpackWeight, username, loggedIn, userId, isMaster, currentCampaignName, currentCampaignId, currentBackpackName, currentBackpackId })
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
router.put('/:backpackId/:itemId/:all', (req, res) => {
	const backpackId = req.params.backpackId
	const itemId = req.params.itemId
	const removeAll = req.params.all

	Backpack.findById(backpackId)
		.then(backpack => {
			for ( let i = 0; i < backpack.items.length; i++){
				if ( backpack.items[i] == itemId) {
					backpack.items.splice(i,1)
					removeAll=="all"?i--:i = backpack.items.length
				}
			}
			// Nit: should return here. Best practice for Mongoose `.save()` middleware
			backpack.save()
			res.redirect(`/backpacks/${backpackId}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})



// delete route
router.delete('/:id', (req, res) => {
	const itemId = req.params.id
	Item.findByIdAndRemove(itemId)
	// Nit: remove unused `item`
		.then(item => {
			res.redirect('/items')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// Export the Router
module.exports = router
