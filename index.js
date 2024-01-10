require('dotenv').config()
const path = require('path')
const routes = require('./src/routes')
const Database = require('ltijs-sequelize')
const lti = require('ltijs').Provider

const db = new Database('postgres', 'postgres', '1412', 
{ 
    host: 'localhost',
    dialect: 'postgres',
    logging: false 
})

// Setup
lti.setup(process.env.LTI_KEY,
    { 
        plugin: db // Passing db object to plugin field
    },
//   {
//     url: 'mongodb+srv://jaiman:8MmR6LDOaONjMTnS@cluster0.r7wfjel.mongodb.net?authSource=admin',
//     connection: { user: process.env.DB_USER, pass: process.env.DB_PASS }
//   },
  {
    staticPath: path.join(__dirname, './public'), // Path to static files
    cookies: {
      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: '' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true // Set DevMode to true if the testing platform is in a different domain and https is not being used
  })

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  return res.sendFile(path.join(__dirname, './public/index.html'))
  return lti.redirect(res, 'https://localhost:5175', { newResource: true })
})

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, '/deeplink', { newResource: true })
})

// Setting up routes
lti.app.use(routes)

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT })

  /**
   * Register platform
   */
  await lti.registerPlatform({
    url: 'http://localhost',
    name: 'Moodle',
    clientId: 'rydzMyWGnvesvjK',
    authenticationEndpoint: 'http://localhost/mod/lti/auth.php',
    accesstokenEndpoint: 'http://localhost/mod/lti/token.php',
    authConfig: { method: 'JWK_SET', key: 'http://localhost/mod/lti/certs.php' }
  })
}

setup()