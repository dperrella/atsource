import React from 'react';
import { Text, View, Image } from "react-native";
import { Scene, Router, Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import Placeholder from './components/Placeholder';
import Login from './components/Login';
import Items from './components/Items';
import ItemsDetail from './components/ItemsDetail';
import Request from './components/Request';
import Audit from './components/Audit';
import AuditDetail from './components/AuditDetail';
import AuditCompile from './components/AuditCompile';
import Profile from './components/Profile';

import Xxx from './components/xxx';

const TabIcon = ({ focused, title, iconName }) => {
  var color = focused ? '#de5c56' : '#506D85';
  var bg = focused ? '#ccd3da' : '#fff';
  
  //console.log(focused);
  return (
      <View style={{flex:1, flexDirection:'column', alignItems:'center', alignSelf:'center', justifyContent: 'center'}}>
          <Icon style={{color: color}} name={iconName || "circle"} size={26}/>
      </View>
  );
}

const AppLogo = () => {
    return (
      <View style={{ alignItems: 'center', marginTop: 0 }}>
        <Image source={require('./images/logockp2.png')}
               style={{ width: 140, height: 26 }} />
      </View>
    );
  };

const App = () => {
  return(
    <Router>
        
        <Scene key="root" >
            <Scene key="placeholder"
            component={Placeholder}
            title="AtSource"
            hideNavBar={true}
            initial
            />
            <Scene
            key="login"
            component={Login}
            title="Login"
            animation='fade'
            hideNavBar={true}
            />
            <Scene
            key="home"
            tabs={true}
            animation='fade'
            tabBarStyle={{ backgroundColor: '#fff' }}
            activeTintColor='#de5c56'
            inactiveTintColor='#506D85'
            hideNavBar={true}
            showLabel={true}
            >
                {/* Tab and it's scenes */}
                <Scene key="items" iconName="tags" color="#506D85" title="Items" icon={TabIcon} 
                renderTitle={() => { return <AppLogo />; }}
                headerTintColor="#fff"
                navigationBarStyle={{ backgroundColor: '#506D85' }}>
                    <Scene 
                        key="itemsList"
                        component={Items}
                        title="Items"
                        animation='fade'
                        onLeft={ ()=> {}}
                        onRight={ ()=> {}}
                        leftTitle={''}
                        rightTitle={'Add'}
                    />
                    <Scene 
                        key="itemsDetail"
                        component={ItemsDetail}
                        title="Items Detail"
                        animation='fade'
                        onRight={ ()=> {}}
                        rightTitle={'Save'}
                    />
                </Scene>
                <Scene key="request" iconName="edit" color="#506D85" title="Request" icon={TabIcon} 
                renderTitle={() => { return <AppLogo />; }}
                headerTintColor="#fff"
                navigationBarStyle={{ backgroundColor: '#506D85' }}>
                    <Scene 
                        key="requestList"
                        component={Request}
                        title="Request"
                        onRight={ ()=> {}}
                        rightTitle={'Add'}
                    />
                    <Scene 
                        key="requestDetail"
                        component={ItemsDetail}
                        title="Request Detail"
                        animation='fade'
                        onRight={ ()=> {}}
                        rightTitle={'Save'}
                    />
                </Scene>
                <Scene key="audit" iconName="tasks" title="Audit" color="#506D85" icon={TabIcon} 
                    renderTitle={() => { return <AppLogo />; }}
                    headerTintColor="#fff"
                    navigationBarStyle={{ backgroundColor: '#506D85' }}>
                    <Scene 
                        key="auditList"
                        component={Audit}
                        title="Audit"
                        onRight={ ()=> {}}
                        rightTitle={'Add'}
                    />
                    <Scene 
                        key="auditDetail"
                        component={AuditDetail}
                        title="Audit Detail"
                        animation='fade'
                        onRight={ ()=> {}}
                        rightTitle={'Save'}
                    />
                    <Scene 
                        key="auditCompile"
                        component={AuditCompile}
                        title="Audit Compile"
                        animation='fade'
                        onRight={ ()=> {}}
                        rightTitle={'Close'}
                    />
                </Scene>
                <Scene key="profile" iconName="user" title="Profile" color="#506D85" icon={TabIcon}
                    renderTitle={() => { return <AppLogo />; }}
                    headerTintColor="#fff"
                    navigationBarStyle={{ backgroundColor: '#506D85' }}>
                    <Scene 
                    key="profilePage"
                    component={Profile}
                    title="Profile"
                    onRight={ ()=> {}}
                    rightTitle={'Logout'}
                    />
                </Scene>
            </Scene>
            
        </Scene>
        
    </Router>
  );
}

export default App;