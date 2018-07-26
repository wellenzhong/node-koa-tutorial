const fetch = require('node-fetch')

exports.getList = async (ctx, next) => {
    let listdata = "";
    await fetch("https://www.easy-mock.com/mock/5b31b7195b00583c51b94987/test1/list", {
        methods: "GET"
    })
        .then(res => res.text())
        .then(myJson => {
            listdata = JSON.parse(myJson).data;
        })
        .catch(error => {
        })
    await ctx.render('home/index', {
        listdata
    })
}