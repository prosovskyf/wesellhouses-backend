/**
* A module with defined api endpoints for managing zoopla data
* @module routes/zoopla
* @author Filip Prosovsky
*/

/** Package definitions */
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const router = Router({ prefix: '/api/v1/admin/properties/data' });
const fetch = require('node-fetch');
require('dotenv').config();

/** Load other modules */
const zoopla = require('../models/zoopla.js');
const auth = require('../controllers/auth');

/** Route endpoints */
router.post('/', auth, bodyParser(), getPrices);


/**
 * Function to get zoopla data
 * Get postcode and based on that checks if any data associated with this postcode are in DB
 * If not, fetch the data from Zoopla API and store it in formated way to own DB
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - zoopla data, string - message, integer - http status
 */
async function getPrices(ctx) {
    let api_key = process.env.zoopla_key;
    let postcode = ctx.request.body.postcode;
    try {
        let data = await zoopla.getData(postcode);
        if (data.length > 0) {
            ctx.status = 200;
            ctx.body = data[0];
        }
        else {
            let url = 'https://api.zoopla.co.uk/api/v1/average_area_sold_price.json?'
            url = url + `postcode=${postcode}&output_type=county&api_key=${api_key}`;
            let zipData = {
                postcode: postcode,
                average_sold_price_1year: '',
                average_sold_price_3year: '',
                average_sold_price_5year: '',
                average_sold_price_7year: '',
                number_of_sales_1year: '',
                number_of_sales_3year: '',
                number_of_sales_7year: '',
                number_of_sales_5year: '',
                county: '',
                turnover: '',
            };
            let getData = async url => {
                let response = await fetch(url);
                let json = await response.json()
                    .then(obj => {
                        return obj
                    })
                    .catch(e => console.error(e.stack));
                return json
            };
            let online = await getData(url)
            let x;
            for (x in zipData) {
                if (online[x]) {
                    zipData[x] += online[x];
                }
            }
            await zoopla.createData(zipData)
            ctx.status = 200;
            ctx.body = zipData;
        }
    }
    catch (e) {
        ctx.status = 500;
        ctx.body = 'Problem occured, try again'
    }
}

module.exports = router;