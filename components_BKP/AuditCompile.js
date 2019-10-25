import React, { Component } from 'react';
import { Text, View, TextInput,Platform,StyleSheet, ScrollView,ActivityIndicator, Image, FlatList, Alert,TouchableOpacity } from 'react-native';
import { ListItem, SearchBar,ButtonGroup } from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Actions } from 'react-native-router-flux';
import Dimensions from 'Dimensions';
import ProgressLoader from 'rn-progress-loader';
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

    };

    this.arrayholder = [];

  }

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
      <View>
        <View style={{padding:15, backgroundColor: '#fff',alignItems: 'center',
        justifyContent: 'center'}}>
          <Text style={{color:'#506D85',fontWeight:300,fontSize:30, }}>{this.state.name}</Text>
          <Text style={{marginTop:10, color:'#c0c0c0',fontWeight:'normal', fontSize:16, }}>Audit Type: {this.state.type}</Text>
          <Text style={{color:'#c0c0c0',fontWeight:'normal',fontSize:16, }}>{this.state.store}</Text>
        </View>
          <View style={{height: 1, width: "80%", backgroundColor: "#CED0CE", marginLeft: "10%", marginRight: "10%" }}/>
      </View>
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
  const component3 = () => <Icon name='question' color='#506D85'  size={26}/>


  const buttons = [{element:component1}, {element: component2}, {element: component3}];
    
    return (
      <View style={{flex:1}}>
      <ProgressLoader
                visible={this.state.loading}
                isModal={true} isHUD={true}
                hudColor={"#fff"}
                color={"#ccd3da"} />
      <FlatList style={{backgroundColor: '#ccd3da'}}
          data={this.state.auditItems}
          renderItem={({ item }) => (
            
              <ListItem
                title={item.itemName}
                subtitle={item.itemDescription}
                containerStyle={{ borderBottomWidth: 0 }}
                chevron={false}
                rightElement={<View style={{width:120}}><ButtonGroup
                  onPress={()=>{}}
                  selectedIndex={parseInt(item.auditResult)}
                  selectedButtonStyle={{backgroundColor:'#ccd3da'}}
                  buttons={buttons}
                  onPress={i => {

                    this.setAuditResult(item.idAudit, item.idItem, i)
                    
                  }}
                  /></View>}
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