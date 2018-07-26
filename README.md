## 从零开始手动搭node+KOA

>  本文默认您的电脑已安装node 、npm或者yarn等工具。本文会按一般操作往下走，遇到问题再解决。比如，不会提前让你安装某个包，再告诉你这个包用来做什么的。让我们带着问题来动手。

### 创建项目

```
mkdir koa-demo
cd koa-demo
npm init
```
不熟悉的话就一路回车，熟悉的话就填一下里面的值。

然后安装koa和必要的包,先安装koa:

```
npm install koa --save
```
然后在项目根目录下，创建入口文件app.js
```
//app.js
const Koa = require('koa')
const app = new Koa()

app.use(async ctx => {
    ctx.body = 'Hello World';
});

app.listen(8888);
```
运行```node app.js ```就可以跑起来了服务器，然后在```http://localhost:8888/ ```就可以看到helo world了。

当然，我们不会满足于些，让我们接着往下看。
### 1.添加路由
koa可以用来做后端API或者渲染页面的，我们现在以后端渲染页面来讲一下项目的架构。我们要新建几个文件夹：

1. routes;
2. app;
3. views;

routes是用来放我们的路由文件的；
app是我们项目的文件，比如一些控制器、服务等文件；views是我们的模板文件，也就是我们的页面。

问题来了，我们访问路由，服务器怎么知道我要访问哪个页面呢？这个时候，我们就需要koa-router这个包：

```
npm install koa-router --save
```

#### 2.配置路由
在routes文件夹下面创建一个文件``` index.js ```,然后引入路由，并设置跳转信息：
```
//routes/index.js
const router = require('koa-router')()
router
    .get('/', async (ctx, next) => {
        ctx.body = 'hello koa!!'
    })

module.exports = router
```
在``` app.js ```中引入路由，并把刚才测试用的这段代码拿掉：
```
app.use(async ctx => {
    ctx.body = 'Hello World';
});
```
用下面这段来替换：
```
//app.js
//先引入路由文件
const index = require('./routes/index')

app.use(index.routes())
```
这时候```app.js ```完整的代码是这样的：
```
// app.js
const Koa = require('koa')
const app = new Koa()
const index = require('./routes/index')

app.use(index.routes())
app.listen(8888);
```

然后我们可以尝试一下，新增加一个路由：
```
//routes/index.js

const router = require('koa-router')()
router
    .get('/', async (ctx, next) => {
        ctx.body = 'hello koa!!'
    })
    .get('/hello', async (ctx, next) => {
        ctx.body = 'string  from hello route'
    })

module.exports = router
```
然后手动重启node服务器，再访问```http://localhost:8888/hello```就可以看到我们刚才的页面了，我们的路由添加成功了。

路由添加成功，但我们要把数据添加到页面上，这时我们就需要渲染模板了，比如pug、ejs等。这里我们选择ejs来进行我们的项目。

### 添加模板引擎

先安装一下ejs
```
npm install ejs --save
```
然后在views文件夹下新建一个home文件夹，再在home正面建一个index.ejs的模板，里面写上页面的内容，我们先测试一下能不能渲染到模板上来。

```
<!-- views/home/index.ejs -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    hello ejs!
</body>
</html>
```
然后修改路由文件,新增一个路由来访问模板。
我们使用render来渲染模板，如下：
```
//routes/index.js
.get('/ejs', async (ctx, next) => {
        await ctx.render('home/index', {})
    })
```
然后访问```http://localhost:8888/ejs```
但问题来了，发现报错了，说ctx.render不是一个函！

这时候，我们就需要一个包```koa-views```来帮助我们渲染
```
npm install koa-views --save
```
并在入口文件中引入并配置：
```
// app.js
const views = require('koa-views')

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))
```
重启后再次访问```http://localhost:8888/ejs```，发现可以访问到了！

## 配置自动重启工具

我们每次修改ejs文件后，都要手动重启node，这很影响我们的开发效率，我们要找一个工具来让它自动重启。```nodemon```就是这样一个工具。

```
npm install nodemon --save-dev
```
然后修改```package.json```,添加一个用```nodemon```启动的项目dev：
```
  "scripts": {
    "dev": "nodemon app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

然后我们用```npm run dev ```来启动我们的项目，修改index.ejs文件，刷新浏览器，发现node已经自动重启了。

### 利用mock模拟数据

我们利用easy-mock这个工具，来实现数据的模拟。先在网站端创建一个接口，这里创建好了一个：```https://www.easy-mock.com/mock/5b31b7195b00583c51b94987/test1/list```

1.我们在```app/controller```下面创建一个文件```index.js```;

2.先安装```node-fetch```来请求数据
```npm install node-fetch --save```

3.在这个文件里添加代码：
```
// app/controller/index.js

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
```

4.修改routes/index.js文件，因为这时渲染的语句已经拿到这边来了。
```
const router = require('koa-router')()

const controller = require('../app/controller/index')
router.get('/ejs', controller.getList)
```
5.在ejs模板里渲染一下：
```
<body>
    <ul>
        <%listdata.map((item,index)=>{%>
        <li><%=item.title%></li>
        <%})%>
    </ul>
</body>
```
这个时候，可以看到页面上渲染出来的数据了。大概的框架出来了，但我们还有后续的工作要做。

---
未完待续