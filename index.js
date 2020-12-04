const app = require('./app')
let port = process.env.PORT || 3005
app.listen(port);
console.log(`Started on port: ${port}`);