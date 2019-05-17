// 载入相关依赖


const path = require('path')
// express web 框架
const express = require('express')
// session 中间件
const session = require('express-session')
// 将 session 存储于 mongodb，结合 express-session 使用
const MongoStore = require('connect-mongo')(session)
// 页面通知的中间件，基于 session 实现
const flash = require('connect-flash')
// 读取配置文件
const config = require('config-lite')(__dirname)
// 路由
const routes = require('./routes/index')

const pkg = require('./package')
const winston = require('winston')
const expressWinston = require('express-winston')

// 实例化
const app = express()

// 设置模板目录
app.set('views', path.join(__dirname, 'views'))
// 设置模板引擎为 ejs
app.set('view engine', 'ejs')


// 设置静态资源目录
app.use(express.static(path.join(__dirname, 'public')))

// session 中间件
app.use(session({
    name: config.session.key, // 设置 cookie 中保存 session id 的字段名称
    secret: config.session.secret, /// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    resave: true, // 强制更新 session
    saveUninitialized: false, // 设置为false，强制创建一个 session，即使用户未登陆
    cookie: {
        maxAge: config.session.maxAge // 过期时间， 过期后 cookie 中的 session id 自动删除
    },
    store: new MongoStore({ // 将 session 存到 MongoDB
        url: config.mongodb
    })
}))

// flash 中间件， 用来显示通知
app.use(flash())

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'), // 上传文件目录
    keepExtensions: true // 保留后缀
}))

// 设置模板全局常量
app.locals.blog = {
    title: pkg.name,
    description: pkg.description
}

// 模板必须配置
app.use((req, res, next) => {
    res.locals.user = req.session.user
    res.locals.success = req.flash('success').toString()
    res.locals.error = req.flash('error').toString()
    next()
})

// 正常请求的日志
app.use(expressWinston.logger({
    transports: [
        new(winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}))

// 路由
routes(app)

// 错误请求的日志
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}))


// 错误监听
app.use((err, req, res, next) => {
    console.error(err)
    req.flash('error', err.message)
    res.redirect('/posts')
})

// 监听端口
app.listen(config.port, () => {
    console.log(`${pkg.name} listening on port ${config.port}`)
})
