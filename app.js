const Koa = require('koa');
const properties = require('./routes/properties');
const propertiesAgent = require('./routes/propertiesAgent');
const categories = require('./routes/categories');
const signup = require('./routes/signup')
const agents = require('./routes/agents')
const messages = require('./routes/messages')
const login = require('./routes/login')
const files = require('./routes/files')
const features = require('./routes/features')
const verification = require('./routes/verification')
const zoopla = require('./routes/zoopla')
const cors = require('@koa/cors')

const app = new Koa();
app.use(cors())

app.use(properties.routes());
app.use(categories.routes());
app.use(signup.routes());
app.use(agents.routes());
app.use(propertiesAgent.routes());
app.use(messages.routes());
app.use(login.routes());
app.use(files.routes());
app.use(features.routes());
app.use(verification.routes());
app.use(zoopla.routes());

module.exports = app;