// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const compression = require('compression');



// compress all responses
app.use(compression());



// Force HTTPS (https://support.glitch.com/t/force-glitch-projects-to-use-https/5918/2)
const FORCE_HTTPS = true; // Use this to control the force of HTTPS!

function checkHttps(req, res, next){
  // protocol check, if http, redirect to https
  
  if(req.get('X-Forwarded-Proto').indexOf("https") != -1) {
    return next();
  }
  else {
    res.redirect('https://' + req.hostname + req.url);
  }
}

if (FORCE_HTTPS) // This is what forces HTTPS! Cool right?
{
    app.all('*', checkHttps);
}




// set HTTP headers
app.use(function(req, res, next) {
    res.setHeader("Content-Security-Policy", "default-src 'self' https:; script-src 'self' https: 'unsafe-inline'; style-src 'self' https: 'unsafe-inline'");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Feature-Policy", "vibrate 'self'; geolocation 'self'; camera 'none'; payment 'none'; fullscreen 'self'");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader("Server", "html");
    res.setHeader("X-Powered-By", "html");
    next();
});




// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  //response.sendFile(__dirname + '/views/index.html');
  response.sendFile(__dirname + '/index.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
