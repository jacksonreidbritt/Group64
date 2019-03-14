// Group64 Spotify Web App Project

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var https = require('https');

var bodyParser = require('body-parser'); // needed to parse POST body

/* Authorization code based off spotify developer authorication guide
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 *
 */
var client_id = ""; // client id
var client_secret = ""; // secret
var redirect_uri = 'http://localhost:8888/callback'; // redirect uri


// setting up MySQL database connection based off of lab code
var mysql = require('mysql');
/**
 * This middleware provides a consistent API
 * for MySQL connections during request/response life cycle
 */
var myConnection  = require('express-myconnection')

/**
 * Load the stored values for database connection.
 */
var config = require('./config')
var dbOptions = {
    host:      process.env.RDS_HOSTNAME || config.database.host,
    user:       process.env.RDS_USERNAME ||config.database.user,
    password: process.env.RDS_PASSWORD || config.database.password,
    port:       process.env.RDS_PORT ||config.database.port,
    database:  process.env.RDS_DB_NAME || config.database.db
}

/* using express framework */
var app = express();
app.use(myConnection(mysql, dbOptions, 'pool'))
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(session({ // session cookie options
    secret: 'Spotify',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60000,
      httpOnly: true,
      secure: true
   }
}));
app.use(flash());

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

app.use(express.static(__dirname + '/public')) // look in public directory for resources
   .use(cookieParser());

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({ // fill in with credentials to make api calls
  clientId : client_id,
  clientSecret : client_secret,
  redirectUri : redirect_uri
});

// when get request to login is made
app.get('/login', function(req, res) {
  // console.log(res.cookie);
  // console.log(req.sessionID);
  // console.log(req.session);
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // application requests authorization from Spotify
  var scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog: 'true'
    }));
});

// remove saved info
app.get('/logout', function(req, res) {
  res.clearCookie("access_token"); // remove access token
  res.clearCookie("user_id");
  res.clearCookie("spotify_id");
  res.clearCookie("display_name");
  res.redirect('/');
});

