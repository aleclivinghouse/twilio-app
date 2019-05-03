//ATTENTION: RUN APP WITH npm run dev
//ATTENTION: RUN APP WITH npm run dev
//ATTENTION: RUN APP WITH npm run dev
require('dotenv').config()
const express = require('express');
var random = require('mongoose-simple-random');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.get('/token', function(request, response) {
  let r = Math.random().toString(36).substring(7);
   var identity = r;

   // Create an access token which we will sign and return to the client,
   // containing the grant we just created
   var token = new AccessToken(
       process.env.TWILIO_ACCOUNT_SID,
       process.env.TWILIO_API_KEY,
       process.env.TWILIO_API_SECRET
   );

   // Assign the generated identity to the token
   token.identity = identity;

   const grant = new VideoGrant();
   // Grant token access to the Video API features
   token.addGrant(grant);

   // Serialize the token to a JWT string and include it in a JSON response
   response.send({
       identity: identity,
       token: token.toJwt()
   });
});

app.get('/token', function(request, response) {
   var identity = 'here name';

   // Create an access token which we will sign and return to the client,
   // containing the grant we just created
   var token = new AccessToken(
       process.env.TWILIO_ACCOUNT_SID,
       process.env.TWILIO_API_KEY,
       process.env.TWILIO_API_SECRET
   );

   // Assign the generated identity to the token
   token.identity = identity;

   const grant = new VideoGrant();
   // Grant token access to the Video API features
   token.addGrant(grant);

   // Serialize the token to a JWT string and include it in a JSON response
   response.send({
       identity: identity,
       token: token.toJwt()
   });
});
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});
app.use(express.static('client/build'))
  app.get('*', (req, res)=>{
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
