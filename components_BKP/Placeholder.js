import React, { Component } from 'react'
import { View } from 'react-native'
import { Actions } from 'react-native-router-flux';
import AsyncStorage from '@react-native-community/async-storage';

class Placeholder extends Component {
  componentWillMount(){
    this.getData();
  }

  getData = async () => {
    try {
      const value = await AsyncStorage.getItem('idusr')
      if(value !== null) {
        Actions.home({ type: "reset" });
      }
      else {
        Actions.login({ type: "reset" });
      }
    } catch(e) {
     
    }
  }

  render() {
    return(
      <View>
      </View>
    );
  }
}

export default Placeholder;