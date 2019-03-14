
var express = require('express'); // Express web server framework
var mysql = require('mysql')
var myConnection  = require('express-myconnection')

/* chai mocha test framwork from mherman.org/blog/2015/09/10/testing-node-js-with-mocha-and-chai/#/Wt0htljwaUk */
var chai = require('chai');
var chaiHttp = require('chai-http');
var app =  require('../app')

var config = {
    database: {
        host:       'localhost',    // database host
        user:       'root',         // your database username
        password:   '',             // your database password
        port:       3306,           // default MySQL port
        db:         'SpotifyDB'          // your database name
    }
}
var dbOptions = {
    host:      config.database.host,
    user:       config.database.user,
    password: config.database.password,
    port:       config.database.port,
    database: config.database.db
}


var expect = chai.expect;
var should = chai.should();

describe('Test MySQL Database Setup And Calls', function() {
  var connection;
  before(function() {
    connection = mysql.createConnection(dbOptions); // connect to db
    connection.connect();
  });
  it('should be able to connect to DB', function(done) {
    connection.should.have.property('threadId'); // check that connection successful
    done();
  });
  it('should return correct values for SQL query', function(done){
    var result = {};
    connection.query('SELECT Danceability FROM Party WHERE PartyID=1', function(err, rows, fields){
      if(!err){
        // console.log(rows[0].Danceability);
        result['result'] = rows[0].Danceability; // this should be equal to 1 (with test populated DB)
        result.result.should.equal(31);
      }else {
        console.log("Error in making query!");
        result['result'] = null;
        result.result.should.equal(null);
      }
    });
    done();
  });
  after(function() {
    connection.end(); // close connection after tests
  })
});

chai.use(chaiHttp);
describe("Test each GET request directory of web app", function() {
  var server;
  before(function() {
    server = app.listen(8888); // start listening
    // console.log('Listening on 8888');
  });
  it("should receive a response 200 HTTP Status Code from '/'", function(done) {
    chai.request(server).get('/').end(function(err, res){
      // console.log(res.header);
      res.should.have.status(200); // should receive a response!
      done();
    });
  });
  it("should receive a response type of 'text/html' from '/'", function(done) {
    chai.request(server).get('/').end(function(err, res){
      // console.log(res.header);
      // console.log(res.type);
      res.type.should.equal('text/html'); // should receive a response!
      done();
    });
  });
  it("should receive a response 400 HTTP Status Code from '/login'", function(done) {
    chai.request(server).get('/login').end(function(err, res){
      // console.log(res.header);
      res.should.have.status(400); // should receive a response of type 400 W/O the client ID and client secret
      done();
    });
  });
  it("should receive a response type of 'text/html' from '/login'", function(done) {
    chai.request(server).get('/login').end(function(err, res){
      // console.log(res.header);
      // console.log(res.type);
      res.type.should.equal('text/html'); // should receive a response!
      done();
    });
  });
  it("should receive a response 200 HTTP Status Code from '/logout'", function(done) {
    chai.request(server).get('/logout').end(function(err, res){
      // console.log(res.header);
      res.should.have.status(200); // should receive a response!
      done();
    });
  });
  it("should receive a response type of 'text/html' from '/logout'", function(done) {
    chai.request(server).get('/logout').end(function(err, res){
      // console.log(res.header);
      // console.log(res.type);
      res.type.should.equal('text/html'); // should receive a response!
      done();
    });
  });
  after(function() {
    server.close(); // close httplistener
  })
});

describe("Test POST request to '/login'", function(){
  var server;
  // var connection;
  before(function() {
    // connection = mysql.createConnection(dbOptions); // connect to db
    // connection.connect();
    // app.use(myConnection(mysql, dbOptions, 'pool'));
    server = app.listen(8888);
  });
  it("should receive a response 200 HTTP Status Code from '/join' POST Request", function(done) {
    chai.request(server)
      .post('/join')
      .send({'party_code' : '1'})
      .end(function(err, res){
      res.should.have.status(200); // should receive a response!
      // console.log(res);
      done();
    });
  });
  after(function(){
    server.close();
    // connection.end();
  });
});

describe("Tests of Voting Algorithm Implementation", function(){
  var calc_attributes;
  before(function() {
    calc_attributes = require('../voting_algorithm'); // import the voting algorithm
  });
  it('should return NaN for each attribute for a blank dictionary argument', function(done){
    dict = {};
    result = {'Danceability': NaN, 'Energy':NaN,'Speechiness': NaN,'Acousticness': NaN,'Valence': NaN,'Tempo': NaN};
    expect(calc_attributes(dict)).to.deep.equal(result);
    done();
  });
  it("should return NaN for blank fields and correct values otherwise", function(done){
    test_dict ={"Energy":-5,"Speechiness":0, "Valence":5, "Tempo":-5};
    result =  {"Danceability":NaN,'Energy': 0.3050616952354029, 'Speechiness': 0.3, 'Acousticness': NaN, 'Valence': 0.874159881673064, 'Tempo': 84.96238477809936 };
    expect(calc_attributes(test_dict)).to.deep.equal(result);
    done();
  });
  it("should calculate correct attribute values when given sum of +1/-1 votes" , function(done) {
    test_dict = {"Danceability":10,"Energy":-5,"Speechiness":0, "Acousticness":10, "Valence":5, "Tempo":-5};
    result = {'Danceability': 0.9525741268224334, 'Energy': 0.3050616952354029, 'Speechiness': 0.30, 'Acousticness': 0.8807970779778823,'Valence': 0.874159881673064, 'Tempo': 84.96238477809936};
    expect(calc_attributes(test_dict)).to.deep.equal(result);
    done();
  });
  it("should calculate correct attribute values when given sum of +1/-1 votes and extraneous key/values" , function(done) {
    test_dict = {"Danceability":10,"Energy":-5,"Speechiness":0, "Acousticness":10, "Valence":5, "Tempo":-5, "cow_test": 123};
    result = {'Danceability': 0.9525741268224334, 'Energy': 0.3050616952354029, 'Speechiness': 0.30, 'Acousticness': 0.8807970779778823,'Valence': 0.874159881673064, 'Tempo': 84.96238477809936};
    expect(calc_attributes(test_dict)).to.deep.equal(result);
    done();
  });
  it('should return NaN for each attribute for incorrect dictionary argument', function(done){
    dict = {"cow":"moo","dog":"bark"};
    result = {'Danceability': NaN, 'Energy': NaN,'Speechiness': NaN,'Acousticness': NaN,'Valence': NaN,'Tempo': NaN};
    expect(calc_attributes(dict)).to.deep.equal(result);
    done();
  });
  it('should return NaN for each attribute when given inccorect argument type', function(done){
    dict = 16;
    result = {'Danceability': NaN, 'Energy': NaN,'Speechiness': NaN,'Acousticness': NaN,'Valence': NaN,'Tempo': NaN};
    expect(calc_attributes(dict)).to.deep.equal(result);
    done();
  });
});
