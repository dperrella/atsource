import React, { Component } from 'react';
import { Text, View , StyleSheet, FlatList, ActivityIndicator, Alert} from 'react-native';
import { ListItem } from "react-native-elements";
import {Actions} from 'react-native-router-flux';
import AsyncStorage from '@react-native-community/async-storage';

class Profile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      data: []
    };
  }

  componentDidMount() {
    this.getData();

    setTimeout(() => {
      Actions.refresh({ 
        rightTitle: 'Logout',
        onRight: () => this._onPress(),
      });
    }, 500);
  }
  
  
  getData = async () => {
    try {
      
      const value = await AsyncStorage.getItem('user')
      var customers = await AsyncStorage.getItem('customers')
      
      
      var cus = Array.from(JSON.parse(customers))
      console.log(cus);


      this.setState({user: value, data: cus});
    } catch(e) {
      Alert.alert(JSON.stringify(e));
    }
  }

  _onPress() {

    removeValue = async () => {
      try {
        console.log('onPress...');
        await AsyncStorage.removeItem('idusr')
      } catch(e) {
        // remove error
        Alert.alert(e);
      }
    
    }

    removeValue();
    console.log('Done.');
    Actions.login({type: 'reset'}); 
  
    
  }

  
  renderSeparator = () => {
    return (
      
      
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
      
      
      );
  };

  renderHeader = () => {
    return (
      <View>
    <View style={{padding:15, backgroundColor:'#fff',alignItems: 'center',
    justifyContent: 'center'}}><Text style={{color:'#506D85',fontWeight:'bold',fontSize:20, }}>User Customers</Text></View>
      <View style={{height: 1, width: "100%", backgroundColor: "#CED0CE", marginLeft: "14%" }}/>
      </View>
    );
  };

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: "#CED0CE"
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };


  render() {
    return (
      <FlatList style={{backgroundColor: '#ccd3da'}}
        data={this.state.data}
        renderItem={({ item }) => (
            <ListItem
              leftAvatar={{
                avatarStyle: {backgroundColor:'#ccd3da'},
                title: item.description[0],
                showEditButton: false,
              }}
              title={item.accountid}
              subtitle={item.description}
              containerStyle={{ borderBottomWidth: 0 }}
              chevron={false}
            />
        )}
        keyExtractor={item => ''+item.id}
        ItemSeparatorComponent={this.renderSeparator}
        ListHeaderComponent={this.renderHeader}
        ListFooterComponent={this.renderFooter}
        onEndReachedThreshold={50}
      />
    );
  }
}
const MARGIN = 40;
const styles = StyleSheet.create({
 
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
  
});

export default Profile;