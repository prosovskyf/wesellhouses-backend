/**
* A module with defined api endpoints for managing files
* @module routes/files
* @author Filip Prosovsky
*/

/** Package definitions */
const Router = require('koa-router');
const router = Router({ prefix: '/api/v1/files' });
const auth = require('../controllers/auth')
const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body')({ multipart: true, formidable: { uploadDir: './public' } })
const mime = require('mime-types')
const fs = require('fs');
const sharp = require('sharp');

/** Load other modules */
const images = require('../models/files')
const category = require('../models/propertyCategory')
const checkRole = require('../helpers/isAgent')

/** Route endpoints */
router.get('/', getMediaNames);

/** Upload */
router.put('/upload/category/image', auth, checkRole, koaBody, uploadCategoryImg);
router.put('/upload/property/images', auth, checkRole, koaBody, uploadImages);
router.put('/upload/property/video', auth, checkRole, koaBody, uploadVideo);

/** Deletion */
router.del('/delete/category/image', auth, checkRole, bodyParser(), deleteCategoryImg);
router.del('/delete/property/image', auth, checkRole, bodyParser(), deleteImage);
router.del('/delete/property/video', auth, checkRole, bodyParser(), deleteVideo);

/**
 * Function to get all file names from folder by specified path sent in query 
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | array | string} array - file names, string - message, integer - http status
 */
async function getMediaNames(ctx) {
    try {
        let { path } = ctx.request.query
        if (fs.existsSync(path, { recursive: true }) && (fs.readdirSync(path).length > 0)) {
            const files = fs.readdirSync(path)
            let names = [];
            let images = {};
            let i = 0;
            for (const file of files) {
                images = { id: i, name: file }
                names.push(images)
                i++;
            }
            ctx.status = 200
            ctx.body = names;
        }
        else {
            ctx.status = 404
            ctx.body = 'No files in the directory';
        }
    }
    catch (err) {
        ctx.status = 500
    }
}

