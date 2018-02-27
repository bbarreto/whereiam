import React, { Component } from 'react';
import { Container, Row, Col, Button, FormGroup, Input, Label } from 'reactstrap';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import GoogleMapReact from 'google-map-react';
import {Firestore} from './fire.js';
import './App.css';

const UserMarker = ({ text }) => <div><img style={{width:'40px'}} src="map-marker-icon.png" /></div>;

export default class App extends Component {
  render() {
    return (

      <BrowserRouter>
        <Switch>
          <Route exact path='/' component={ShareLocation}/>
          <Route exact path='/:shareId' component={ViewLocation}/>
        </Switch>
      </BrowserRouter>

    );
  }
}

class ShareLocation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      latitude: -23.52,
      longitude: -46.88,
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
    if (this.state.watchId) {
      navigator.geolocation.clearWatch(this.state.watchId);
      this.setState({whatchId: null});
    }
  }

  render() {

    if (!this.state.watchId)
      return (
        <Container className="my-5">
          <Row>
            <Col className="text-center">
              <Button onClick={this.watchLocation}>Share location</Button>
            </Col>
          </Row>
        </Container>
      );


    return (
      <div>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyBibKbFOjEH6wfR89SmtZWkwXm9jkJsm6w' }}
          defaultZoom={18}
          defaultCenter={{lat: -23.52, lng: -46.88}}
          center={{lat: this.state.latitude, lng: this.state.longitude}}
          style={{minHeight:'800px'}}
        >
          <UserMarker
            lat={this.state.latitude}
            lng={this.state.longitude}
            text={'You are here'}
          />
        </GoogleMapReact>

        <div className="controls-top">
          <Button onClick={this.stopSharing}>Stop sharing</Button>
          <Input readOnly={true} type="text" value={'https://'+window.location.hostname+'/'+this.state.shareId} />
        </div>
      </div>
    );
  }
}

class ViewLocation extends Component {

  constructor(props) {
    super(props);
    this.state = {
      latitude: -23.52,
      longitude: -46.88
    };
  }

  componentWillMount() {
    var that = this;
    Firestore.collection("shares").doc(this.props.match.params.shareId).collection("history").orderBy("created_at", "asc").onSnapshot((querySnapshot) => {
      querySnapshot.forEach(function(doc) {
        console.log(doc.data());
        that.setState(doc.data());
      });
    });
  }

  render() {
    return (
      <div>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyBibKbFOjEH6wfR89SmtZWkwXm9jkJsm6w' }}
          defaultZoom={18}
          defaultCenter={{lat: -23.52, lng: -46.88}}
          center={{lat: this.state.position?this.state.position.latitude:-23.52, lng: this.state.position?this.state.position.longitude:-46.88}}
          style={{minHeight:'300px'}}
        >
          <UserMarker
            lat={this.state.position?this.state.position.latitude:-23.52}
            lng={this.state.position?this.state.position.longitude:-46.88}
            text={'The object is here'}
          />
        </GoogleMapReact>
        <div className="controls-top">
          <strong>Speed:</strong> {this.state.position && this.state.position.speed?this.state.position.speed:'not available'} {' '}
          <strong>Accuracy:</strong> {this.state.position && this.state.position.accuracy?this.state.position.accuracy:'0'}%
        </div>
      </div>
    );
  }
}
