import React, { Component } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert,StyleSheet } from 'react-native';
import { ListItem, SearchBar } from "react-native-elements";
import { Actions } from 'react-native-router-flux';
import ProgressLoader from 'rn-progress-loader';
import {url as appUrl} from '../app.json';
import {color as colorList} from '../app.json';
import AsyncStorage from '@react-native-community/async-storage';
const url = appUrl+'ats/GetItems';
var urlSet = appUrl+'ats/SetItem';

import Swipeout from 'react-native-swipeout';

class Items extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      data: [],
      error: null,
      refreshing: false,
      enterTime: new Date(),
      search: '',
      
    };

    this.arrayholder = [];
  }

  
  
  static onEnter = () => {
    Actions.refresh({
      enterTime: new Date()
    })
  }


  componentWillReceiveProps (nextProps) {

    if (this.props.enterTime !== nextProps.enterTime) {
      console.log('reload...');
      AsyncStorage.getItem("idusr").then((value) => {
        this.setState({"idusr": value});

        this.setState({loading:true});
        this.setAdd();
        this.makeRemoteRequest(true, value);

      })
    }
  }
  
  setAdd() {
    setTimeout(() => {
      Actions.refresh({ 
        rightTitle: 'Add',
        onRight: () => this._handlePress(-1, true),
      });
    }, 1000);
  }

  componentDidMount() {
    //this.setAdd();
    //this.makeRemoteRequest();

  }


  makeRemoteRequest = (loading, idusr) => {
    this.setState({ loading: loading });

    console.log(url+'?idusr='+idusr);
    fetch(url+'?idusr='+idusr)
      .then(res => res.json())
      .then(res => {

        this.setState({
          data: res.listings,
          loading: false,
          refreshing: false
        },
        function() {
          this.arrayholder = res.listings;
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  };

  handleRefresh = () => {
    this.setState(
      {
        refreshing: true
      },
      () => {
        this.makeRemoteRequest(false, this.state.idusr);
      }
    );
  };

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
    return <SearchBar placeholder="Type Here..." 
    lightTheme round
    value={this.state.search}
    onChangeText={text => this.SearchFilterFunction(text)}
    onClear={text => this.SearchFilterFunction('')} />;
  };

  search = text => {
    console.log(text);
  };
  clear = () => {
    this.search.clear();
  };
  SearchFilterFunction(text) {
    //passing the inserted text in textinput
    const newData = this.arrayholder.filter(function(item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });

    //console.log(this.arrayholder);
    console.log(newData);

    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      data: newData,
      search:text,
    });
  }

  renderFooter = () => {
    if (!this.state.loading) return null;

    /*
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
    */
   return null;
  };

  _handlePress(itemId, insert) {

    Actions.itemsDetail ({itemId: itemId, insert:insert, isProtected: 1})

  }

  render() {

    return (
      <View style={{flex:1}}>
      <ProgressLoader
                visible={this.state.loading}
                isModal={true} isHUD={true}
                hudColor={"#fff"}
                color={"#ccd3da"} />
      
        
        <FlatList style={{backgroundColor: '#ccd3da'}}
          data={this.state.data}
          renderItem={({ item }) => (
            <Swipeout autoClose={true} right={
              [
                {
                  onPress: () => {
                    Alert.alert(
                      'Alert',
                      'Are you sure you want to delete '+item.name+'?',
                      [
                        {text: 'No', onPress: () => console.log('Cancel Pressed'), style:'cancel'},
                        {text: 'Yes', onPress: () => {
                            
                          this.setState({ loading: true });
                          
                          var details = {
                              'type': 'D',
                              'id': item.id,
                              'isProtected': 1,
                          };
                        
                    
                          var formBody = [];
                          for (var property in details) {
                            var encodedKey = encodeURIComponent(property);
                            var encodedValue = encodeURIComponent(details[property]);
                            formBody.push(encodedKey + "=" + encodedValue);
                          }
                          formBody = formBody.join("&");
                    
                    
                          fetch(urlSet, {
                            method: 'POST',
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: formBody
                          })
                          .then((response) => response.json())
                          .then((responseJson) => {
                    
                            this.setState({loading:false,data: responseJson.listings,refreshing: false})
                            
                          });



                        }},
                        {cancellable: true}
                      ]
                    )
                  },
                  text: 'Delete', type: 'delete',
                }
              ]
            }>
              <ListItem
                leftAvatar={{
                  //avatarStyle: {backgroundColor:colorList[Math.floor(Math.random() * colorList.length)]},
                  avatarStyle: {backgroundColor: '#ccd3da'},
                  title: item.name[0],
                  showEditButton: false,
                }}
                title={item.name}
                subtitle={
                  <View style={{flex: 1,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start', marginTop:2}}>
                      <View style={{width: '49%',marginRight:5}}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={{color:'#637383'}}>{item.vendorname}</Text>
                      </View>
                      <View style={{width: '49%'}}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={{color:'#637383'}}>{item.brandname}</Text>
                      </View>
                    
                  </View>
                }
                containerStyle={{ borderBottomWidth: 0 }}
                chevron={true}
                onPress={() => this._handlePress(item.id, false)}
              />
            </Swipeout>
          )}
          keyExtractor={item => ''+item.id}
          ItemSeparatorComponent={this.renderSeparator}
          ListHeaderComponent={this.renderHeader}
          ListFooterComponent={this.renderFooter}
          onRefresh={this.handleRefresh}
          refreshing={this.state.refreshing}
          onEndReachedThreshold={50}
        />
        </View>
    );
  }
}

export default Items;

