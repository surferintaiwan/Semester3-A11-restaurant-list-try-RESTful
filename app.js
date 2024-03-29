// --引入module--
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const port = 3000
const Restaurant = require('./models/restaurant.js')
const methodOverride = require('method-override')
const session = require('express-session') 
const passport = require('passport')
const flash = require('connect-flash')

// 判別開發環境
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// -- 設定mongoose --
// 連線至本地端資料庫
mongoose.connect('mongodb://localhost/restaurant', { useUnifiedTopology: true, useNewUrlParser: true,  useCreateIndex: true})
// 獲取connection 
const db = mongoose.connection 
// 連線異常
db.on('error', () => {
    console.log('mongoDB error!')
})
// 連線正常
db.once('open', () => {
    console.log('mongoDB connected!')
})

// -- 設定body-parser --
app.use(bodyParser.urlencoded({ extended: true }))

// --設定handlebars--
app.engine('handlebars', exphbs( {defaultLayout: 'main'} ))
app.set('view engine', 'handlebars')

// -- 設定靜態檔案 -- (css, jquery and popper files)
app.use(express.static('public'))

// 使用express-session
app.use(session({
    secret: 'my restaurant key',   // secret: 定義一組屬於你的字串做為私鑰
    resave: false,
    saveUninitialized: true,
  }))

// 使用passport
app.use(passport.initialize())
app.use(passport.session())

// 載入.config/passport.js
require('./config/passport.js')(passport)

// 使用connect.flash
app.use(flash())

// 儲存變數給view使用
app.use((req, res, next) => {
    res.locals.user = req.user
    res.locals.isAuthenticated = req.isAuthenticated()
    res.locals.success_msg = req.flash('success_msg')
    res.locals.warning_msg = req.flash('warning_msg')
    next()
})

// -- 設定method-override --
app.use(methodOverride('_method'))

// -- 設定路由 --
app.use('/', require('./routes/home.js'))
app.use('/restaurants', require('./routes/restaurants.js'))
app.use('/search', require('./routes/search.js'))
app.use('/users', require('./routes/user.js'))
app.use('/auth', require('./routes/auths.js'))

// -- 啟用並監控Server --
app.listen(port,() => {
    console.log(`nodemon is listening http://localhost/${port}`)
})