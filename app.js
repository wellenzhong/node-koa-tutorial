const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const static = require('koa-static')
const logger = require('koa-logger')
const index = require('./routes/index')

app.use(logger())
app.use(static(__dirname + '/app/public'))
app.use(views(__dirname + '/views', {
    extension: 'ejs'
}))
app.use(index.routes())
app.listen(8888);