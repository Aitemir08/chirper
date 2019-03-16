const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Sequelize = require('sequelize')
require('dotenv').config()

/* Настройка базы данных через ORM систему */

const sequelize = new Sequelize({
  'host'    : process.env.CHIRPER_DB_HOST,
  'port'     : process.env.CHIRPER_DB_PORT,
  'username' : process.env.CHIRPER_DB_USER,
  'password' : process.env.CHIRPER_DB_PASS,
  'database' : process.env.CHIRPER_DB_NAME,
  'dialect'  : 'mysql'
})

const User = sequelize.define('user', {
  'login' : {
    'type' : Sequelize.STRING,
    'allowNull' : false,
    'unique' : true
  },
  'password' : {
    'type' : Sequelize.STRING,
    'allowNull' : false,
  } 
})
const Chirp = sequelize.define('chirp', {
  'content': {
      'type': Sequelize.STRING,
      'allowNull': false
  }
})

User.hasMany(Chirp)
Chirp.belongsTo(User)

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

// Задаем обработчики путей (роутинг)

app.get('/', (_, response) => {
  Chirp.findAll().then (results => {
      response.render('index', { 'chirps': results })
  }).catch(error => {
      console.error(error)
      response.status(500).end('Interval Server Error')
  })
})
app.post('/', (request, response) => {
  const content = request.body.content  
  Chirp.create({ 
    'content': content 
  }),then(chirp => {
      response.redirect('/')
  }).catch(error => {
      console.error(error)
      response.status(500).end('Interval Server Error')
  })
})

app.get('/login', (request,response) => {
    response.render('login')
})

app.post('/login', (request, response) =>{
  
})
// Созданием структуру базы при помощи ORM и запускаем веб-сервер

sequelize.sync().then(() => {
    return User.create({
      'login': 'user',
      'password': process.env.CHIRPER_TEST_USER_PASS
    })
}).then(() => {
  const port = process.env.CHIRPER_PORT
  app.listen(port, () => console.log(`The Chirper server is listening on port ${port}.`))
})
