/**
* A module with defined api endpoints for managing categories
* @module routes/categories
* @author Filip Prosovsky
*/

/** Package definitions */
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const router = Router({ prefix: '/api/v1/category' });
const fs = require('fs');

/** Load other modules */
const { validateCategory } = require('../controllers/validation');
const category = require('../models/propertyCategory.js');
const auth = require('../controllers/auth');
const can = require('../permissions/categories');

/** Route endpoints */
router.get('/', getCategories);
router.get('/:id([0-9]{1,})', getCategoryById);
router.post('/', auth, bodyParser(), validateCategory, createCategory);
router.put('/:id([0-9]{1,})', auth, bodyParser(), validateCategory, updateCategory);
router.del('/:id([0-9]{1,})', auth, deleteCategory);


/**
 * Function to list all categories
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - category data, string - message, integer - http status
 */
async function getCategories(ctx) {
    let results = await category.getCategories();
    if (results.length > 0) {
        ctx.status = 200;
        ctx.body = results;
    }
    else {
        ctx.status = 404;
        ctx.body = 'No categories found';
    }
}

/**
 * Function to list category by ID
 * @param {integer} integer - category ID
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object} object - category data, integer - http status
 */
async function getCategoryById(ctx) {
    let id = ctx.params.id;
    let data = await category.getCategoryById(id);
    if ((id > 0) && (!isNaN(id)) && (data.length > 0)) {
        ctx.status = 200;
        ctx.body = data;
    }
    else {
        ctx.status = 404;
    }
}

/**
 * Function to create category. Checks permission and call module to create category
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object} object - category ID, integer - http status
 */
async function createCategory(ctx) {
    let permission = can.create(ctx.state.user)
    if (permission.granted) {
        try {
            let newCategory = ctx.request.body;
            let obj = await category.createCategory(newCategory);
            ctx.status = 201;
            ctx.body = obj;
        }
        catch (e) {
            ctx.status = 400;
            ctx.body = 'You submitted wrong values or you missing some, please check and try again';
        }
    }
    else {
        ctx.status = 403;
    }
}

/**
 * Function to update category. Checks permission and call module to check if category exists.
 * If so, update the category data
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function updateCategory(ctx) {
    let permission = can.update(ctx.state.user)
    if (permission.granted) {
        let id = ctx.params.id;
        if (id > 0) {
            try {
                let returnedObj = await category.getCategoryById(id);
                if (returnedObj.length > 0) {
                    let updatedCategory = ctx.request.body;
                    await category.updateCategory(id, updatedCategory);
                    ctx.status = 201;
                    ctx.body = 'Category updated';
                }
                else {
                    ctx.status = 404;
                    ctx.body = 'Requested category was not found';
                }
            }
            catch (error) {
                ctx.status = 400;
                ctx.body = 'You submitted wrong values or you missing some, please check and try again';
            }
        }
        else {
            ctx.status = 400;
            ctx.body = 'Wrong ID';
        }
    }
    else {
        ctx.status = 403;
    }
}

/**
 * Function to delete category. Checks permission and call module to check if category exists.
 * If so, delete the category data, category image if any.
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function deleteCategory(ctx) {
    try {
        let permission = can.delete(ctx.state.user)
        if (permission.granted) {
            let id = ctx.params.id;
            if ((id > 0) && (!isNaN(id))) {
                let result = await category.getCategoryById(id);
                if (result.length > 0) {
                    let dir = `./public/category/images/${result[0].name}/`;
                    if (fs.existsSync(dir, { recursive: true })) {
                        if (fs.readdirSync(dir).length > 0) {
                            fs.unlinkSync(result[0].image_url)
                        }
                        fs.rmdirSync(dir)
                    }
                    let res = await category.deleteCategory(id);
                    if (res) {
                        ctx.body = 'Category deleted!'
                        ctx.status = 201;
                    }
                    else {
                        ctx.body = 'Property is linked to this category, category cannot be removed.'
                        ctx.status = 400;
                    }
                }
                else {
                    ctx.status = 404;
                    ctx.body = 'Category was not found';
                }
            }
            else {
                ctx.status = 400;
                ctx.body = 'Wrong input'
            }
        }
        else {
            ctx.status = 403;
        }
    }
    catch (err) {
        ctx.status = 500;
    }
}

module.exports = router;