// this is where spotify authorizor redirects to, we know have code to get access_token
app.get('/callback', function(req, res) {
  // application requests refresh and access tokens
  // after checking the state parameter
  // console.log(req.sessionID);
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = { // options for authorization call
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) { // authorization call
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        spotifyApi.setAccessToken(access_token); // set access_token
        // get info about the user
        spotifyApi.getMe()
        .then(function(data) {
          console.log('Some information about the authenticated user', data.body);
          res.cookie('user_id', data.body.id, {overwrite:true});
          res.cookie('spotify_id', data.body.id, {overwrite:true});
          res.cookie('session_id', req.sessionID, {overwrite:true});
          res.cookie('access_token', access_token, {overwrite:true});
          res.cookie('display_name', data.body.display_name, {overwrite:true});
          res.redirect('/#' + querystring.stringify({"user_id": data.body.id}));
        }, function(err) {
          console.log('Something went wrong!', err);
          res.cookie('user_id', user_id), {overwrite:true};
          res.cookie('spotify_id', user_id, {overwrite:true});
          res.cookie('session_id',req.sessionID, {overwrite:true});
          res.cookie('access_token', access_token, {overwrite:true});
          res.cookie('display_name',null, {overwrite:true});
          res.redirect('/#' + querystring.stringify({"user_id": user_id}));
        });

        // we can also pass the token to the browser to make requests from there
      } else { // if authorization encountered no errors
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

// gets lists of user's playlists, as well as display name and spotify id
app.get('/host', function(req, res){
  var playlists;
  var user_id = req.cookies.spotify_id;
  var user_info = req.cookies;
  var display_name = user_info.display_name;
  var access_token = user_info.access_token;
  spotifyApi.setAccessToken(access_token); // set access_token
  spotifyApi.getUserPlaylists(user_id)
  .then(function(data) {
    // console.log('Retrieved playlists', data.body);
    playlists = data.body.items;
    // console.log(playlists);
    playlists.push({'id':0, 'name': 'Create New Playlist'});
    // console.log(playlists);
    res.cookie('num_playlists', playlists.length, {overwrite:true});
    var response = {"display_name" : display_name, "playlists": playlists, 'user_id' : user_id};
    res.send(response);
  },function(err) {
    console.log('Something went wrong!', err);
    playlists = null;
    var response = {"display_name" : display_name, "playlists": playlists,  'user_id' : user_id};
    res.send(response);
  });
});

// we do not refresh token in our app, so this isn't necessary
// app.get('/refresh_token', function(req, res) {
//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };
//
//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       // console.log(body)
//       var access_token = body.access_token;
//       res.send({
//         'access_token': access_token
//       });
//     }
//   });
// });

// user request to join a party
app.post('/join', function(req, res, next) {
      // console.log(req.sessionID);
      // console.log(req.body);
      // console.log(req.body.party_id);
      // parse ID, should be an int
      var party_id = parseInt(req.body.party_id);
      // is it an integer
      if(!Number.isInteger(party_id)) {
        res.cookie('playlist_id', NaN, {overwrite:true});
        res.cookie('party_id', party_id, {overwrite:true});
        res.cookie('user_id', req.sessionID, {overwrite:true});
        res.cookie('session_id', req.sessionID, {overwrite:true});
        res.clearCookie('access_token');
        var response = {'playlist_uri': NaN, 'party_id' : party_id, 'user_id' : NaN}; // not an int
        res.send(response);
      } else if (party_id >= 10000 && party_id < 0) {
        // should be between these values
        flash("Should be a 4-digit numeric pin");
        res.cookie('playlist_id', NaN, {overwrite:true});
        res.cookie('party_id', party_id, {overwrite:true});
        res.cookie('session_id', req.sessionID, {overwrite:true});
        res.clearCookie('access_token');
        var response = {'playlist_uri': NaN, 'party_id' : party_id, 'user_id' : NaN};
        res.send(response);
      } else {
        // else party_id is okay
        // console.log(party_id);
        req.getConnection(function(error, conn) {
            var sqlQuery = 'select PlaylistID, SpotifyID from Party where PartyID =' + party_id;
            // Query to get all the entries.
            // conn object which will execute and return results
            conn.query(sqlQuery,function(err, rows, fields) {
                if (err) {
                        // Display error message in case an error
                        console.log('error')
                  } else {
                        var playlist_id = rows[0]? rows[0].PlaylistID : NaN;
                        var user_id = rows[0]? rows[0].SpotifyID : NaN;
                        var party_code = rows[0]?party_id : null;
                        // party_id = (playlist_id === NaN)? NaN : party_id;
                        res.cookie('playlist_id', playlist_id), {overwrite:true};
                        res.cookie('party_id', party_code, {overwrite:true});
                        res.cookie('spotify_id', user_id, {overwrite:true});
                        res.cookie('user_id', req.sessionID, {overwrite:true});
                        res.cookie('session_id', req.sessionID, {overwrite:true});
                        res.clearCookie('access_token');
                        var response = {'playlist_uri': playlist_id, 'party_id' : party_code, 'user_id' : user_id};
                        res.send(response);
                  }
            });
        });
      }
});

// app.get('/', function(req, res) {
//   // console.log(req.sessionID);
// });

// for testing purposes
app.post('/test', function(req, res) {
  // console.log(req.sessionID);
  console.log(req.query);
  var obj = {'cow' : "PIZZA", 'attr' : req.query.attribute, 'val' : req.query.value};
  // console.log(obj);
  res.send(obj);
});

// handles get user votes
app.post('/vote', function(req, res) {
  console.log(req.cookies);
  // console.log(req.query);
  var guest_id = mysql.escape(req.cookies.user_id);
  var party_id = req.cookies.party_id;
  var value = (req.cookies.access_token)?String(Number(req.body.value)*2):req.body.value;
  var obj = {'attr' : req.body.attribute, 'val' : req.body.value};
  req.getConnection(function(error, conn) {
      var sqlQuery = 'INSERT INTO Vote (GuestID,PartyID,'+req.body.attribute+') VALUES (' + guest_id+','+party_id+','+value+')' + ' ON DUPLICATE KEY UPDATE ' +req.body.attribute + ' = ' + value;
      // Query to get all the entries.
      // conn object which will execute and return results
      conn.query(sqlQuery,function(err, rows, fields) {
          if (err) {
                  // Display error message in case an error
                  console.log(err);
                  console.log('error')
            } else {
                  console.log(rows);
                  res.send(obj);
            }
      });
  });
  // console.log(obj);
  // res.send(obj);
});

// looks for the playlist the corresponds with this ID in the database
// get the updated attributes
app.post('/create', function(req, res) {
  // console.log(req.cookies);
  // console.log(req.query.playlist_id);
  var playlist_id = req.body.playlist_id;
  var is_new = req.body.is_new;
  // console.log("is_new",is_new, Boolean(is_new));
  // console.log("looky",playlist_id);
  if(is_new){
    req.getConnection(function(error, conn) {
        var sqlQuery = 'INSERT IGNORE INTO Party (PlaylistID, SpotifyID) Values ('+mysql.escape(String(playlist_id))+','+mysql.escape(req.cookies.spotify_id)+')';
        // Query to get all the entries.
        // conn object which will execute and return results
        conn.query(sqlQuery,function(err, rows, fields) {
            if (err) {
                    // Display error message in case an error
                    console.log(err);
                    console.log('error1')
              } else {
                  console.log(rows);
                  var sqlQuery2 = 'select * from Party P where P.PlaylistID = '+mysql.escape(String(playlist_id));
                  conn.query(sqlQuery2,function(err2, rows2, fields2) {
                      if (err2) {
                              // Display error message in case an error
                              console.log(err2);
                              console.log('error2')
                        } else {
                            console.log("success");
                            var attr = { 'Danceability': String(rows2[0].Danceability) ,'Energy': String(rows2[0].Energy),'Speechiness': String(rows2[0].Speechiness),'Acousticness': String(rows2[0].Acousticness),'Valence': String(rows2[0].Valence), 'Tempo':String(rows2[0].Tempo) };
                            var response = {'user_id':req.cookies.spotify_id, 'playlist_uri':playlist_id, 'party_id':rows2[0].partyID, 'attr':attr}
                            res.cookie('party_id', rows2[0].partyID, {overwrite:true});
                            res.send(response);
                        }
                  });
              }
        });
    });
  } else {
    req.getConnection(function(error, conn) {
      var sqlQuery2 = 'select partyID, SpotifyID from Party P where P.PlaylistID = '+mysql.escape(String(playlist_id));
      conn.query(sqlQuery2,function(err2, rows2, fields2) {
          if (err2) {
                  // Display error message in case an error
                  console.log(err2);
                  console.log('error2')
            } else {
                console.log("success");
                var response = {'user_id':req.cookies.spotify_id, 'playlist_uri':playlist_id, 'party_id':rows2[0].partyID}
                res.cookie('party_id', rows2[0].partyID, {overwrite:true});
                res.send(response);
            }
      });
    });
  }
});

// if user chose to create new playlist, make this new playlist and then this playlist will be added to database with default attributes
app.post('/create_new', function(req,res){
  var playlist_id = req.body.playlist_id,
      user_id = req.cookies.spotify_id,
      access_token = req.cookies.access_token,
      length = req.cookies.num_playlists;
  var response = {};
  if(playlist_id == 0){
    spotifyApi.setAccessToken(access_token);
    spotifyApi.createPlaylist(user_id, 'Group64_'+length, { 'public' : true })
      .then(function(data) {
        console.log('Created playlist!');
        console.log(data.body.id);
        response['playlist_id'] = data.body.id;
        response['is_new'] = true;
        console.log('response',response);
        res.send(response);
      }, function(err) {
        console.log('Something went wrong!', err);
        response['playlist_id'] = 0;
        response['is_new'] = false;
        // console.log('response',response);
        res.send(response);
      });
  } else {
    response['playlist_id'] = playlist_id;
    response['is_new'] = false;
    console.log('response',response);
    res.send(response);
  }
});

calc_attributes = require('./voting_algorithm'); // import the voting algorithm
app.post('/refresh', function(req, res){ // sum up votes for a party
  var party_id = req.body.party_id; // party id from request data
  var playlist_uri = req.body.playlist_id; // playlist id from request data
  req.getConnection(function(error, conn) {
    var sqlQuery = 'Select SUM(Danceability) AS Danceability, SUM(Speechiness) AS Speechiness, SUM(Energy) AS Energy, SUM(Tempo) AS Tempo, SUM(Valence) AS Valence, SUM(Acousticness) AS Acousticness from Vote GROUP BY (PartyID) Having PartyID = '+mysql.escape(party_id);
    conn.query(sqlQuery,function(err, rows, fields) {
        if (err) {
                // Display error message in case an error
                console.log(err);
                console.log('error')
          } else {
              console.log("success");
              var new_attr = calc_attributes((rows[0])?rows[0]:{'Danceability':0, 'Energy':0,'Speechiness':0,'Valence':0,'Tempo':0, 'Acousticness':0});
              console.log(rows[0]);
              console.log(new_attr);
              // var attr = {'Danceability':1, 'Energy':2,'Speechiness':3,'Valence':5,'Tempo':6};
              var sqlQuery2 = 'Update Party SET ? WHERE partyID = '+ mysql.escape(party_id);
              conn.query(sqlQuery2, new_attr, function(err2, rows2, fields2) {
                  if (err2) {
                          // Display error message in case an error
                          console.log(err2);
                          console.log('error')
                          var response = {'user_id':req.cookies.spotify_id, 'playlist_uri':playlist_uri, 'party_id':party_id, 'attr' : new_attr}
                          res.cookie('party_id', party_id, {overwrite:true});
                          res.send(response);
                    } else {
                        console.log("success");
                        // console.log(rows2);
                        // console.log(new_attr);
                        spotifyApi.setAccessToken(req.cookies.access_token);
                        var options = {
                          'seed_genres':['alternative', 'hip-hop', 'rock', 'edm', 'pop'],
                          'target_danceability':new_attr['Danceability'],
                          'target_energy':new_attr['Energy'],
                          'target_speechiness':new_attr['Speechiness'],
                          'target_valence' :new_attr['Valence'],
                          'target_tempo' : new_attr['Tempo'],
                          'target_acousticness':new_attr['Acousticness'],
                          'limit' : 15
                        }
                        spotifyApi.getRecommendations(options) // gets getRecommendations based on attributes calculated by sigmoid functions
                        .then(function(data) {
                          // console.log(data.body.tracks);
                          var track_info = data.body.tracks;
                          var tracks = [];
                          for(var i = 0; i < track_info.length; i++){
                            tracks.push(track_info[i].uri);
                          }
                          console.log(tracks);
                          spotifyApi.replaceTracksInPlaylist(req.cookies.spotify_id,playlist_uri,tracks) // replace tracks on playlist (irreversible) //, {'position':0})
                          .then(function(data2){
                            // success!!
                            // console.log(data2);
                            var response = {'user_id':req.cookies.spotify_id, 'playlist_uri':playlist_uri, 'party_id':party_id, 'attr':new_attr}
                            res.cookie('party_id', party_id, {overwrite:true});
                            res.send(response);
                          }, function(err2) {
                            console.log('Something went wrong!', err2);
                            var response = {'user_id':req.cookies.spotify_id, 'playlist_uri':playlist_uri, 'party_id':party_id, 'attr':new_attr}
                            res.cookie('party_id', party_id, {overwrite:true});
                            res.send(response);
                          });
                        }, function(err) {
                          console.log('Something went wrong!', err);
                          var response = {'user_id':req.cookies.spotify_id, 'playlist_uri':playlist_uri, 'party_id':party_id, 'attr':new_attr}
                          res.cookie('party_id', party_id, {overwrite:true});
                          res.send(response);
                          // console.log('response',response);
                        });
                    }
              });
          }
    });
  });
});

// method to make difference between app when called directly and when imported
// https://stackoverflow.com/questions/4981891/node-js-equivalent-of-pythons-if-name-main#6090287
if (!module.parent) {
  // this is main module
  // console.log('Listening on 8888');
  // var server = app.listen(8888);
    var port = process.env.PORT || 8888;

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
} else {
  // we were require()d from somewhere else
  module.exports = app;
}
