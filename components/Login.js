import React, { Component } from 'react';
import {StyleSheet, ImageBackground, View, Text, Image, 
  KeyboardAvoidingView, TouchableOpacity,
  Animated, Easing, Alert, TextInput} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Dimensions from 'Dimensions';
import {Actions, ActionConst} from 'react-native-router-flux';


import bgSrc from '../images/splash.jpg';
import logoImg from '../images/logo.png';
import usernameImg from '../images/username.png';
import passwordImg from '../images/password.png';
import eyeImg from '../images/eye_black.png';
import spinner from '../images/loader.gif';

import {url as appUrl} from '../app.json';
const url = appUrl+'ats/Login';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showPass: true,
      press: false,
      username: '',
      password: ''
    };
    this.showPass = this.showPass.bind(this);

    this.buttonAnimated = new Animated.Value(0);
    this.growAnimated = new Animated.Value(0);
    this._onPress = this._onPress.bind(this);

  }

  _onPress() {
    if (this.state.isLoading) return;

    this.setState({isLoading: true});
    Animated.timing(this.buttonAnimated, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear,
    }).start();

    console.log(this.state.username);
    console.log(this.state.password);

    fetch(url+'?username='+this.state.username.toUpperCase()+'&password='+this.state.password)
      .then((response) => response.json())
      .then((responseJson) => {

        this.setState({
          isLoading: false,
        }, function(){
            
          this.buttonAnimated.setValue(0);
          this.growAnimated.setValue(0);

            if(responseJson.user_exist!=0) {

                /*
                try {
                    AsyncStorage.setItem('user', responseJson);
                    
                } catch (error) {
                    // Error saving data
                    Alert.alert(error);
                }
                */

               
                //AsyncStorage.setItem('user', responseJson);
                AsyncStorage.setItem('idusr', this.state.username.toUpperCase());
                AsyncStorage.setItem('customers', JSON.stringify(responseJson.customers));
                console.log(JSON.stringify(responseJson.customers));
                
                this._onGrow();
                Actions.home(); 
                
            }
            else {
                Alert.alert(responseJson);
            }
            
        });

      })
      .catch((error) =>{
        console.error(error);
        Alert.alert(error);
      });


    
  }

  _onGrow() {
    Animated.timing(this.growAnimated, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear,
    }).start();
  }


  showPass() {
    this.state.press === false
      ? this.setState({showPass: false, press: true})
      : this.setState({showPass: true, press: false});
  }

  render() {

    const changeWidth = this.buttonAnimated.interpolate({
      inputRange: [0, 1],
      outputRange: [DEVICE_WIDTH - MARGIN, MARGIN],
    });
    const changeScale = this.growAnimated.interpolate({
      inputRange: [0, 1],
      outputRange: [1, MARGIN],
    });

    return (
      
      

      <ImageBackground style={styles.picture} source={bgSrc}>
        <View style={styles.container}>
          <Image source={logoImg} style={styles.image} />
          <Text style={styles.text}>Login to App @Source</Text>
        </View>
        <KeyboardAvoidingView behavior="padding" style={{flex: 1,alignItems: 'center'}}>
          
          <View style={styles.inputWrapper}>
            <Image source={usernameImg} style={styles.inlineImg} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              secureTextEntry={false}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="done"
              placeholderTextColor="white"
              underlineColorAndroid="transparent"
              onChangeText={(text) => this.setState({username:text})}
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <Image source={passwordImg} style={styles.inlineImg} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={this.state.showPass}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="done"
              placeholderTextColor="white"
              underlineColorAndroid="transparent"
              onChangeText={(text) => this.setState({password:text})}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inlineImg2}
              onPress={this.showPass}>
              <Image source={eyeImg} style={styles.iconEye} />
            </TouchableOpacity>
          </View>

      
          
        </KeyboardAvoidingView>
        <View style={{flex: 1,
          top: 105,
          width: DEVICE_WIDTH,
          flexDirection: 'row',
          justifyContent: 'space-around'}}>
          <Text style={styles.text2}>Forgot Password?</Text>
        </View>
        <View style={{flex: 1,
          top: -95,
          alignItems: 'center',
          justifyContent: 'flex-start'}}>
          <Animated.View style={{width: changeWidth}}>
            <TouchableOpacity
              style={styles.button}
              onPress={this._onPress}
              activeOpacity={1}>
              {this.state.isLoading ? (
                <Image source={spinner} style={styles.spinner} />
              ) : (
                <Text style={styles.text2}>LOGIN</Text>
              )}
            </TouchableOpacity>
            <Animated.View
              style={[styles.circle, {transform: [{scale: changeScale}]}]}
            />
          </Animated.View>
        </View>
      </ImageBackground>

    );
  }
}

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const MARGIN = 40;

const styles = StyleSheet.create({
  picture: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
  },
  container: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 158,
    height: 130,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  btnEye: {
    position: 'absolute',
    top: 75,
    right: 28,
  },
  iconEye: {
    width: 25,
    height: 25,
    tintColor: 'rgba(0,0,0,0.2)',
  },
  text2: {
    color: 'white',
    backgroundColor: 'transparent',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#de5c56',
    height: MARGIN,
    borderRadius: 20,
    zIndex: 100,
  },
  circle: {
    height: MARGIN,
    width: MARGIN,
    marginTop: -MARGIN,
    borderWidth: 1,
    borderColor: '#de5c56',
    borderRadius: 100,
    alignSelf: 'center',
    zIndex: 99,
    backgroundColor: '#de5c56',
  },
  spinner: {
    width: 24,
    height: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: DEVICE_WIDTH - 40,
    height: 40,
    marginHorizontal: 20,
    paddingLeft: 45,
    borderRadius: 20,
    color: '#ffffff',
  },
  inputWrapper: {
    flex: 1,
  },
  inlineImg: {
    position: 'absolute',
    zIndex: 99,
    width: 22,
    height: 22,
    left: 35,
    top: 9,
  },
  inlineImg2: {
    position: 'absolute',
    zIndex: 99,
    width: 22,
    height: 22,
    right: 35,
    top: 9,
  },
});

export default Login;