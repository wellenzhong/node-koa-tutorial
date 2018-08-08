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

### 静态文件

项目里，我们还需要处理静态文件，比如css和js文件、图片、字体等。
1. 在app文件夹下新建一个public的目录；
2. 然后我们安装处理静态文件的插件：```npm install koa-static --save```
3. 尝试在模板里插入一张图片，假设图片路径是/app/public/assets/images/img1.png,模板里插入
```
<img src="/assets/images/img1.png" alt="">
```
注意，这里不再需要/app/public这两个目录，直接写public下面的就可以了；
4. 尝试添加样式和js文件:在public里新建样式文件和js文件，并把它们添加到模板文件里去，刷新页面可以看到效果了，证明引入是成功的。
5. 

### 日志处理
1. 我们要在开发过程中看到日志输出在控制台的话，我们要安装```koa-logger```插件，```npm install koa-logger --save```,然后在app.js文件里添加进去：
```
const logger = require('koa-logger')
app.use(logger())
 
 ```
2. 在项目运行的过程中，我们有的地方需要记录日志，以便出错时我们好定位问题；在这里，我们使用```log4js```这个插件来输出日志文件；【配置太长，详细可以查看该[log4js的文档](https://www.npmjs.com/package/log4js)】

3. 其他一些用到的插件：```'koa-json''koa-onerror''koa-bodyparser''koa-logger'```也都安装上，具体作用可查看文档；


### 开发工具

#### Gulp
我们需要用到构建工具来处理我们的样式和JS,比如编译less\压缩和混淆等，在这里我们用Gulp来帮助我们实现上面的功能。
1. 我们先安装gulp:
```npm install gulp --save-dev```
2. 再安装一些必要的的插件：(详细见文件package.json)
   ```
   "babel-core": "^6.26.3",
    "babel-preset-env": "^1.7.0",
    "browser-sync": "^2.24.5",
    "gulp": "^3.9.1",
    "gulp-babel": "^7.0.1",
    "gulp-base64": "^0.1.3",
    "gulp-clean": "^0.4.0",
    "gulp-clean-css": "^3.9.4",
    "gulp-concat": "^2.6.1",
    "gulp-css-base64": "^1.3.4",
    "gulp-less": "^3.5.0",
    "gulp-minify-css": "^1.2.4",
    "gulp-rev": "^8.1.1",
    "gulp-rev-collector": "^1.3.1",
    "gulp-uglify": "^3.0.0",
    "gulp-watch": "^5.0.0",
    "less-plugin-autoprefix": "^1.5.1",
    "run-sequence": "^2.2.1"
   ```
3. 接下来，我们创建一个```gulpfile.js```的配置文件，详情见项目里的文件；
4. 接下来，我们运行```npm run dev```再新建一个命令窗口，运行```gulp browser-sync```,这样就实现了浏览器的自动刷新及自动处理；
当然，目录创建是写对啊！