const Koa = require('koa');
const serve = require('koa-static');
const mount = require('koa-mount');

const app = new Koa();

app.use(mount('/', serve('./docs/jsdocs')))
app.use(mount('/api', serve('./docs/openapi'))) 
app.use(mount('/schemas', serve('./schemas'))) 

app.listen(3030);