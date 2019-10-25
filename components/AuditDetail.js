import React, { Component } from 'react';
import { Text, View, TextInput,Platform,StyleSheet, ScrollView,ActivityIndicator, Image, FlatList, Alert,TouchableOpacity } from 'react-native';
import { ListItem } from "react-native-elements";
import RNPickerSelect from 'react-native-picker-select';
import { Actions } from 'react-native-router-flux';
import DatePicker from 'react-native-datepicker'
import Dimensions from 'Dimensions';
import Dialog from "react-native-dialog";
import AsyncStorage from '@react-native-community/async-storage';
import Swipeout from 'react-native-swipeout';
import ProgressLoader from 'rn-progress-loader';
import MultiSelect from 'react-native-multiple-select';

import {url as appUrl} from '../app.json';
var url = appUrl+'ats/GetAudit';
var urlAuditType = appUrl+'ats/GetAuditType';
var urlStores = appUrl+'ats/GetStores';
var urlSet = appUrl+'ats/SetAudit';

var urlItems = appUrl+'ats/SelectItem';
var urlSetItem = appUrl+'ats/SetAuditItem';
var urlSetAll = appUrl+'ats/SetAuditItemAll';


import editImg from '../images/edit.png';
import selectImg from '../images/select.png';
import calendarImg from '../images/calendar.png';
import plusImg from '../images/plus.png';
import addallImg from '../images/addall.png';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const MARGIN = 40;


class AuditDetail extends Component {

  constructor(props) {
    super(props);

    this.state = {

      insert: props.insert,
      idusr: '',
      loading: true,

      auditId: props.auditId,      
      name: null,
      idType: null,
      closingDate: null,
      auditState: 0,
      idstore: -1,
      auditItems: [],
      typeList: [],
      storesList: [],
      
      error: null,

      itemAdd: null,
      items: [],

      isErr: false,
      err: '',

      customersList: [],
      selectedCustomers: [],
      idcustomer: -1,

      showMessage: false

    };

  }

  showMessage = () => {
    this.setState({ showMessage: true });
  }
  handleCancelMessage = () => {
    this.setState({ showMessage: false });
  };

  getCustomer = async () => {
    try {
      
      var customers = await AsyncStorage.getItem('customers')
      var cus = Array.from(JSON.parse(customers))
      console.log(cus);

      AsyncStorage.getItem("idusr").then((value) => {
        this.setState({"idusr": value});
      })

      this.setState({customersList: cus});
    } catch(e) {
      Alert.alert(JSON.stringify(e));
    }
  }

