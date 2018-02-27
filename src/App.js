import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import GoogleMapReact from 'google-map-react';
import {Firestore} from './fire.js';

const UserMarker = ({ text }) => <div>{text}</div>;

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      shareId: '',
      watchId: null
    };

    this.watchLocation = this.watchLocation.bind(this);
    this.changeLocation = this.changeLocation.bind(this);
    this.startSharing = this.startSharing.bind(this);
    this.stopSharing = this.stopSharing.bind(this);
  }

  componentWillUnmount() {
    this.stopSharing();
  }

  watchLocation() {

    Firestore.collection("shares").add({
        created_at: new Date(),
        viewers: [],
        active: true
    })
    .then(doc => {
        this.setState({shareId: doc.id}, () => {
          this.startSharing();
        });
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });


  }

  startSharing() {
    this.setState({
      watchId: navigator.geolocation.watchPosition(
        (position) => {
          this.changeLocation(position)
        },
        (error) => this.setState({ error: error.message }),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 10 },
      )
    });
  }

  changeLocation(position) {
    Firestore.collection("shares").doc(this.state.shareId).collection("history").add({
        created_at: new Date(),
        position: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          speed: position.coords.speed
        }
    });

    this.setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      error: null,
    });
  }

  stopSharing() {
    if (this.state.watchId) navigator.geolocation.clearWatch(this.state.watchId);
  }

  render() {
    return (
        <Container className="my-5">
          <Row>
            <Col md={{size: 6}}>
            {this.state.watchId ?  <Button onClick={this.stopSharing}>Stop sharing</Button> : <Button onClick={this.watchLocation}>Share location</Button>}

            <input type="text" value={this.state.shareId} />

            {this.state.error ? <p>Error: {this.state.error}</p> : null}
            </Col>
            <Col md={{size: 6}}>
              {this.state.watchId ?
              <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyBibKbFOjEH6wfR89SmtZWkwXm9jkJsm6w' }}
                defaultZoom={8}
                defaultCenter={{lat: 59.95, lng: 30.33}}
                center={{lat: this.state.latitude, lng: this.state.longitude}}
                style={{minHeight:'300px'}}
              >
                <UserMarker
                  lat={this.state.latitude}
                  lng={this.state.longitude}
                  text={'You are here'}
                />
              </GoogleMapReact>
              :''}
            </Col>
          </Row>
        </Container>
    );
  }
}
