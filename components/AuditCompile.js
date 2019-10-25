import React, { Component } from 'react';
import { Text, View, TextInput,Platform,StyleSheet, ScrollView,ActivityIndicator, Image, FlatList, Alert,TouchableOpacity } from 'react-native';
import { ListItem, SearchBar,ButtonGroup } from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Actions } from 'react-native-router-flux';
import Dimensions from 'Dimensions';
import ProgressLoader from 'rn-progress-loader';
import Dialog from "react-native-dialog";
import {url as appUrl} from '../app.json';
var url = appUrl+'ats/GetAudit';
var urlSet = appUrl+'ats/SetAuditItem';
var urlClose = appUrl+'ats/CloseAudit';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const MARGIN = 40;

class AuditCompile extends Component {

  constructor(props) {
    super(props);

    this.state = {

      loading: true,

      auditId: props.auditId,      
      name: null,
      type: null,
      auditItems: [],
      store: null,
      
      error: null,
      refreshing: false,
      search: '',

      dialogVisible: false,
      selItem: -1,
      selNote: '',

    };

    this.arrayholder = [];

  }

  showDialog = (itemId, note) => {
    this.setState({ selItem: itemId, selNote: note, dialogVisible: true });
  };

  handleCancel = () => {
    this.setState({ dialogVisible: false });
  };

