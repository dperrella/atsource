import React, { Component } from 'react';
import {Modal, Text, View, TextInput,Platform,StyleSheet, ScrollView,ActivityIndicator, Image, Alert, FlatList, TouchableOpacity } from 'react-native';
import { ListItem, Button } from "react-native-elements";
import RNPickerSelect from 'react-native-picker-select';
import { Actions } from 'react-native-router-flux';
import Slideshow from 'react-native-image-slider-show';
import Dimensions from 'Dimensions';
import Swipeout from 'react-native-swipeout';
import Dialog from "react-native-dialog";
import ProgressLoader from 'rn-progress-loader';
import ImagePicker from 'react-native-image-picker';
import { RNCamera } from 'react-native-camera';
import AsyncStorage from '@react-native-community/async-storage';
import MultiSelect from 'react-native-multiple-select';
 

/*"url": "https://suitetest.azurewebsites.net/",*/

import {url as appUrl} from '../app.json';
import {urlPhoto as appUrlPhoto} from '../app.json';

var url = appUrl+'ats/GetItem';

var urlVendor = appUrl+'ats/GetVendor';
var urlBrand = appUrl+'ats/GetBrand';
var urlCategory = appUrl+'ats/GetCategory';
var urlCountry= appUrl+'ats/GetCountry';
var urlSet = appUrl+'ats/SetItem';
var urlSetBarcode = appUrl+'ats/SetBarcode';
var urlSetPhoto = appUrlPhoto+'ats/SetPhoto2';

var urlSetVendor = appUrl+'ats/SetVendor';
var urlSetBrand = appUrl+'ats/SetBrand';
var urlSetCategory = appUrl+'ats/SetCategory';




import editImg from '../images/edit.png';
import selectImg from '../images/select.png';
import plusImg from '../images/plus.png';
import cameraImg from '../images/cameraIcon.png';
import { threadId } from 'worker_threads';


const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const MARGIN = 40;

class ItemsDetail extends Component {

  constructor(props) {
    super(props);

    this.camera = null;

    

    this.state = {

      selectedItems:[],
      
      insert: props.insert,
      itemId: props.itemId,
      isProtected: props.isProtected,

      loading: true,

      name: null,
      description: null,
      vendor: null,
      brand: null,
      category: null,
      country: null,
      vendorName: null,
      brandName: null,
      categoryName: null,
      countryName: null,
      barcodeList: [],
      photoList: [],

      vendorList: [],
      brandList: [],
      categoryList: [],
      countryList: [],
      
      error: null,

      dialogVisible: false,
      barcodeIn: null,

      isErr: false,
      err: '',

      dialog2Visible: false,
      recordIn: null,
      tab: null,

      photoIn: null,

      camera: {
        type: RNCamera.Constants.Type.back,
        flashMode: RNCamera.Constants.FlashMode.auto,
        barcodeFinderVisible: true
      },
      showCamera: false,
      customersList: [],
      selectedCustomers: []

    };

    this.selectPhotoTapped = this.selectPhotoTapped.bind(this);
  }

  getCustomer = async () => {
    try {
      
      var customers = await AsyncStorage.getItem('customers')
      var cus = Array.from(JSON.parse(customers))
      console.log(cus);


      this.setState({customersList: cus});
    } catch(e) {
      Alert.alert(JSON.stringify(e));
    }
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
        'type': 'I',
        'idItem': this.state.itemId,
        'barcode': scanResult.data,
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
      

    }
    return;
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
                      
                </View>
            </View>

