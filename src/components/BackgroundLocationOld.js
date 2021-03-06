import _ from 'lodash';
import React, { Component } from 'react';
import { View } from 'react-native';
import Permissions from 'react-native-permissions';
import { connect } from 'react-redux';
import BackgroundGeolocation from 'react-native-background-geolocation';

import * as actions from '../actions';

const LATITUDE_DELTA = 0.002;
const LONGITUDE_DELTA = 0.0035;

class BackgroundLocation extends Component {
  componentDidMount() {
    console.log('componentDidMount()');

    const configurationOptions = {
      desiredAccuracy: 0,
      distanceFilter: 5,
      activityRecognitionInterval: 1,
    }

    // console.log('configurationOptions: ', configurationOptions);

    // Listen to events
    BackgroundGeolocation.on('location', this.onLocation.bind(this), this.onError);
    // BackgroundGeolocation.on('motionchange', this.onMotionChange.bind(this), this.onError);

    // Configure
    BackgroundGeolocation.configure(configurationOptions)

    BackgroundGeolocation.changePace(true, function() {
      console.log('background location now tracking');
    });

    BackgroundGeolocation.start(state => {
      // console.log('- BackgroundGeolocation started, state: ', state);
    })
  }

  componentWillUnmount() {
    BackgroundGeolocation.un('location', this.onLocation);

    BackgroundGeolocation.changePace(false, function() {
      console.log('background location now stationery');
      // this.props.keepAppOnOrOff(false)
    });
  }


  onLocation(location) {
    const d = new Date();
    const sec = d.getSeconds();

    console.log('seconds: ', sec);
    console.log('onLocation(): ', location);

    const lat = parseFloat(location.coords.latitude);
    const long = parseFloat(location.coords.longitude);

    const initialRegion = {
      latitude: lat,
      longitude: long,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA
    };

    // convert speed from m/s to mph
    const speed = (location.coords.speed * 2.23694).toFixed(1);

    this.props.setCurrentPosition(initialRegion);
    this.props.checkInArea(initialRegion, this.props.user);
    this.props.setCurrentSpeed(speed);
    this.props.pushDataToDB(initialRegion, speed, this.props.user);
  }

  onMotionChange(event) {
    console.log('onMotionChange(): ', event);
  }

  onError() {
    console.log('Error getting location.');
  }

  render() {
    return (<View />)
  }
}

function mapStateToProps(state) {
  console.log('BackgroundLocation state: ', state);
  return {
    user: state.auth.user,
  };
}

export default connect(mapStateToProps, actions)(BackgroundLocation);
