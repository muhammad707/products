const Product = require('../models/productModel')
const products = require('../data/data.json')
const {getData} = require('../utils/utils')
const uuid = require('uuid')
const fs = require('fs')
async function getAllProducts(req, res) {
    const productPromise = new Promise((resolve, reject)  => {
        resolve(products)
    })
    productPromise.then((data) => {
        res.writeHead(200, {'Content-type': 'text/json'})
        res.write(JSON.stringify(data))
        res.end()
    }).catch((error) => {
        res.writeHead(404, {'Content-type': 'text/json'})
        res.write(JSON.stringify(error))
        res.end()
    })
}

function getProductById(req, res, id) {
    const product = products.find((product) => product.id === id)
    if (!product) {
        res.writeHead(404, {'Content-type': 'text/json'})
        res.write(JSON.stringify({ message: "Product not found" }))
    } else {
        res.writeHead(200, {'Content-type': 'text/json'})
        res.write(JSON.stringify(product))
    }
    res.end()
}

async function createProduct(req, res) {
    try {
        const product = await getData(req, res)
        const productObj = JSON.parse(product)
        const newProduct = {
            id: uuid.v4(),
            name: productObj.name,
            description: productObj.description,
            price: productObj.price
        }
        products.push(newProduct)
        fs.writeFile('./data/data.json', JSON.stringify(products, null, 2), 'utf8', function(err) {
            if (err) {
                console.log(err);
            } else {
                res.writeHead(200, {'Content-type': 'text/json'})
                res.write(JSON.stringify({
                    message: "Product has been saved"
                }))
                res.end() // newArray = products.filter((product) => product.id !== id)
            }
        })
    } catch(error) {
        console.log(error)
        res.writeHead(400, {'Content-type': 'text/json'})
        res.write(JSON.stringify({
            message: "Bad request"
        }))
        res.end()
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct
}