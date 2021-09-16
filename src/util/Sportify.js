const clientId = '8d5756d7179b4454a0e1995c68b8610b';
const redirectUri ='http://shiny-drum.surge.sh/';

let accessToken = '';

let Spotify = {
  getAccessToken: function(term) {
    if (accessToken){
      // console.log("Already had this access token: " + accessToken);
      return accessToken;
    };
    let termString ='';
    if (term){ // term will save in the URL in the "state" to be accessed upon refresh (see SearchBar.js)
      termString = `term=${term}`
    }

    const authURL = `https://accounts.spotify.com/authorize/?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}&state=${termString}`;
    let myURL = window.location.href // URL of current page
    // console.log('Current URL: ' + myURL);
    accessToken = myURL.match(/access_token=([^&]*)/);
    let expiresIn = myURL.match(/expires_in=([^&]*)/);
    // console.log('Access token: ' + accessToken);
    if (accessToken && expiresIn ){
      accessToken = accessToken[1];
      expiresIn = expiresIn[1];
      // Reset access token after timeout and clear current URL
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    }else{
      console.log("Redirecting to Spotify...");
      window.location.assign(authURL);
    }
  },

  search: function(term, searchType) {
    if (!searchType){
      searchType = 'track';
    } // album, artist, playlist, track
    const searchURL = `https://api.spotify.com/v1/search?type=${searchType}&q=${term}`;
    this.getAccessToken(term);
    return fetch(searchURL, { headers: { Authorization: `Bearer ${accessToken}`, },
    }).then(response => response.json()).then(jsonResponse => {
      // console.log(jsonResponse);
      if(jsonResponse.tracks){
        return jsonResponse.tracks.items.map(track => {
          return {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri,
          }
        });
      }
        console.log("Ain't no tracks.");
        if (term){
          alert("No tracks were found!")
        }
        return [];
      }
    )
  },

  // createa and save a playlist that has been created from the <Playlist />
  savePlaylist: function(playlistName, trackURIs){
    if (!playlistName || !trackURIs){ // if missing info, don't bother trying
      return
    }
    this.getAccessToken();

    // retrieve the current user's userID
    const userInfoURL = 'https://api.spotify.com/v1/me';
    let userID = '';
    fetch(userInfoURL, { headers: { Authorization: `Bearer ${accessToken}`, },
    }).then(response => {
      if (response.ok){
        return response.json()}
      }).then(jsonResponse => {
      // console.log(jsonResponse); // user info
      userID = jsonResponse.id;

      // still within .then()
      // create a playlist with playlistName and return its playlistID
      const playlistCreateURL = `https://api.spotify.com/v1/users/${userID}/playlists`;
      let playlistID = '';
      // console.log(accessToken);
      fetch(playlistCreateURL, { method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', },
          body: JSON.stringify({name: playlistName, }), }
          ).then(response => {
          if (response){
            return response.json()};
          }).then(playlist => {
          // console.log(playlist); // playlist default data
          playlistID = playlist.id;


          // still within .then()
          // access the playlist by playlistID and POST new trackURIs to the endpoint
          const addToPlaylistURL = `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`;
          fetch(addToPlaylistURL, { method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', },
            body: JSON.stringify({ uris: trackURIs, }), })});}); // pasta
  },

};

export default Spotify;