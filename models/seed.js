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

const getDesc = (obj) => {
    let desc = ''
    if (obj.name == "Net") {
        desc = obj.special[1]
    } else {
    
        switch (obj.equipment_category.index) {
            case 'weapon':
                let properties = '' 
                obj.properties.forEach((property) => {
                    properties = properties + property.name + ','
                    })
                desc = `Type: ${obj.category_range} \n Damage: ${obj.damage.damage_dice} ${obj.damage.damage_type.name} \n Range: ${obj.range.normal}/${obj.range.long} \n Properties: ${properties}`
                break;
            case 'armor':
                desc = `${obj.armor_category} Armor \n Armor Class: ${obj.armor_class.base}`
                break;
            default:
                let description = '' 
                obj.desc.forEach((line) => {
                    description = description + line + '\n'
                    })
                desc = description
        }
    }
    return desc
}

const getDescMagic = (arr) => {
    let description = '' 
            arr.forEach((line) => {
                description = description + line + '\n'
                })
    return description
}


let timer = setTimeout(() => {
    console.log('Something went wrong. Please drop database before trying again.')
    db.close()
}, 45000)



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
                    clearTimeout(timer)
                    setTimeout(()=>{db.close()}, 1000)
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