  handleAdd = () => {
    // The user has pressed the "Delete" button, so here you can do your own logic.
    // ...Your logic

    console.log(this.state.noteIn);

    this.setState({ loading: true });

    console.log(urlSet+'?type=E&idaudit='+this.state.auditId+'&iditem='+this.state.selItem+'&note='+this.state.noteIn);

    fetch(urlSet+'?type=E&idaudit='+this.state.auditId+'&iditem='+this.state.selItem+'&note='+this.state.noteIn)
      .then(res => res.json())
      .then(res => {

        this.setState({
          auditItems: res.auditItems,
          loading: false,
          dialogVisible: false
        },
        function() {
          this.arrayholder = res.auditItems;
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });


    /*

    this.setState({loading:true})

    var details = {
        'type': 'I',
        'idItem': this.state.itemId,
        'barcode': this.state.barcodeIn,
    };


    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");


    fetch(urlSetBarcode, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    })
    .then((response) => response.json())
    .then((responseJson) => {

      this.setState({loading:false,barcodeList:responseJson.barcodeList})
      
    });
    
    this.setState({ dialogVisible: false });
    
    */


  };

  componentDidMount() {

    setTimeout(() => {
      Actions.refresh({ 
        //rightTitle: 'Save',
        onRight: () => this._save()
      });
    }, 0);

    this.makeRemoteRequest(true);

  }

  _save() {
    this.setState({ loading: true });

    fetch(urlClose+'?id='+this.props.auditId)
      .then(res => res.json())
      .then(res => {

        this.setState({ loading: false });

        
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
    
      Actions.reset('home');
  }

  makeRemoteRequest = (loading) => {
    this.setState({ loading: loading });

    console.log(url+'?auditId='+this.props.auditId);

    fetch(url+'?idAudit='+this.props.auditId)
      .then(res => res.json())
      .then(res => {

        this.setState({
          name: res.name,
          type: res.type,
          store: res.store,
          auditItems: res.auditItems,
          loading: false,
          refreshing: false
        },
        function() {
          this.arrayholder = res.auditItems;
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
        this.makeRemoteRequest(false);
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
    return <View>
      <View style={{flex: 1,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start', backgroundColor:'#fff'}}>
        <View style={{padding:15, backgroundColor: '#fff',alignItems: 'flex-start',
        justifyContent: 'center',width: '60%'}}>
          <Text style={{color:'#506D85',fontWeight:300,fontSize:30, }}>{this.state.name}</Text>
          <Text style={{marginTop:10, color:'#c0c0c0',fontWeight:'normal', fontSize:16, }}>Audit Type: {this.state.type}</Text>
          <Text style={{color:'#c0c0c0',fontWeight:'normal',fontSize:16, }}>{this.state.store}</Text>
        </View>

        <View style={{padding:15, backgroundColor: '#fff',alignItems: 'flex-end',
          justifyContent: 'center',width: '40%'}}>
            
            <View style={{
                paddingVertical: 2,
                paddingHorizontal: 0,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
              <Text style={{
                      fontSize: 16,
                      color: "black"
                  }}>Protected </Text>
              <Icon name='check' color='#506D85' size={20}/>
          </View>
          <View style={{
                paddingVertical: 2,
                paddingHorizontal: 0,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
              <Text style={{
                      fontSize: 16,
                      color: "black"
                  }}>Not Protected </Text>
              <Icon name='times' color='#506D85'  size={20}/>
           </View>
          <View style={{
                paddingVertical: 2,
                paddingHorizontal: 0,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
              <Text style={{
                      fontSize: 16,
                      color: "black"
                  }}>Not in Store </Text>
              <Icon name='dropbox' color='#506D85'  size={20}/>
          </View>
          <View style={{
                paddingVertical: 2,
                paddingHorizontal: 0,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
              <Text style={{
                      fontSize: 16,
                      color: "black"
                  }}>Note </Text>
              <Icon name='edit' color='#506D85'  size={20}/>
          </View>
          
          
          
          
          
        </View>

      </View>
      
      <View style={{height: 1, width: "80%", backgroundColor: "#CED0CE", marginLeft: "10%", marginRight: "10%" }}/>
    
      <SearchBar placeholder="Type Here..." 
    lightTheme round
    value={this.state.search}
    onChangeText={text => this.SearchFilterFunction(text)}
    onClear={text => this.SearchFilterFunction('')} /></View>;
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
      const itemData = item.itemName ? item.itemName.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });

    //console.log(this.arrayholder);
    console.log(newData);

    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      auditItems: newData,
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

  setAuditResult = (idaudit,iditem,result) => {
    this.setState({ loading: true });

    console.log(urlSet+'?type=E&idaudit='+idaudit+'&iditem='+iditem+'&result='+result);

    fetch(urlSet+'?type=E&idaudit='+idaudit+'&iditem='+iditem+'&result='+result)
      .then(res => res.json())
      .then(res => {

        this.setState({
          auditItems: res.auditItems,
          loading: false
        },
        function() {
          this.arrayholder = res.auditItems;
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  };

  

  render() {

  const component1 = () => <Icon name='check' color='#506D85' size={26}/>
  const component2 = () => <Icon name='times' color='#506D85'  size={26}/>
  const component3 = () => <Icon name='dropbox' color='#506D85'  size={26}/>
  const component4 = () => <Icon name='edit' color='#506D85'  size={26}/>


  const buttons = [{element:component1}, {element: component2}, {element: component3}];
  const buttons2 = [{element:component4}];
    
    return (
      <View style={{flex:1}}>
      <ProgressLoader
                visible={this.state.loading}
                isModal={true} isHUD={true}
                hudColor={"#fff"}
                color={"#ccd3da"} />

      <Dialog.Container visible={this.state.dialogVisible}>
          <Dialog.Title>Add Note</Dialog.Title>
          <Dialog.Description>
            Write Note to Item
          </Dialog.Description>
          <Dialog.Input value={this.state.selNote} onChangeText={(text) => this.setState({noteIn:text})}></Dialog.Input>
          <Dialog.Button label="Cancel" onPress={this.handleCancel} />
          <Dialog.Button label="Add" onPress={this.handleAdd} />
      </Dialog.Container>

      <FlatList style={{backgroundColor: '#ccd3da'}}
          data={this.state.auditItems}
          renderItem={({ item }) => (
            
              <ListItem
                title={item.itemName}
                subtitle={item.itemDescription}
                containerStyle={{ borderBottomWidth: 0 }}
                chevron={false}
                rightElement={
                
                  
                  <View style={{flex: 1,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    width:160
                    }}>
                    <View style={{width: '35%'}}>
                    <ButtonGroup
                      //selectedIndex={parseInt(item.note)}
                      selectedButtonStyle={{backgroundColor:'#ccd3da'}}
                      buttons={buttons2}
                      onPress={i => {
                        this.showDialog(item.idItem, item.note)
                      }}
                    />
                    </View>
                    <View style={{width: '65%'}}>
                    <ButtonGroup
                      selectedIndex={parseInt(item.auditResult)}
                      selectedButtonStyle={{backgroundColor:'#ccd3da'}}
                      buttons={buttons}
                      onPress={i => {
                        this.setAuditResult(item.idAudit, item.idItem, i)
                      }}
                      />
                    </View>
                  </View>
                
                }
                
                //rightElement={<View style={{width:120}}><ButtonGroup
                //  selectedIndex={parseInt(item.auditResult)}
                //  selectedButtonStyle={{backgroundColor:'#ccd3da'}}
                //  buttons={buttons}
                //  onPress={i => {
                //    this.setAuditResult(item.idAudit, item.idItem, i)
                //  }}
                //  />
                //  </View>}
              />
          )}
          keyExtractor={item => ''+item.idItem}
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

export default AuditCompile;