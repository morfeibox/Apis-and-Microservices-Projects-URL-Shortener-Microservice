'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
require('dotenv').config({path: __dirname + '/.env'})

var cors = require('cors');

var app = express();

var Schema = mongoose.Schema;

var urlSchema = new Schema({
url: String,
shortenUrl: String,
},{ timestamps:true});

const modelUrls= mongoose.model('Urls', urlSchema);

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
 var promise = mongoose.connect(process.env.MONGOLAB_URI || "mongodb://localhost/urlshortener", {
  useMongoClient: true,
 });
 

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// POST /login gets urlencoded bodies
app.post('/api/shorturl/new/', urlencodedParser, function (req, res) {

  var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);
 
  if (!req.body.url_to_shrten.match(regex)) {
    
    res.json({"original_url": "Not Match real url!"});
  }else{

    var shortenUrl = Math.round((new Date()).getTime() / 1000).toString();
    
    var querry = new modelUrls({
      url: req.body.url_to_shrten,
      shortenUrl: shortenUrl
      });

      querry.save(err=>{
        if (err){
          return res.send('There is error in db connection');
        }
        
        return res.json({"original_url": querry.url, "short_url":querry.shortenUrl});
      });
  }
 });
 app.get("/api/shorturl/:shortUrl", (req, res, next)=>{

  var destinationUrl = req.params.shortUrl;
  

  modelUrls.findOne({ "shortenUrl" : destinationUrl}, (err,data)=>{
     
    if(err){
      res.send('Sorry we did not find any results for this short url');
    } else {
      var regex = new RegExp("^(http|https)://", "i");
      var responseUrl = data.url;
       
      if(responseUrl.match(regex)){
        res.redirect(301, data.url);
      }
      else {
        res.redirect(301, "https://" + data.url);
      }
    }
  })
})




// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
})