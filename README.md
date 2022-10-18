# Conjure Backpack
### A Dungeon's and Dragons 5e inventory manager

## Overview
---
Conjure Backpack is an app that allows users to digitally manage character inventories for Dungeons & Dragons Fifth Edition. Users can create campaigns (as the Dungeon Master) to manage the available items, or join others (as a player). This app utilizes the [DND 5e API](https://dnd5eapi/) to seed initial equipment available from the SRD. Dungeon Masters can choose to remove any of these items from their campaign (all are available by default), and of course, create their own.
This also means that users can add resources found in the standard game materials that aren't included in the [SRD](https://5thsrd.org/) for a more robust collection of resources.

## Installation Instructions
---
If you wish to run this program locally, do the following:
1. Fork and clone this repo
2. The Conjure Backpack app uses [MongoDB](https://www.mongodb.com/try/download/) to save all data. You must have an instance of MongoDb configured to make use of the app.
3. In console/git bash, from inside the Conjure Backpack directory run the following:
```
npm install
```
This will install node and all dependencies from package.json.
- axios* - allows for pulling of data from [DnD 5eAPI](https://dnd5eapi.co/api) (only used durring the seed operation)
- bycryptjs - allows for encryption of user passwords
-connect-mongo - allows for CRUD interactions with MongoDB
- dotenv - for loading environment variables from a .env file
- express - web framework for managing routes
- express-session - session middleware for express
- liquid-express-views - used for simplifing rendering of LiquidJs views from express routes
- method-overide - allows app to use all REST routes
- mongoose - allows for MongoDB object modeling
- morgan - used for logging HTTP requests

*The most recent version of axios seems to have some bugs that prevent the seed script from running. Please use the version as is in package.json ("0.27.2").

4. From the directory, create a .env file
```
touch .env
```
5. open .env and save the following (replacing bracketed text as described)
```
# database url is where your local db lives
DATABASE_URL=mongodb://localhost/conjure-backpack
# this is the port we'll use to run the app(and eventually see this in the browser)
PORT=[port number(recomend 3000 or 4000)]
# this allows for the creation of a session and is required by the express-session middleware
SECRET=[some sting of letters and numbers]
```
6. From your terminal seed the database by running the following:
```
npm run seed
```
If successful, your terminal should look like this:
```
$ npm run seed

> conjuretest@1.0.0 seed
> node models/seed.js

You are connected to mongo
Magic items to import:  362
Basic items to import:  237
Basic items imported
Magic items imported
You are disconnected from mongo
```
*Note: there is a max time allowance of 45s for this script, which, if exceeded, will automatically close the connection and log the error. Usually the seed takes less then 10 seconds, but if it fails, drop the database before attempting again.

Running this seed will pull in all equipment items from the [D&D 5e SRD](https://dnd.wizards.com/resources/systems-reference-document), and format them in the style of the app.

7. Start the server in the terminal:
```
npm start
```
8. Open your web browser and go to http://localhost:[PORT from .env]/ 


### Technologies Used:
- HTML5
- CSS (Bootstrap)
- JavaScript
- LiquidJs
- Express
- MongoDB/Mongoose
- Node
- bycrypt

## User Stories
---
- As a user, I want the ability to create a new account.
- As a user, I want the ability to log in to my account.
- As a user, I want the ability to start new campaign -or- join an existing campaing -or- continue with a campaign I am already part of.
- As a user, I want the ability to log out at any time.
### If campaign owner (Dungeon Master):
- As a dungeon master, I want the ability to allow players to join my campaign.
- As a dungeon master, I want the ability to view and edit any player's inventory.
- As a dungeon master, I want the ability to view, edit, create, and remove any item in my campaign.
### If campaign member (Player):
- As a player, I want the ability to create, view, and edit my backpack.


## Wireframes
---
![Wireframe](README-images/conjure-backpack-wireframe.png)
---
![Wireframe 2](README-images/conjure-backpack-wireframe-2.PNG)

## ERD's
---
![Entity Relationship Diagram](README-images/conjure-backpack-erd.png)

## API Usage
---
API is only used for the initial seed of the DB, afterwhich all items are contained and formated for the internal API

https://dnd5eapi.co/api :
- /equipment
- /magic-items



## Schedule for Delivery
---
### Monday
- Begin backend paths
- Test scripts for creating seed from API
### Tuesday
- Continue Backend
### Wednesday
- Continue Backend
- Start Front End
### Thursday
- Continue Front End
### Friday
- Finalize App and begin work on stretches