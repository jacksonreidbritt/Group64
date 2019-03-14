// JAVASCRIPT TO MAKE BUTTONS IN GUEST LOGIN WORK
$(document).on('click', '#buttonupd', function(){
  $("#buttonupd").css("color", "rgba(162, 124, 186, 1)");
  $("#buttonmiddled").css("color", "#ecebe8");
  $("#buttondownd").css("color", "#ecebe8");
  vote('Danceability', 1);
});
$(document).on('click', '#buttonmiddled', function(){
  $("#buttonupd").css("color", "#ecebe8");
  $("#buttonmiddled").css("color", "rgba(162, 124, 186, 1)");
  $("#buttondownd").css("color", "#ecebe8");
  vote('Danceability',0);
});
$(document).on('click', '#buttondownd', function(){
    $("#buttonupd").css("color", "#ecebe8");
    $("#buttonmiddled").css("color", "#ecebe8");
    $("#buttondownd").css("color", "rgba(162, 124, 186, 1)");
    vote('Danceability',-1);
  });
$(document).on('click', '#buttonupe', function(){
  $("#buttonupe").css("color", "rgba(162, 124, 186, 1)");
  $("#buttonmiddlee").css("color", "#ecebe8");
  $("#buttondowne").css("color", "#ecebe8");
  vote('Energy',1);
});
$(document).on('click', '#buttonmiddlee', function(){
  $("#buttonupe").css("color", "#ecebe8");
  $("#buttonmiddlee").css("color", "rgba(162, 124, 186, 1)");
  $("#buttondowne").css("color", "#ecebe8");
  vote('Energy',0);
});
$(document).on('click', '#buttondowne', function(){
    $("#buttonupe").css("color", "#ecebe8");
    $("#buttonmiddlee").css("color", "#ecebe8");
    $("#buttondowne").css("color", "rgba(162, 124, 186, 1)");
    vote('Energy',-1);
  });
$(document).on('click', '#buttonups', function(){
  $("#buttonups").css("color", "rgba(162, 124, 186, 1)");
  $("#buttonmiddles").css("color", "#ecebe8");
  $("#buttondowns").css("color", "#ecebe8");
  vote('Speechiness',1);

});
$(document).on('click', '#buttonmiddles', function(){
  $("#buttonups").css("color", "#ecebe8");
  $("#buttonmiddles").css("color", "rgba(162, 124, 186, 1)");
  $("#buttondowns").css("color", "#ecebe8");
  vote('Speechiness',0);
});
$(document).on('click', '#buttondowns', function(){
    $("#buttonups").css("color", "#ecebe8");
    $("#buttonmiddles").css("color", "#ecebe8");
    $("#buttondowns").css("color", "rgba(162, 124, 186, 1)");
    vote('Speechiness',-1);

});
$(document).on('click', '#buttonupa', function(){
  $("#buttonupa").css("color", "rgba(162, 124, 186, 1)");
  $("#buttonmiddlea").css("color", "#ecebe8");
  $("#buttondowna").css("color", "#ecebe8");
  vote('Acousticness',1);
});
$(document).on('click', '#buttonmiddlea', function(){
  $("#buttonupa").css("color", "#ecebe8");
  $("#buttonmiddlea").css("color", "rgba(162, 124, 186, 1)");
  $("#buttondowna").css("color", "#ecebe8");
  vote('Acousticness',0);
});
$(document).on('click', '#buttondowna', function(){
    $("#buttonupa").css("color", "#ecebe8");
    $("#buttonmiddlea").css("color", "#ecebe8");
    $("#buttondowna").css("color", "rgba(162, 124, 186, 1)");
    vote('Acousticness',-1);
  });

$(document).on('click', '#buttonupv', function(){
  $("#buttonupv").css("color", "rgba(162, 124, 186, 1)");
  $("#buttonmiddlev").css("color", "#ecebe8");
  $("#buttondownv").css("color", "#ecebe8");
  vote('Valence',1);
});
$(document).on('click', '#buttonmiddlev', function(){
  $("#buttonupv").css("color", "#ecebe8");
  $("#buttonmiddlev").css("color", "rgba(162, 124, 186, 1)");
  $("#buttondownv").css("color", "#ecebe8");
  vote('Valence',0);
});
$(document).on('click', '#buttondownv', function(){
    $("#buttonupv").css("color", "#ecebe8");
    $("#buttonmiddlev").css("color", "#ecebe8");
    $("#buttondownv").css("color", "rgba(162, 124, 186, 1)");
    vote('Valence',-1);
  });
$(document).on('click', '#buttonupt', function(){
  $("#buttonupt").css("color", "rgba(162, 124, 186, 1)");
  $("#buttonmiddlet").css("color", "#ecebe8");
  $("#buttondownt").css("color", "#ecebe8");
  vote('Tempo',1);
});
$(document).on('click', '#buttonmiddlet', function(){
  $("#buttonupt").css("color", "#ecebe8");
  $("#buttonmiddlet").css("color", "rgba(162, 124, 186, 1)");
  $("#buttondownt").css("color", "#ecebe8");
  vote('Tempo',0);
});
$(document).on('click', '#buttondownt', function(){
    $("#buttonupt").css("color", "#ecebe8");
    $("#buttonmiddlet").css("color", "#ecebe8");
    $("#buttondownt").css("color", "rgba(162, 124, 186, 1)");
    vote('Tempo',-1);
  });
