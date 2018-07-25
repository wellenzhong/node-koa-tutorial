const router = require('koa-router')()
router
    .get('/', async (ctx, next) => {
        ctx.body = 'hello koa!!'
    })

module.exports = router