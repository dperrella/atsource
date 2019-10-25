import React, { Component } from 'react';
import { Text, View , StyleSheet, FlatList, ActivityIndicator, Alert, Image} from 'react-native';
import { ListItem, CheckBox } from "react-native-elements";
import {Actions} from 'react-native-router-flux';
import AsyncStorage from '@react-native-community/async-storage';
import {url as appUrl} from '../app.json';
import checked from '../images/check.png';
const urlSet = appUrl+'ats/SetPrefUserCustomer';

class Profile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      idusr: null,
      data: [],
      selcus: [],
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
      
      const value = await AsyncStorage.getItem('idusr')
      var customers = await AsyncStorage.getItem('customers')
      
      
      var cus = Array.from(JSON.parse(customers))
      console.log(cus);


      this.setState({idusr: value, data: cus});
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

  renderRight(item) {
    if(item.checked=='0') {
      return <View></View>;
    }
    else {
      return (
        <View><Image style={styles.checked} source={checked}/></View>
      )
    }
  }

  renderRow(item) {
    return (

        <ListItem
          leftAvatar={{
            avatarStyle: {backgroundColor:'#ccd3da'},
            title: item.description[0],
            showEditButton: false,
          }}
          rightElement={this.renderRight(item)}
          title={item.accountid}
          subtitle={item.description}
          containerStyle={{ borderBottomWidth: 0 }}
          chevron={false}
          onPress={() => this._handleCheck(item.id, item.checked)}

        />

    )
  }

  _handleCheck(id, checked) {

    newdata = []
    //selcus = [];

    this.state.data.forEach(function(item) {
      
      var newid = item.id;
      
      if (id === newid) {
        item.checked = (checked=='0' ? '1': '0');
      }
      newdata.push(item)
    });
    this.setState({data: newdata});


    //console.log(JSON.stringify(newdata))  
    //AsyncStorage.setItem('selcus', newdata);





    
    var details = {
        'idusr': this.state.idusr,
        'id': id,
        'checked': (checked=='0' ? '1': '0')
    };


    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    console.log(urlSet+'?'+formBody);

    fetch(urlSet+'?'+formBody, {
      
    })
     


  }




  render() {
    return (
      <FlatList style={{backgroundColor: '#ccd3da'}}
        data={this.state.data}
        renderItem={({ item }) => this.renderRow(item)}
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
  checked: {
    width: 20,
    height: 20
  },
  
});

export default Profile;