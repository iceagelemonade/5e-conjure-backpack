///////////////////////////////////////
// Import Dependencies
///////////////////////////////////////
const { AggregationCursor } = require('./connection')
const mongoose = require('./connection')
const Item = require('./item')
const axios = require('axios').default
// Here, we're going to set up a seed script
// this will seed our database for us so we have all items in the SRD resources


// This script will be run with the command in the terminal `npm run seed`


///////////////////////////////////////
// Seed Script Code
///////////////////////////////////////
// first we need our connection saved to a variable for easy refrence
const db = mongoose.connection
// these top functions allow us to take data from various parts of the API and build them into our four categories and generate descriptions as used in the app
const getCategory = (str) => {
    let value = ''
    switch (str) {
        case 'armor':
            value = 'Armor'
            break;
        case 'weapon':
            value = 'Weapon'
            break;
        default:
            value = 'Gear'
    }
    return value
}

const getContents = (contents) => {
    let desc = "Contains:<br />"
    contents.forEach(content => {
        let append = `${content.quantity}x ${content.item.name}<br />`
        desc = desc + append
    })
    return desc
}
// special code had to be made for the Net, because while it is classified as a weapon it does not follow the rules of all the others
const getDesc = (obj) => {
    let desc = ''
    if (obj.name == "Net") {
        desc = obj.special[0]
    } else {
    
        switch (obj.equipment_category.index) {
            case 'weapon':
                let properties = '' 
                obj.properties.forEach((property, ind) => {
                    let trail = ', '
                    if (ind + 1 == obj.properties.length) {
                        trail = ''
                    }
                    properties = properties + property.name + trail
                    })
                let range = `${obj.range.normal} ${obj.range.long?'/ '+obj.range.long:''}`
                desc = `Type: ${obj.category_range} <br /> Damage: ${obj.damage.damage_dice}${obj.two_handed_damage?'/ '+obj.two_handed_damage.damage_dice:''} ${obj.damage.damage_type.name} <br /> Range: ${range} <br /> Properties: ${properties}`
                break;
            case 'armor':
                desc = `${obj.armor_category} Armor <br /> Armor Class: ${obj.armor_class.base}`
                break;
            default:
                
                if (obj.desc.length === 0 && obj.contents.length > 0) {
                    desc = getContents(obj.contents)
                } else {
                    let description = ''
                    obj.desc.forEach((line) => {
                        description = description + line + '\n'
                        })
                    desc = description
                }
        }
    }
    return desc
}

const getDescMagic = (arr) => {
    let description = '' 
            arr.forEach((line) => {
                description = description + line + '<br />'
                })
    return description
}

// this timer terminates our connection if the seed cannot pull all of the items. just a safety measure
let timer = setTimeout(() => {
    console.log('Something went wrong. Please drop database before trying again.')
    db.close()
}, 45000)

let loaded = 0
// this pulls from the equipment list
db.on('open', () => {
    let list = []
    let url = []        
    axios('https://www.dnd5eapi.co/api/equipment')
    .then(apiResponse => {
        
        return apiResponse.data.results
    })
        // let list = []
        // let url = []
    .then(arr => { 
        // console.log(arr)
        arr.forEach(item => {
            url.push(item.url)
        })
        console.log('Basic items to import: ', url.length)
        return url
    })
    .then(url => {
        let count = 0
        url.forEach((link, ind) => {
            axios(`https://www.dnd5eapi.co${link}`)
            .then(response => {
                // console.log(response.data)
                const obj = {}
                const data = response.data
                obj.name = data.name
                obj.category = getCategory(data.equipment_category.index)
                obj.desc = getDesc(data)
                obj.weight = data.weight
                obj.cost=data.cost?data.cost.quantity+data.cost.unit:null
                obj.owner = null
                obj.fromSeed = true
                // console.log(obj)
                Item.create(obj)
                // list.push(obj)
                // console.log(list)
                // console.log (ind)
                count ++
                // console.log(count)
                if (count === url.length) {
                    console.log('Basic items imported')
                    loaded++
                }
            })
            .catch(err => {
                console.log(err)
                db.close()
            })
        }) 
    })
    .catch(err => {
        console.log(err)
        db.close()
    })

})
// this pulls from the magic-items list... both happen simultanously
db.on('open', () => {
    let list = []
    let url = []        
    axios('https://www.dnd5eapi.co/api/magic-items')
    .then(apiResponse => {
        
        return apiResponse.data.results
    })
        // let list = []
        // let url = []
    .then(arr => { 
        // console.log(arr)
        arr.forEach(item => {
            url.push(item.url)
        })
        console.log('Magic items to import: ',url.length)
        return url
    })
    .then(url => {
        let count = 0
        url.forEach((link, ind) => {
            axios(`https://www.dnd5eapi.co${link}`)
            .then(response => {
                // console.log(response.data)
                const obj = {}
                const data = response.data
                obj.name = data.name
                obj.category= 'Magic Item'
                obj.desc = getDescMagic(data.desc)
                obj.weight = data.weight
                obj.owner = null
                obj.fromSeed = true
                // console.log(obj)
                Item.create(obj)
                // list.push(obj)
                // console.log(list)
                // console.log (ind)
                count ++
                // console.log(count)
                if (count === url.length) {
                    console.log('Magic items imported')
                    loaded++
                }
            })
            .catch(err => {
                console.log(err)
                db.close()
            })
        }) 
    })
    .catch(err => {
        console.log(err)
        db.close()
    })

})
// this is how we verify both lists have been written, then after 5 seconds (to ensure mongoDB is done writting) it will close the connection
let checkTimer = setInterval(() => {
    if(loaded === 2) {
        clearTimeout(timer)
        db.close()
        clearInterval(checkTimer)
    }
}, 5000)