/**
 * Function to upload images based on property ID and assign path to the images to DB
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function uploadImages(ctx) {
    try {
        let id = ctx.request.headers.property_id
        let i = 0;
        let newImageName;
        let dir = `./public/${id}/images/`;
        if (!fs.existsSync(dir, { recursive: true })) {
            fs.mkdirSync(dir, { recursive: true });
        }
        let countFiles = fs.readdirSync(dir).length;
        let countImageFiles = ([].concat(ctx.request.files.image)).length
        let toJpeg;
        if (ctx.request.files.thumbnail) {
            var { path, type } = ctx.request.files.thumbnail
            let fileExtension = mime.extension(type)
            newImageName = 'thumbnail.' + fileExtension;
            toJpeg = 'thumbnail';
            let newPath = `./public/${id}/images/${newImageName}`;
            if (countFiles === 0) {
                await images.insertPathImages(dir, id)
            }
            fs.renameSync(path, newPath);
            if (fileExtension !== 'jpeg') {
                await sharp(newPath)
                    .jpeg()
                    .toFile(dir + toJpeg + '.jpeg')
                    .catch(err => { console.log(err) });
                fs.unlinkSync(newPath)
            }
        }
        for (i; i < countImageFiles; i++) {
            if (ctx.request.files.image) {
                if (countImageFiles == 1) {
                    var { path, type } = ctx.request.files.image;
                }
                else {
                    var { path, type } = ctx.request.files.image[i];
                }
                let fileExtension = mime.extension(type)
                newImageName = 'image_' + countFiles + '.' + fileExtension;
                toJpeg = 'image_' + countFiles;
                let newPath = `./public/${id}/images/${newImageName}`;
                if (countFiles === 0) {
                    await images.insertPathImages(dir, id)
                }
                fs.renameSync(path, newPath);
                if (fileExtension !== 'jpeg') {
                    await sharp(newPath)
                        .jpeg()
                        .toFile(dir + toJpeg + '.jpeg')
                        .catch(err => { console.log(err) });
                    fs.unlinkSync(newPath)
                }
                countFiles++

            }
        }
        ctx.status = 200
        ctx.body = 'Uploaded!'
    }
    catch (err) {
        ctx.status = 500
    }
}

/**
 * Function to upload category image based on category ID and assign path to the image to DB
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function uploadCategoryImg(ctx) {
    try {
        let id = ctx.request.headers.category_id
        let getCategory = await category.getCategoryById(id)
        let categoryName = getCategory[0].name
        let dir = `./public/category/images/${categoryName}`;
        if (!fs.existsSync(dir, { recursive: true })) {
            fs.mkdirSync(dir, { recursive: true });
        }
        let countFiles = fs.readdirSync(dir).length;
        var { path, type } = ctx.request.files.image;
        let fileExtension = mime.extension(type)
        let newImageName = 'image_' + countFiles + '.' + fileExtension;
        let toJpeg = 'image_' + countFiles;
        let newPath = `./public/category/images/${categoryName}/${newImageName}`;
        if (countFiles === 0) {
            await images.insertPathCategoryImage(newPath, id)
        }
        fs.renameSync(path, newPath);
        if (fileExtension !== 'jpeg') {
            await sharp(newPath)
                .jpeg()
                .toFile(dir + toJpeg + '.jpeg')
                .catch(err => { console.log(err) });
            fs.unlinkSync(newPath)
        }
        ctx.status = 200
        ctx.body = 'Uploaded!'
    }
    catch (err) {
        ctx.status = 500
    }
}

/**
 * Function to upload property video based on property ID and assign path to the video to DB
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function uploadVideo(ctx) {
    try {
        let id = ctx.request.headers.property_id
        const { path, type } = ctx.request.files.video
        const fileExtension = mime.extension(type)
        let newVideoName = 'video_' + id + '.' + fileExtension;
        let dir = `./public/${id}/video/`
        let newPath = `./public/${id}/video/${newVideoName}`;
        if (!fs.existsSync(dir, { recursive: true })) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.renameSync(path, newPath);
        await images.insertPathVideo(dir, id);
        ctx.status = 200
        ctx.body = 'Uploaded!'
    }
    catch (err) {
        ctx.status = 500
    }
}

/**
 * Function to delete property image based on property ID
 * If it is last image in folder, delete that folder and remove path from DB
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function deleteImage(ctx) {
    try {
        let { id, imgName } = ctx.request.body
        let dir = `./public/${id}/images/`;
        let toDelete = `./public/${id}/images/${imgName}`;
        let countFiles = fs.readdirSync(dir).length;
        if (countFiles === 1) {
            fs.unlinkSync(toDelete)
            fs.rmdirSync(dir)
            await images.deletePathImages(id)
        }
        else {
            fs.unlinkSync(toDelete)
        }
        ctx.status = 200
        ctx.body = 'Image deleted!'
    }
    catch (err) {
        ctx.status = 500
    }
}

/**
 * Function to delete category image based on category ID
 * If it is last image in folder, delete that folder and remove path from DB
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function deleteCategoryImg(ctx) {
    try {
        let { id, name, path } = ctx.request.body
        let dir = `./public/category/images/${name}`;
        let toDelete = path;
        let countFiles = fs.readdirSync(dir).length;
        if (countFiles === 1) {
            fs.unlinkSync(toDelete)
            fs.rmdirSync(dir)
            await images.deletePathCategoryImage(id)
        }
        else {
            fs.unlinkSync(toDelete)
        }
        ctx.status = 200
        ctx.body = 'Image deleted!'
    }
    catch (err) {
        ctx.status = 500
    }
}

/**
 * Function to delete property video based on property ID and remove path from DB
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function deleteVideo(ctx) {
    try {
        let { id, videoName } = ctx.request.body
        let toDelete = `./public/${id}/video/${videoName}`;
        let delDir = `./public/${id}/video`;
        fs.unlinkSync(toDelete)
        fs.rmdirSync(delDir)
        await images.deletePathVideo(id)
        ctx.status = 200
        ctx.body = 'Video deleted!'
    }
    catch (err) {
        ctx.status = 500
    }
}

module.exports = router;