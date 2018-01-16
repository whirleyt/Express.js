const express = require( 'express' );
const app = express(); 

app.listen(3000, function(){
    console.log("server listening")
})

app.use(function (req, res, next) {
    console.log('request', req.method)
    next()
    // do your logging here
    // call `next`, or else your app will be a black hole — receiving requests but never properly responding
})

app.get('/', function(req, res){
    res.send("Hello World!");
    console.log('We are tracking requests', req.method, '/', res.statusCode)

})

app.get('/news', function(req, res){
    res.send("This is news!");
})

