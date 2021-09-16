import React, { Component } from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Sportify';

class App extends Component {
  constructor(props){
    super(props);
    this.sampleSong1 = {name: "Song", artist: "Artistimo", album: "My Favorite Album", id: 'manualSong', };
    this.sampleSong2 = {name: 'I Picked This Song', artist: "I like songs", album: "That one Album", id: 'anotherSong', };
    this.state = { searchResults: [],
                  playlistName: "New Playlist",
                  playlistTracks: [], }
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }
  addTrack(track){
    let index = this.state.playlistTracks.findIndex(playlistTrack => playlistTrack.id===track.id)
    // this conditional will prevent duplicate tracks from being added to the playlist.
    if (index === -1){ // good feature or no?
      let newPlaylist = this.state.playlistTracks.concat(track);
      this.setState({ playlistTracks: newPlaylist, });
    }
  }
  removeTrack(track){
    let index = this.state.playlistTracks.findIndex(playlistTrack => playlistTrack.id===track.id)
    // we don't strictly need the conditional, but this could let us expand features later
    if (index !== -1) { // if the chosen track is already in the playlist, remove it
      this.state.playlistTracks.splice(index, 1);
      this.setState({ playlistTracks: this.state.playlistTracks, });
    }else { // else add it to the playlist}
    };
  }

  updatePlaylistName(name){
    this.setState({ playlistName: name, });
  }

  savePlaylist(){
    let trackURIs = [];
    this.state.playlistTracks.forEach(track => {
      if (track.uri){
        trackURIs.push(track.uri)
      }
    });
    if (trackURIs.length>0){ // will not save an empty playlist
      Spotify.savePlaylist(this.state.playlistName, trackURIs);
      this.setState({ playlistName: 'New Playlist', playlistTracks: [], });
    }else{
      alert("Playlist is empty.");
    }
  }

  search(term){
    console.log("searching for '" + term + "'");
    if (term){
    Spotify.search(term)
      .then(results => {
        this.setState({
          searchResults: results,
        })
      })}else{this.setState({ searchResults: [], })};
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults onAdd={this.addTrack} searchResults={this.state.searchResults} isRemoval={false} />
            <Playlist onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onSave={this.savePlaylist} isRemoval={true} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