          </View>
        </Modal>

      
    );

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
      this.setState({loading: false})
    }

    this.loadSelect();
  }

  _checkErr() {

    var err="";
    if(this.state.name==''||this.state.name==null) {
      err+="- Set Name\n";
    }
    if(this.state.description==''||this.state.description==null) {
      err+="- Set Description\n";
    }
    if(this.state.vendor==null) {
      err+="- Set Vendor\n";
    }
    if(this.state.brand==null) {
      err+="- Set Brand\n";
    }
    if(this.state.category==null) {
      err+="- Set Category\n";
    }
    if(this.state.country==null) {
      err+="- Set Country\n";
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

      var details = {
          'type': type,
          'id': this.state.itemId,
          'name': this.state.name,
          'description': this.state.description,
          'idvendor': this.state.vendor,
          'idbrand': this.state.brand,
          'idcategory': this.state.category,
          'country': this.state.country,
          'isProtected': this.state.isProtected,
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

        this.setState({loading:false, insert: false, itemId: responseJson.idItem})
        //Alert.alert(responseJson);

        //Actions.popTo('itemsList');
        
      });
    }
  }
  

  makeRemoteRequest = () => {
    this.setState({ loading: true });

    fetch(url+'?idItem='+this.props.itemId)
      .then(res => res.json())
      .then(res => {

        this.setState({
          name: res.name,
          description: res.description,
          vendorName: res.vendorname,
          vendor: res.idvendor,
          brand: res.idbrand,
          category: res.idcategory,
          country: res.country,
          brandName: res.brandname,
          isProtected: res.isProtected,
          categoryName: res.categoryname,
          countryName: res.countryname,
          barcodeList: res.barcode,
          photoList: res.photo,
          loading: false
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  };

  loadSelect = () => {
    
    fetch(urlVendor)
      .then(res => res.json())
      .then(res => {

        this.setState({
          vendorList: res.listings,
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });

    fetch(urlBrand)
      .then(res => res.json())
      .then(res => {

        this.setState({
          brandList: res.listings,
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });

    fetch(urlCategory)
      .then(res => res.json())
      .then(res => {

        this.setState({
          categoryList: res.listings,
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });

    fetch(urlCountry)
      .then(res => res.json())
      .then(res => {

        this.setState({
          countryList: res.listings,
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  };

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

  renderTop = () => {
    if (this.state.insert) return null;

    return (
      <Slideshow 
      dataSource={this.state.photoList}/>
    );
  };

  renderPhoto = () => {
    if (this.state.insert) return null;

    return (
      <TouchableOpacity
            style={styles.inlineImg3}
            onPress={()=>this.selectPhotoTapped()}
            activeOpacity={1}>
              <Image source={cameraImg} style={styles.inlineImg2} />
            </TouchableOpacity>
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
    return (
      <View style={styles.inputWrapper}>
        
        <TouchableOpacity
          style={styles.inlineImg3}
          onPress={()=>this.showDialog()}
          activeOpacity={1}>
            <Image source={plusImg} style={styles.inlineImg2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.inlineImg6}
          onPress={()=>this.setState({showCamera: true})}
          activeOpacity={1}>
            <Image source={cameraImg} style={styles.inlineImg5} />
        </TouchableOpacity>
       
        <View style={{height: 1, width: "100%", backgroundColor: "#CED0CE", marginLeft: "0%" }}/>
        <View style={{padding:15, backgroundColor: '#fff', alignItems: 'center',
        justifyContent: 'center'}}><Text style={{color:'#506D85',fontWeight:'bold',fontSize:20, }}>Item Barcode</Text></View>
          <View style={{height: 1, width: "100%", backgroundColor: "#CED0CE", marginLeft: "0%" }}/>
      </View>
    );
  };

  renderBottom = () => {
    if (this.state.insert) return null;

    return (
      
      <FlatList style={{backgroundColor: '#ccd3da'}}
        data={this.state.barcodeList}
        renderItem={({ item }) => (

          <Swipeout autoClose={true} right={
            [
              {
                onPress: () => {
                  Alert.alert(
                    'Warning',
                    'Are you sure you want to delete '+item.barcode+'?',
                    [
                      {text: 'No', onPress: () => console.log('Cancel Pressed'), style:'cancel'},
                      {text: 'Yes', onPress: () => {
                          
                        this.delBarcode(item.id, this.state.itemId);

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
              title={item.barcode}
              containerStyle={{ borderBottomWidth: 0 }}
              chevron={false}
            />
          </Swipeout>
        )}
        keyExtractor={item => ''+item.id}
        ItemSeparatorComponent={this.renderSeparator}
        ListHeaderComponent={this.renderHeader}
        onEndReachedThreshold={50}
      />

    );
  };
  
  showDialog = () => {
    this.setState({ dialogVisible: true });
  };

  handleCancel = () => {
    this.setState({ dialogVisible: false });
  };

  showDialog2 = (tab) => {
    this.setState({ dialog2Visible: true, tab: tab });
  };

  handleCancel2 = () => {
    this.setState({ dialog2Visible: false, tab: null });
  };



  handleAdd2 = () => {

    console.log(this.state.tab);
    console.log(this.state.recordIn);
    this.setState({ loading: true });
    console.log(urlX+'?type=I&name='+this.state.recordIn);
    

    var urlX;
    if(this.state.tab=='V') {
      urlX = urlSetVendor;

      fetch(urlX+'?type=I&name='+this.state.recordIn)
      .then(res => res.json())
      .then(res => {

          this.setState({
            vendorList: res.vendorList,
            loading: false,
            vendor: res.vendor
          });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
    }
    else if(this.state.tab=='B') {
      urlX = urlSetBrand;

      fetch(urlX+'?type=I&name='+this.state.recordIn)
      .then(res => res.json())
      .then(res => {

          this.setState({
            brandList: res.brandList,
            loading: false,
            brand: res.brand
          });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
    }
    else if(this.state.tab=='C') {
      urlX = urlSetCategory;

      fetch(urlX+'?type=I&name='+this.state.recordIn)
      .then(res => res.json())
      .then(res => {

          this.setState({
            categoryList: res.categoryList,
            loading: false,
            category: res.category
          });
      })
      .catch(error => {
        Alert.alert(error)
        this.setState({ error, loading: false });
      });
    }
    
    
    

    this.setState({ dialog2Visible: false, tab: null });

  }

  handleAdd = () => {
    // The user has pressed the "Delete" button, so here you can do your own logic.
    // ...Your logic
    console.log(this.state.barcodeIn);

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
  };

  delBarcode = (id,idItem) => {
    // The user has pressed the "Delete" button, so here you can do your own logic.
    // ...Your logic
    
    this.setState({loading:true});

    var details = {
        'type': 'D',
        'id': id,
        'idItem': idItem
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

  selectPhotoTapped() {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true,
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        let source = { uri: 'data:image/jpeg;base64,' + response.data };
        
        //Alert.alert(response.uri);

        this.setState({
          photoIn: response,
        },
        this.fetchPhoto);

        photo = {
          title: this.state.name,
          caption: this.state.description,
          url: source,
        }

        photoListNew = this.state.photoList;
        photoListNew.push(photo);
        this.setState({photoList: photoListNew})
      }
    });
  }

  fetchPhoto() {

   this.setState({loading:true});

   var details = {
      'type': "I",
      'idItem': this.state.itemId,
      'sourceData': 'data:image/jpeg;base64,' + this.state.photoIn.data,
  };


  var formBody = [];
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");


  fetch(urlSetPhoto, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formBody
  })
  .then((response) => response.json())
  .then((responseJson) => {

    this.setState({loading:false, insert: false, itemId: responseJson.idItem})
    
  });


  }


  createFormData = (photo, body) => {
    const data = new FormData();
  
    data.append("photo", {
      name: photo.fileName,
      type: photo.type,
      uri:
        Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "")
    });

    Object.keys(body).forEach(key => {
      data.append(key, body[key]);
    });
  
    return data;
  };
  
  onSelectedItemsChange = selectedItems => {
    this.setState({ selectedCustomers: selectedItems });
  };

  
  showCustomer() {

    if(this.state.insert) {
      return null;
    }
    else {

      return (
          <View>
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
                selectText="Pick Customers"
                searchInputPlaceholderText="Search Customers..."
                onChangeInput={ (text)=> console.log(text)}
                tagRemoveIconColor="#000"
                tagBorderColor="#000"
                tagTextColor="#000"
                selectedItemTextColor="#000"
                selectedItemIconColor="#000"
                itemTextColor="#000"
                displayKey="description"
                searchInputStyle={{ color: '#000' }}
                submitButtonColor="#ccd3da"
                submitButtonText="Submit"
                iconSearch={true}
              />
              
            </View>
          </View>

      )
    }

  }

  render() {
    return (
      <View style={styles.container}>

        <ProgressLoader
                visible={this.state.loading}
                isModal={true} isHUD={true}
                hudColor={"#fff"}
                color={"#ccd3da"} />
        <ScrollView>

        <Dialog.Container visible={this.state.dialogVisible}>
          <Dialog.Title>Add Barcode</Dialog.Title>
          <Dialog.Description>
            Write or Read Barcode from Camera.
          </Dialog.Description>
          <Dialog.Input onChangeText={(text) => this.setState({barcodeIn:text})}></Dialog.Input>
          <Dialog.Button label="Cancel" onPress={this.handleCancel} />
          <Dialog.Button label="Add" onPress={this.handleAdd} />
        </Dialog.Container>


        <Dialog.Container visible={this.state.dialog2Visible}>
          <Dialog.Title>Add Record</Dialog.Title>
          <Dialog.Description>
            Write new Record
          </Dialog.Description>
          <Dialog.Input onChangeText={(text) => this.setState({recordIn:text})}></Dialog.Input>
          <Dialog.Button label="Cancel" onPress={this.handleCancel2} />
          <Dialog.Button label="Add" onPress={this.handleAdd2} />
        </Dialog.Container>

        {this.renderTop()}
        {this.renderErr()}


        

        <View>

        
        
        
          <View style={styles.inputWrapper}>
            {this.renderPhoto()}
            <View style={{padding:15, backgroundColor: '#fff',alignItems: 'center',
              justifyContent: 'center'}}><Text style={{color:'#506D85',fontWeight:'bold',fontSize:20, }}>Item Detail</Text></View>
              <View style={{height: 1, width: "80%", backgroundColor: "#CED0CE", marginLeft: "10%", marginRight: "10%" }}/>
            </View>
          </View>

          <View style={{padding:10}}>

          {this.showCustomer()}

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

          <Text style={styles.label}>Description</Text>
          <View style={styles.inputWrapper}>
            <Image source={editImg} style={styles.inlineImg} />
            <TextInput
              style={styles.input}
              placeholder="Description"
              secureTextEntry={false}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="done"
              placeholderTextColor="white"
              underlineColorAndroid="transparent"
              value={this.state.description}
              onChangeText={(text) => this.setState({description:text})}
            />
          </View>

          <Text style={styles.label}>Select Vendor</Text>
          {/* and iOS onUpArrow/onDownArrow toggle example */}
          <View style={styles.inputWrapper}>
            <Image source={selectImg} style={styles.inlineImg} />
            <RNPickerSelect
              placeholder="Select Vendor..."
              items={this.state.vendorList}
              style={pickerSelectStyles}
              value={this.state.vendor}
              onValueChange={ven => {
                this.setState({
                  vendor: ven,
                });
              }}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inlineImg4}
              onPress={()=>{this.showDialog2('V')}}>
              <Image source={plusImg} style={styles.iconEye} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Select Brand</Text>
          {/* and iOS onUpArrow/onDownArrow toggle example */}
          <View style={styles.inputWrapper}>
            <Image source={selectImg} style={styles.inlineImg} />
            <RNPickerSelect
              placeholder="Select Brand..."
              items={this.state.brandList}
              style={pickerSelectStyles}
              value={this.state.brand}
              onValueChange={bra => {
                this.setState({
                  brand: bra,
                });
              }}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inlineImg4}
              onPress={()=>{this.showDialog2('B')}}>
              <Image source={plusImg} style={styles.iconEye} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Select Category</Text>
          {/* and iOS onUpArrow/onDownArrow toggle example */}
          <View style={styles.inputWrapper}>
            <Image source={selectImg} style={styles.inlineImg} />
            <RNPickerSelect
              placeholder="Select Category..."
              items={this.state.categoryList}
              style={pickerSelectStyles}
              value={this.state.category}
              onValueChange={cat => {
                this.setState({
                  category: cat,
                });
              }}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.inlineImg4}
              onPress={()=>{this.showDialog2('C')}}>
              <Image source={plusImg} style={styles.iconEye} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Select Country</Text>
          {/* and iOS onUpArrow/onDownArrow toggle example */}
          <View style={styles.inputWrapper}>
            <Image source={selectImg} style={styles.inlineImg} />
            <RNPickerSelect
              placeholder="Select Country..."
              items={this.state.countryList}
              style={pickerSelectStyles}
              value={this.state.country}
              onValueChange={cou => {
                this.setState({
                  country: cou,
                });
              }}
            />
          </View>

          
        </View>
        {this.showCamera()}
        {this.renderBottom()}
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
  input: {
    backgroundColor: 'rgba(204, 211, 218, 0.4)',
    width: DEVICE_WIDTH - 20,
    height: 40,
    marginHorizontal: 0,
    paddingLeft: 45,
    borderRadius: 20,
    color: 'black',
    fontSize: 16,
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

  inlineImg4: {
    position: 'absolute',
    zIndex: 99,
    width: 26,
    height: 26,
    right: 10,
    top: 8,
  },

  inlineImg6: {
    position: 'absolute',
    zIndex: 99,
    width: 26,
    height: 26,
    left: 0,
    top: 0,
  },

  inlineImg5: {
    position: 'absolute',
    zIndex: 99,
    width: 26,
    height: 26,
    left: 15,
    top: 15,
  },

  iconEye: {
    width: 25,
    height: 25,
    tintColor: 'rgba(0,0,0,0.2)',
  },


  
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

export default ItemsDetail;