// ^^^^ JS for sending votes and updating vote button css

// more listener functions
$(document).on('click', '#logout', function(){
    $('#login').show();
    $('#loggedin').hide();
  });
$(document).on('click', '#join_party', function(){
         $('#login_block').load("resources/joinparty.html");
  });
$(document).on('click', '#go_back', function(){
         $('#login_block').load("resources/choice.html");
  });
$(document).on('click', '#playlist_choice', function(){
    var playlistid = $(this).attr('data-playlistid');
    console.log(playlistid);
    makeParty(playlistid);
});
// $(document).on('click', '#about_button', function(){
//     $.ajax({
//         url: '/test',
//         type: 'GET',
//         success: function(response) {
//            console.log(response);
//            // document.getElementById("about_button").innerHTML = response.cow;
//           }
//     });
//   });
$(document).on('keypress', '#join_submit', function(e){
  if(e.keyCode == 13) {
        getParty();
      }
  });
$(document).on('click', '#join', function(){
    getParty();
  });
$(document).on('click', '#refresh', function(){
    var party_id= $('#refresh').data('partyid');
    var playlist_id = $('#refresh').data('playlistid');
    // console.log(party_id, playlist_id);
    refresh_votes(party_id, playlist_id);
});
$(document).on('click','#guest_refresh', function(){
  $('#guestframe').attr("src", $('#guestframe').attr("src"));
});
$(document).on('click','#host_refresh', function(){
  $('#hostframe').attr("src", $('#guestframe').attr("src"));
});

// JAVASCRIPT TO SEND POST REQUEST FOR JOIN PARTY
function getParty(){
  var party_id = document.getElementsByName('party_id')[0]['value'];
  // console.log(party_id);
  $.ajax({
      url: '/join',
      type: 'POST',
      data : {'party_id' : party_id},
      success: function(response) {
          // console.log(response);
          // window.location.href = '/';
          var playlist_uri = response.playlist_uri;
          var party_code = response.party_id;
          // console.log(playlist_uri);
         $('#login').hide();
         $('#loggedin').hide();
         $('#joined').show();
         var guestPageSource = document.getElementById('guest-page-template').innerHTML,
             guestPageTemplate = Handlebars.compile(guestPageSource),
             guestPagePlaceholder = document.getElementById('guest_joined');
         var party_id = (playlist_uri == null) ? ("(ID = "+ party_code + ") not found.") : String(party_code);
         response['party_id'] = party_id;
         response['playlist_uri'] = String(playlist_uri);
         guestPagePlaceholder.innerHTML = guestPageTemplate(response);
        }
      });
}

// function to tell server to log this vote in the database
function vote(attribute, value){
  $.ajax({
      url: '/vote',
      type: 'POST',
      data : {'attribute' : attribute, "value" : value},
      success: function(response) {
         console.log(response);
        }
  });
};

// create a new party, or if already made then just load
function makeParty(playlist_id){
  $.ajax({ // make call to potentially create a new playlist (if playlist_id == 0; trigger for create)
      url: '/create_new',
      type: 'POST',
      data : {'playlist_id' : playlist_id},
      success: function(response) {
        // console.log("loklok", response.playlist_id);
        var playlist_code = response.playlist_id;
        var is_new = response.is_new;
        $.ajax({ // reload the list of playlists
          url: '/host',
          type: 'GET',
          // headers : {"user_id" : user_id},
          json: true,
          success: function(response2){
              // console.log(response);
              var userProfileSource = document.getElementById('user-profile-template').innerHTML,
                  userProfileTemplate = Handlebars.compile(userProfileSource),
                  userProfilePlaceholder = document.getElementById('user-profile');
              userProfilePlaceholder.innerHTML = userProfileTemplate(response2);
              $('#login').hide();
              $('#loggedin').show();
              $.ajax({ // update the player
                  url: '/create',
                  type: 'POST',
                  data : {'playlist_id' : playlist_code, 'is_new': is_new},
                  success: function(response3) {
                    var hostPageSource = document.getElementById('host-page-template').innerHTML,
                        hostPageTemplate = Handlebars.compile(hostPageSource),
                        hostPagePlaceholder = document.getElementById('host-controls');
                    // response['playlist_uri'] = String(playlist_id);
                    hostPagePlaceholder.innerHTML = hostPageTemplate(response3);
                    }
              });
            }
        });
        }
  });
};

// function to tell server to update vote counts for this party and replace with new songs
function refresh_votes(party_id, playlist_id){
  $.ajax({
      url: '/refresh',
      type: 'POST',
      data: {'party_id':party_id, 'playlist_id' : playlist_id},
      success: function(response) {
        var hostPageSource = document.getElementById('host-page-template').innerHTML,
            hostPageTemplate = Handlebars.compile(hostPageSource),
            hostPagePlaceholder = document.getElementById('host-controls');
            hostPagePlaceholder.innerHTML = hostPageTemplate(response); // update host page to reflect changes
        }
  });
};
