import React from "react";
import { Button, DrawerLayoutAndroid, Text, StyleSheet, View, Image, TouchableOpacity } from "react-native";

import HomeScreen from "../Home/HomeScreen";


const DrawerContent = (props) => {

  
  const closeDrawer = () => {
    drawerLayoutRef.current.closeDrawer();
  }
  const navigationView = (
    <View >
      <HeaderView {...props}
        closeDrawer={closeDrawer}
      />
    </View>
  );

  const drawerLayoutRef = React.useRef(null);

  const openDrawer = () => {
    if (drawerLayoutRef) {
      drawerLayoutRef.current.openDrawer();
    }
  }
  // const closeDrawer = () => {
  //   drawerLayoutRef.current.closeDrawer();
  // }

  return (
    <DrawerLayoutAndroid
      drawerWidth={300}
      drawerPosition='left'
      ref={drawerLayoutRef}
      renderNavigationView={() => navigationView}
    >
      <View style={styles.container}>
        <HomeScreen openDrawer={openDrawer} {...props} />
      </View>
    </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // paddingTop: 50,
    backgroundColor: "#ecf0f1",
    // padding: 8
  },

});

export default DrawerContent;


const HeaderView = (props) => {
  // console.log('props', props)
  return (
    <View>
      <View style={mystyles.TopProfileView}>
        <TouchableOpacity onPress={() => props.closeDrawer()}
          style={{ alignSelf: 'flex-start', margin: 10 }}>
          <ArrowRightBack height={24} width={24} />
        </TouchableOpacity>
        <View style={mystyles.ProfileCenter}>
          {/* <Image source={require('../../assets/image/Profile.png')} style={mystyles.ProfileImage} /> */}
        </View>
        <Text style={mystyles.ProfileName}>Sarah Doe</Text>
        <Text style={mystyles.ProfileContact}>Phone: +91 9876543210</Text>

      </View>
     
    </View>
  )
}
const mystyles = StyleSheet.create({
  NavHomeView: { height: 50, flexDirection: 'row', alignItems: 'center' },
  NavHomeText: { fontSize: 18, fontWeight: '400', color: '#333333', fontFamily: 'Roboto' },
  NavHomeImage: { height: 24, width: 24, marginHorizontal: 20 },
  TopProfileView: { height: 234, width: '100%', backgroundColor: '#008080', justifyContent: 'center', alignItems: 'center' },
  ProfileCenter: { height: 97, width: 97, borderRadius: 100, borderWidth: 2, borderColor: '#F09214', justifyContent: 'center', alignItems: 'center' },
  ProfileImage: { height: 95, width: 95, borderRadius: 95 },
  ProfileName: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 15, fontFamily: 'Roboto' },
  ProfileContact: { fontSize: 16, fontWeight: '600', color: '#fff', marginTop: 5, fontFamily: 'Roboto' }




});