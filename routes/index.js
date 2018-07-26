const router = require('koa-router')()
const controller = require('../app/controller/index')
router
    .get('/', async (ctx, next) => {
        ctx.body = 'hello koa!!'
    })
    .get('/hello', async (ctx, next) => {
        ctx.body = 'string  from hello route'
    })
    .get('/ejs', controller.getList)

module.exports = router