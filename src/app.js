const express = require('express');
const exphbs = require('express-handlebars')
const path = require('path')
const cookieParser = require('cookie-parser');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const passport = require('./middleware/passport')
const morgan = require('morgan')
const createError = require('http-errors')

// Initializations
const app = express();
require('./database');

// settings
app.set('port', process.env.PORT || 3000);


// validacion de campos
// app.use(expressValidator())

// alertas y flash messages
app.use(flash())

// middlewares
// app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())
app.use(session({
  secret: process.env.SECRET_KEY,
  key:process.env.SECRET_KEY,
  resave:false,
  saveUninitialized:false,
  store:new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use((req,res,next) => {
  res.locals.mensajes = req.flash()
  next()
})
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/',require('./routes'));


// static files
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars',
  exphbs({
    defaultLayout:'layout',
    helpers:require('./helpers/handlebars')
  })
);
app.set('view engine','handlebars');

// 404 pagina no existente
app.use((req,res,next) => {
  next(createError(404,'No encontrado'))
})

// administracion de errores
app.use((error,req,res) => {
  res.locals.mensaje = error.message;
  const status = error.status || 500;
  res.locals.status = status;
  res.status(status)
  res.render('error')
})


module.exports = app;
