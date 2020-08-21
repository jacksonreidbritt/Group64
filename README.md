# Group64

This is an old project I worked on while studying at the University of Colorado. The website had two different sides to it, depending on whether you are trying to host a playlist or you are trying to join a playlist as a guest. The primary function was to create playlists based off of the "vibe" that people were trying to listen to, which was determined by the features of the songs, according to the Spotify API. Guests would vote on the features they wanted, and the API would update the playllist on the hosts account to contain 30 songs with those features. You can see the Spotify API documentation here: https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/

# Hosting a playlist

If you were hosting a playlist. you would first login into your spotify account. After you login, the application would present you with a series of polling questions about the features to get a base line for the initial playlist. After answering these questions, the API would generate a new playlist in your library with songs that all conform to the options you seleted. It would also provide you with a 4-digit pin number to share with guests which they can use to login to your party. Then, while hosting, you can monitor changes to the feature requests by the guests and update the playlist when need be.

# Participating as a Guest

As a guest, all you would have to do is click the "Guest" button, input the pin provided by the host, then submit your votes for the features of the songs. There is a limit of one vote per 30 seconds to avoid spamming. When they host updates the playlist, your feature requests are adding in with everyone elses, and a new playlist is generate that matches those parameters.