  componentDidMount() {

    setTimeout(() => {
      Actions.refresh({ 
        //rightTitle: 'Save',
        onRight: () => this._save()
      });
    }, 0);

    this.getCustomer();



    if (!this.state.insert) {
      this.makeRemoteRequest();
    }
    else {

      this.setState({loading: true})

      fetch(urlAuditType)
      .then(res => res.json())
      .then(res => {

        this.setState({
          typeList: res.listings,
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });

      this.setState({loading: false})
    }

    
  }

  _checkErr() {

    var err="";
    if(this.state.idcustomer==-1) {
      err+="- Set Customer\n";
    }
    if(this.state.idstore==-1) {
      err+="- Set Store\n";
    }
    if(this.state.name==''||this.state.name==null) {
      err+="- Set Name\n";
    }
    if(this.state.idType==null) {
      err+="- Set Type\n";
    }
    if(this.state.closingDate==null) {
      err+="- Set Closing Date\n";
    }

    
    if(err.length==0) {
      this.setState({isErr: false, err: err});
      return true;
    }
    else { 
      err = err.substring(0,err.length-1);
      this.setState({isErr: true, err: err});
      return false;
    }

  }

  _save() {

    //Alert.alert('todo...');

    if(this._checkErr()) {
      this.setState({ loading: true });

      var type;
      if(this.state.insert) {
        type = 'I';
      }
      else {
        type = "E";
      }

      var idcustomer;

      for(i=0;i<this.state.selectedCustomers.length;i++) {
        idcustomer=this.state.selectedCustomers[i];
      }

      


      var details = {
          'type': type,
          'id': this.state.auditId,
          'name': this.state.name,
          'idtype': this.state.idType,
          'closingdate': this.state.closingDate,
          'auditstate': this.state.auditState,
          'idstore': this.state.idstore,
          'idcustomer': idcustomer,
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

        this.setState({loading:false, insert: false, auditId: responseJson.idAudit, showMessage: true})
        //Alert.alert(responseJson);

        //Actions.popTo('itemsList');
        
        setTimeout(() => {this.setState({showMessage: false})}, 2000)

      });
     
    }
  }

  makeRemoteRequest = () => {
    this.setState({ loading: true });

    console.log(url+'?auditId='+this.props.auditId);

    this.setState({loading: true})

      fetch(urlAuditType)
      .then(res => res.json())
      .then(res => {

        this.setState({
          typeList: res.listings,
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });

      this.setState({loading: false})

    fetch(url+'?idAudit='+this.props.auditId)
      .then(res => res.json())
      .then(res => {
        
        var cus = [];
        cus.push(res.idcustomer);

        this.setState({
          name: res.name,
          idType: res.idtype,
          closingDate: res.closing_date,
          auditState: res.state,
          idstore: res.idstore,
          auditItems: res.auditItems,
          loading: false,
          selectedCustomers: cus,
          idcustomer: res.idcustomer
        },
        this.loadSelect(res.idcustomer));
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  };

  loadSelect = (idcustomer) => {

    //Alert.alert(this.state.idcustomer);
    
      fetch(urlItems+'?idcustomer='+idcustomer)
      .then(res => res.json())
      .then(res => {

        this.setState({
          items: res.listings,
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
      
      AsyncStorage.getItem("idusr").then((value) => {
        this.setState({"idusr": value});
      })
      .then(res => {
        fetch(urlStores+'?idusr='+this.state.idusr+'&idcustomer='+idcustomer)
        .then(res => res.json())
        .then(res => {
  
          this.setState({
            storesList: res.listings,
          });
        })
        .catch(error => {
          this.setState({ error, loading: false });
        });
      });

      

  };

  reloadStores = (idcustomer) => {

    console.log('reload stores');
    fetch(urlStores+'?idusr='+this.state.idusr+'&idcustomer='+idcustomer)
        .then(res => res.json())
        .then(res => {
  
          this.setState({
            storesList: res.listings,
          });
        })
        .catch(error => {
          this.setState({ error, loading: false });
        });

  }

  reloadItems = (idcustomer) => {

    console.log('reload items');

    fetch(urlItems+'?idcustomer='+idcustomer)
        .then(res => res.json())
        .then(res => {
  
          this.setState({
            items: res.listings,
          });
        })
        .catch(error => {
          this.setState({ error, loading: false });
        });

  }

  renderLoader = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 10,
          borderColor: "#CED0CE"
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
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

  addAll = () => {
    
    this.setState({ loading: true });

    fetch(urlSetAll+'?idaudit='+this.state.auditId+'&idcustomer='+this.state.idcustomer)
        .then(res => res.json())
        .then(res => {
  
          this.setState({
            auditItems: res.auditItems,loading: false
          });
        })
        .catch(error => {
          this.setState({ error, loading: false });
        });

    
  };

  renderHeader = () => {
    return (
      <View style={styles.inputWrapper}>
        

        <TouchableOpacity
          style={styles.inlineImg6}
          onPress={()=>this.addAll()}
          activeOpacity={1}>
            <Image source={addallImg} style={styles.inlineImg2} />
        </TouchableOpacity>

        

        <View
          style={styles.inlineImg3}>
            <RNPickerSelect
                placeholder="Select Item..."
                items={this.state.items}
                style={pickerSelectStylesHidden}
                Icon={() => {
                  return <Image source={plusImg} style={styles.inlineImg2} />;
                }}
                onValueChange={value => {
                  this.setState({
                    itemAdd: value,
                  });
                }}
                onDonePress={() => {this.handleAdd()}}
              />
            
            
        </View>
       
        <View style={{height: 1, width: "100%", backgroundColor: "#CED0CE", marginLeft: "0%" }}/>
        <View style={{padding:15, backgroundColor: '#fff', alignItems: 'center',
        justifyContent: 'center'}}><Text style={{color:'#506D85',fontWeight:'bold',fontSize:20, }}>Audit Items</Text></View>
          <View style={{height: 1, width: "100%", backgroundColor: "#CED0CE", marginLeft: "0%" }}/>
      </View>
    );
  };


  renderTop = () => {
    if (this.state.insert) return null;

    return (
      
      <FlatList style={{backgroundColor: '#ccd3da'}}
        data={this.state.auditItems}
        renderItem={({ item }) => (

          <Swipeout autoClose={true} right={
            [
              {
                onPress: () => {
                  Alert.alert(
                    'Warning',
                    'Are you sure you want to delete '+item.itemName+'?',
                    [
                      {text: 'No', onPress: () => console.log('Cancel Pressed'), style:'cancel'},
                      {text: 'Yes', onPress: () => {
                        this.deleteItem(item.idAudit, item.idItem);
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
              title={item.itemName}
              subtitle={item.itemDescription}
              containerStyle={{ borderBottomWidth: 0 }}
              chevron={false}
            />
          </Swipeout>
        )}
        keyExtractor={item => ''+item.idItem}
        ItemSeparatorComponent={this.renderSeparator}
        ListHeaderComponent={this.renderHeader}
        onEndReachedThreshold={50}
      />

    );
  };
  

  handleAdd() {
    // The user has pressed the "Delete" button, so here you can do your own logic.
    // ...Your logic
    console.log(this.state.itemAdd);

    this.setState({loading:true})

    var details = {
        'type': 'I',
        'iditem': this.state.itemAdd,
        'idaudit': this.state.auditId,
    };


    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");


    fetch(urlSetItem, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    })
    .then((response) => response.json())
    .then((responseJson) => {

      this.setState({loading:false,auditItems:responseJson.auditItems})
      
    });
    
  };

  deleteItem(idaudit,iditem) {
    // The user has pressed the "Delete" button, so here you can do your own logic.
    // ...Your logic
    console.log(this.state.itemAdd);

    this.setState({loading:true})

    //Alert.alert(this.state.itemAdd+' '+this.state.auditId);


    var details = {
        'type': 'D',
        'idaudit': idaudit,
        'iditem': iditem,
    };


    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");


    fetch(urlSetItem, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    })
    .then((response) => response.json())
    .then((responseJson) => {

      this.setState({loading:false,auditItems:responseJson.auditItems})
      
    });
    
  };

  renderErr = () => {
    if (!this.state.err) return null;

    return (
      <View
        style={{
          padding: 10,
          borderTop: 1,
          borderBottom: 1,
          
          borderColor: '#DA291C',
          backgroundColor: 'rgba(218, 41, 28, 0.6)'
        }}
      >
        <Text style={{color:'#fff', fontSize:16, fontWeight:'bold'}}>Warning!</Text>
        <Text style={{color:'#fff', fontSize:16}}>{this.state.err}</Text>
      </View>
    );
  };

  onSelectedItemsChange = selectedItems => {
    this.setState({ selectedCustomers: selectedItems, idcustomer: selectedItems[0] });

    
    this.reloadStores(selectedItems[0]);
    this.reloadItems(selectedItems[0]);

  };

  showCustomer() {

      return (
          <View style={{marginBottom:0}}> 
            <Text style={styles.label}>Select Customers</Text>
            {/* and iOS onUpArrow/onDownArrow toggle example */}
            <View style={[styles.inputWrapper]}>
              {/*<Image source={selectImg} style={styles.inlineImg} />*/}
              <MultiSelect
                styleDropdownMenuSubsection={[styles.input2,{fontSize:16}]}
                styleInputGroup={{padding:10,fontSize:16}}
                styleRowList={{padding:5}}
                styleTextDropdownSelected={{color:'#000'}}
                hideTags
                items={this.state.customersList}
                uniqueKey="id"
                ref={(component) => { this.multiSelect = component }}
                onSelectedItemsChange={this.onSelectedItemsChange}
                selectedItems={this.state.selectedCustomers}
                selectText="Pick Customer"
                searchInputPlaceholderText="Search Customers..."
                onChangeInput={ (text)=> console.log(text)}
                tagRemoveIconColor="#506D85"
                tagBorderColor="#506D85"
                tagTextColor="#506D85"
                selectedItemTextColor="#506D85"
                selectedItemIconColor="#506D85"
                itemTextColor="#000"
                single={true}
                displayKey="description"
                searchInputStyle={{ color: '#000' }}
                submitButtonColor="#ccd3da"
                submitButtonText="Submit"
                iconSearch={true}
              />
              <View>
              {this.multiSelect && this.multiSelect.getSelectedItemsExt(this.state.selectedCustomers)}
              </View>
            </View>
          </View>

      )
    
  }

  render() {
    return (
      <View style={styles.container}>
        
        {this.renderErr()}
        <ProgressLoader
                visible={this.state.loading}
                isModal={true} isHUD={true}
                hudColor={"#fff"}
                color={"#ccd3da"} />

        <Dialog.Container visible={this.state.showMessage}>
          <Dialog.Title>Record Saved</Dialog.Title>
        </Dialog.Container>


        <ScrollView>

        <View>
        <View style={{padding:15, backgroundColor: '#fff',alignItems: 'center',
        justifyContent: 'center'}}><Text style={{color:'#506D85',fontWeight:'bold',fontSize:20, }}>Audit Detail</Text></View>
          <View style={{height: 1, width: "80%", backgroundColor: "#CED0CE", marginLeft: "10%", marginRight: "10%" }}/>
      </View>
          <View style={{padding:10}}>
            
            

            <Text style={[styles.label,{marginTop: 0}]}>Name</Text>
            <View style={styles.inputWrapper}>
              <Image source={editImg} style={styles.inlineImg} />
              <TextInput
                style={styles.input}
                placeholder="Name"
                secureTextEntry={false}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="done"
                placeholderTextColor="white"
                underlineColorAndroid="transparent"
                value={this.state.name}
                onChangeText={(text) => this.setState({name:text})}
              />
            </View>

            
            {this.showCustomer()}

            <Text style={styles.label}>Select Store</Text>
            <View style={styles.inputWrapper}>
              <Image source={selectImg} style={styles.inlineImg} />
              <RNPickerSelect
                placeholder="Select Store..."
                items={this.state.storesList}
                style={pickerSelectStyles}
                value={this.state.idstore}
                onValueChange={value => {
                  this.setState({
                    idstore: value,
                  });
                }}
              />
            </View>
            
            
            <Text style={styles.label}>Select Audit Type</Text>
            {/* and iOS onUpArrow/onDownArrow toggle example */}
            <View style={styles.inputWrapper}>
              <Image source={selectImg} style={styles.inlineImg} />
              <RNPickerSelect
                placeholder="Select Audit Type..."
                items={this.state.typeList}
                style={pickerSelectStyles}
                value={this.state.idType}
                onValueChange={value => {
                  this.setState({
                    idType: value,
                  });
                }}
                
              />
            </View>

            
            
            

            <Text style={styles.label}>Select Closing Date</Text>
            <View style={styles.inputWrapper}>
              <Image source={calendarImg} style={styles.inlineImg} />
              <DatePicker
                style={styles.input}
                date={this.state.closingDate}
                mode="date"
                placeholder="Select Closing Date"
                format="YYYY-MM-DD"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                showIcon={false}
                allowFontScaling={false}
                customStyles={{
                  dateInput:{alignItems: 'flex-start',textAlign:'left',borderWidth: 0,color: 'black',fontSize: 16},
                  placeholderText: {
                    fontSize: 16,
                    color: '#fff'
                  },
                  dateText:{
                    fontSize: 16,
                    color: 'black'
                  }
                }}
                onDateChange={(date) => {this.setState({closingDate: date})}}
              />
            </View>
          </View>

            
          
          {this.renderTop()}
        </ScrollView>
        
      </View>

    );
  }
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    
    borderWidth: 0,
    borderColor: 'gray',
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(204, 211, 218, 0.4)',
    paddingLeft: 45,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0,
    borderColor: '#ff00ff',
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon

    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(204, 211, 218, 0.4)',
    paddingLeft: 45,
  },
});

const pickerSelectStylesHidden = StyleSheet.create({
  inputIOS: {
    
    marginLeft: -30,
    borderWidth: 0,
    paddingRight: 0, // to ensure the text is never behind the icon
    height: 50,
    width: 100,
    color: 'white',
  },
  inputAndroid: {
    marginLeft: -30,
    borderWidth: 0,
    paddingLeft: 0,
    height: 50,
    width: 100,
    color: 'white',
  },
});


const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  label: {
    fontSize: 14,
    color: '#506D85',
    paddingLeft: 15,
    marginTop: 10
  },
  input2: {
    backgroundColor: 'rgba(204, 211, 218, 0.4)',
    width: DEVICE_WIDTH - 20,
    height: 40,
    marginHorizontal: 0,
    paddingLeft: 15,
    borderRadius: 20,
    color: 'black',
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(204, 211, 218, 0.4)',
    width: DEVICE_WIDTH - 20,
    height: 40,
    marginHorizontal: 0,
    paddingLeft: 45,
    borderRadius: 20,
    color: 'black',
    fontSize: 16
  },
  inputWrapper: {
    flex: 1,
  },
  inlineImg: {
    position: 'absolute',
    zIndex: 99,
    width: 22,
    height: 22,
    left: 15,
    top: 9,
  },

  inlineImg2: {
    position: 'absolute',
    zIndex: 99,
    width: 26,
    height: 26,
    right: 15,
    top: 15,
  },

  inlineImg3: {
    position: 'absolute',
    zIndex: 99,
    width: 26,
    height: 26,
    right: 0,
    top: 0,
  },
  


  inlineImg6: {
    position: 'absolute',
    zIndex: 99,
    width: 26,
    height: 26,
    left: 30,
    top: 0,
  },
  

});
export default AuditDetail;