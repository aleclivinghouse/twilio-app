import React, { Component } from 'react';
import Video from 'twilio-video';
import axios from 'axios';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Card, CardHeader, CardText} from 'material-ui/Card';

class VideoComponent extends Component {
 constructor(props) {
   super();
   this.state = {
     identity: null,
     roomName: '',
     roomNameErr: false,
     previewTracks: null,
     localMediaAvailable: false,
     hasJoinedRoom: false,
     activeRoom: null
   }
   this.joinRoom = this.joinRoom.bind(this);
   this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
   this.roomJoined = this.roomJoined.bind(this);
   this.leaveRoom = this.leaveRoom.bind(this);
   this.detachTracks = this.detachTracks.bind(this);
   this.detachParticipantTracks =this.detachParticipantTracks.bind(this);
 }
   componentWillMount(){
     axios.get('/token').then(results => {
       const {identity, token} = results.data;
       this.setState({identity, token}, () => {
         console.log('this is the state', this.state);
       });
     })
   }


   handleRoomNameChange(e){
     let room = e.target.value;
     this.setState({roomName: room});
   }


   joinRoom(){
     if (!this.state.roomName.trim()) {
            this.setState({ roomNameErr: true });
            return;
        }
        let connectOptions = {
        name: this.state.roomName
    };
    if (this.state.previewTracks) {
        connectOptions.tracks = this.state.previewTracks;
    }
    Video.connect(this.state.token, connectOptions).then(this.roomJoined, error => {
      alert('Could not connect to Twilio: ' + error.message);
    });
    }

    leaveRoom(){
      this.state.activeRoom.disconnect();
      this.setState({hasJoinedRoom: false, localMediaAvailable: false});
    }

    attachTracks(tracks, container) {
    tracks.forEach(track => {
      container.appendChild(track.attach());
    });
  }

  getTracks(participant) {
return Array.from(participant.tracks.values()).filter(function(publication) {
  return publication.track;
}).map(function(publication) {
  return publication.track;
});
}

    //attach the participants tracks
    attachParticipantTracks(participant, container) {
      var tracks = this.getTracks(participant);
      this.attachTracks(tracks, container);
    }

    detachTracks(tracks) {
    tracks.forEach(track => {
      track.detach().forEach(detachedElement => {
        detachedElement.remove();
      });
    });
  }

  detachParticipantTracks(participant) {
    var tracks = this.getTracks(participant);
    this.detachTracks(tracks);
  }

  roomJoined(room){
    // Called when a participant joins a room
    console.log("Joined as '" + this.state.identity + "'");
    this.setState({
      activeRoom: room,
      localMediaAvailable: true,
      hasJoinedRoom: true  // Removes ‘Join Room’ button and shows ‘Leave Room’
    });

    // Attach LocalParticipant's tracks to the DOM, if not already attached.
    var previewContainer = this.refs.localMedia;
    if (!previewContainer.querySelector('video')) {
      this.attachParticipantTracks(room.localParticipant, previewContainer);
    }


    room.participants.forEach(participant => {
      console.log("Already in Room '" + participant.identity + "'");
      let previewContainer = this.ref.remoteMedia;
      this.attachParticipantTracks(participant, previewContainer);
    });

    room.on('participantConnected', participant => {
      console.log("Joining: '" + participant.identity + "'");
    });

    room.on('trackAdded', (track, participant) => {
      console.log(participant.identity + ' added track: ' + track.kind);
      var previewContainer = this.refs.remoteMedia;
      this.attachTracks([track], previewContainer);
    });

    room.on('trackRemoved', (track, participant) => {
      this.log(participant.identity + ' removed track: ' + track.kind);
      this.detachTracks([track]);
    });

    room.on('participantDisconnected', participant => {
      console.log("Participant '" + participant.identity + "' left the room");
      this.detachParticipantTracks(participant);
    });

    room.on('disconnected', () => {
    if (this.state.previewTracks) {
      this.state.previewTracks.forEach(track => {
        track.stop();
      });
    }
    this.detachParticipantTracks(room.localParticipant);
    room.participants.forEach(this.detachParticipantTracks);
    this.state.activeRoom = null;
    this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
   });
  }


 render() {
       let showLocalTrack = this.state.localMediaAvailable ? (
      <div className="flex-item"><div ref="localMedia" /> </div>) : '';

    let joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
    <button label="Leave Room" secondary={true} onClick={this.leaveRoom}>Leave Room</button>) : (
    <button label="Join Room" primary={true} onClick={this.joinRoom}>Join Room</button>);
    return (
        <div className="flex-container">
      {showLocalTrack}
      <div className="flex-item">

      <input hintText="Room Name" onChange={this.handleRoomNameChange}
    errorText = {this.state.roomNameErr ? 'Room Name is required' : undefined}
       /><br />
      {joinOrLeaveRoomButton}
       </div>
      <div className="flex-item" ref="remoteMedia" id="remote-media" />
    </div>
    );
 }
}
export default VideoComponent;
