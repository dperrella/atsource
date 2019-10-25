import React, { Component } from 'react';
import { Modal, View, Text, FlatList, ActivityIndicator, Alert,StyleSheet,TouchableOpacity } from 'react-native';
import { ListItem, SearchBar, Button } from "react-native-elements";
import { Actions } from 'react-native-router-flux';
import ProgressLoader from 'rn-progress-loader';
import {url as appUrl} from '../app.json';
import {color as colorList} from '../app.json';
import AsyncStorage from '@react-native-community/async-storage';
import { RNCamera } from 'react-native-camera';
import Dimensions from 'Dimensions';
import Icon from 'react-native-vector-icons/FontAwesome';

const url = appUrl+'ats/GetItems';

const urlGetItem = appUrl+'ats/GetItemByBarcode';
var urlSet = appUrl+'ats/SetItem';

import Swipeout from 'react-native-swipeout';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const MARGIN = 40;

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
      camera: {
        type: RNCamera.Constants.Type.back,
        flashMode: RNCamera.Constants.FlashMode.auto,
        barcodeFinderVisible: true
      },
      showCamera: false,
      barcodeIn: null,

      showModal: false

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

        left: this._renderLeft,
      });
    }, 100);
  }

  _renderLeft = () => {
    return(
        <TouchableOpacity style={{marginLeft:10}} onPress={()=>this.setState({showCamera: true})} >
            <Icon name="camera" size={26} color='white' />
        </TouchableOpacity>
    );
  };

 
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


  onBarCodeRead(scanResult) {
    console.warn(scanResult.type);
    console.warn(scanResult.data);
    if (scanResult.data != null) {
	    
      this.setState({
        showCamera:false,
        barcodeIn: scanResult.data,
      });


      this.setState({loading:true})

      var details = {
          'barcode': scanResult.data,
      };


      var formBody = [];
      for (var property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");


      fetch(urlGetItem, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formBody
        })
        .then((response) => response.json())
        .then((responseJson) => {

          
          this.setState({loading:false},
            this.goTo(responseJson.iditem)
          )
          

          /*
          var itemid = responseJson.iditem;

          if(itemid>0) {
            Actions.itemsDetail ({itemId: responseJson.iditem, insert:false, isProtected: 1})
          }
          else {
            Alert.alert('Barcode Unknown');
          }
          */

          //Actions.itemsDetail ({itemId: responseJson.iditem, insert:false, isProtected: 1})
          
        });
        



    }
    return;
  }

  goTo(itemid) {

    this.setState({loading:false});

    if(itemid>0) {
      Actions.itemsDetail ({itemId: itemid, insert:false, isProtected: 1})
    }
    else {
      this.setState({showModal:true});
    }

  }

  newItem() {

    this.setState({showModal:false});
    Actions.itemsDetail ({itemId: -1, insert:true, isProtected: 1})
    
  }

  newWish() {

    this.setState({showModal:false});    
    Actions.request ({itemId: -1, insert:true, isProtected: 0})
    Actions.requestDetail ({itemId: -1, insert:true, isProtected: 0})
    
  }

  showModal() {

    if (!this.state.showModal) 
      return null;

    return (
    
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.state.showModal}
        >

        <View style={{marginTop: 0}}>
          <View style={{height:DEVICE_HEIGHT}}>

            <View style={{flex: 1,
              justifyContent: 'center',
              alignItems: 'center'}}>
              
              <View style={{alignItems: 'center'}}>
                <Text style={{color:'#506D85',fontWeight:"300",fontSize:30, }}>Product not available</Text>
                <Text style={{color:'#506D85',fontWeight:"300",fontSize:30, }}>in Item List</Text>
              </View>

              <View style={{marginTop:10}}>
                <Button
                  title="Add New Item"
                  buttonStyle={{
                    backgroundColor:'#506D85', width:300
                  }}
                  onPress={() => this.newItem()}
                />
              </View>

              <View style={{marginTop:10}}>
                <Button
                  title="Add to WishList"
                  buttonStyle={{
                    backgroundColor:'#506D85', width:300
                  }}
                  onPress={() => this.newWish()}
                />
              </View>

              <View style={{marginTop:10}}>
                <Button
                  title="Expand Research"
                  buttonStyle={{
                    backgroundColor:'#506D85', width:300
                  }}
                  onPress={() => { this.setState({showModal:false}) }}
                />
              </View>

            </View>
            <View style={[styles.overlay, styles.bottomOverlay]}>

            <Button
              title="Close"
              buttonStyle={{
                backgroundColor:'#506D85'
              }}
              onPress={() => { this.setState({showModal:false}) }}
            />

            </View>
          </View>
        </View>

      </Modal>
    )
  }

  showCamera() {
    
    if (!this.state.showCamera) 
      return null;

      
    return (

      

      <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.showCamera}
          >
          <View style={{marginTop: 0}}>
            
            <View style={{height:DEVICE_HEIGHT}}>
                <RNCamera
                    ref={ref => {
                      this.camera = ref;
                    }}
                    barcodeFinderVisible={true}
                    barcodeFinderWidth={DEVICE_WIDTH-40}
                    barcodeFinderHeight={250}
                    barcodeFinderBorderColor="white"
                    barcodeFinderBorderWidth={2}
                    defaultTouchToFocus
                    flashMode={this.state.camera.flashMode}
                    mirrorImage={false}
                    onBarCodeRead={this.onBarCodeRead.bind(this)}
                    onFocusChanged={() => {}}
                    onZoomChanged={() => {}}
                    permissionDialogTitle={'Permission to use camera'}
                    permissionDialogMessage={'We need your permission to use your camera phone'}
                    style={styles.preview}
                    type={this.state.camera.type}
                />
                <View style={[styles.overlay, styles.topOverlay,{marginTop:20,alignContent:'center'}]}>
                  <Text style={styles.scanScreenMessage}>Please scan the barcode.</Text>
                </View>
                <View style={[styles.overlay, styles.bottomOverlay]}>

                  <Button
                    title="Close"
                    buttonStyle={{
                      backgroundColor:'#506D85'
                    }}
                    onPress={() => { this.setState({showCamera:false}) }}
                  />

                  <Button
                    title="Test 0055440"
                    buttonStyle={{
                      backgroundColor:'#506D85'
                    }}
                    onPress={()=>this.onBarCodeRead({"type":"Test", "data": "0055440"}) }
                  />


                  <Button
                    title="Barcode Unknown"
                    buttonStyle={{
                      backgroundColor:'#506D85'
                    }}
                    onPress={()=>this.onBarCodeRead({"type":"Test", "data": "XXXXXXXXXXXXXXXXXX"}) }
                  />
                      
                </View>
            </View>

          </View>
        </Modal>

      
    );

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
                //leftAvatar={{
                //  avatarStyle: {backgroundColor: '#ccd3da'},
                //  title: item.name[0],
                //  showEditButton: false,
                //}}
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

        {this.showCamera()}
        {this.showModal()}
        
        </View>
    );
  }
}

const styles = StyleSheet.create({
  
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center'
  },
  topOverlay: {
    top: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bottomOverlay: {
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  enterBarcodeManualButton: {
    padding: 15,
    color: '#ffffff',
  },
  scanScreenMessage: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  }
  
});


export default Items;

