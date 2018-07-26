const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const index = require('./routes/index')


app.use(views(__dirname + '/views', {
    extension: 'ejs'
}))
app.use(index.routes())
app.listen(8888);