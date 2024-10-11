/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  Button,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  DrawerLayoutAndroid,
} from 'react-native';
import {MyStatusBar} from './DarkTheme';

export const HeaderNew = props => {
  return (
    <View>
      <View>
        <ImageBackground
          source={require('../../assets/image/MobileHeaderTop.png')}
          style={{height: 53, width: '100%'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <ImageBackground
              source={require('../../assets/image/HomeTopButton.png')}
              style={{
                height: 53,
                width: 115,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => props.openDrawer()}
                style={{padding: 20}}>
                <Image
                  source={require('../../assets/image/menu.png')}
                  style={{height: 15, width: 18}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => props.navigation.navigate('HomeScreen')}>
                <Image
                  source={require('../../assets/image/Logo.png')}
                  style={{height: 28, width: 28}}
                />
              </TouchableOpacity>
            </ImageBackground>
            <View
              style={{
                height: 53,
                width: 100,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {/* <TouchableOpacity style={{ padding: 10 }}>
                                <Image source={require('../../assets/image/search.png')} style={{ height: 24, width: 24 }} />
                            </TouchableOpacity> */}
              <TouchableOpacity style={{padding: 10}}>
                <Image
                  source={require('../../assets/image/bell.png')}
                  style={{height: 24, width: 24}}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

// export const AppDrawer = (props) => {
//     const drawer = useRef(null);

//     const closeDrawer = () => {
//         drawer.current.closeDrawer();
//     }

//     const openDrawer = () => {
//         drawer.current.openDrawer();
//     }
//     const navigationView = () => (
//         <View style={[styles.container, styles.navigationContainer]}>
//             <DrawerView closeDrawer={closeDrawer} {...props} />
//         </View>
//     );

//     const DrawerView = (props) => {
//         // console.log('props', props)
//         return (
//             <View>
//                 <View style={styles.TopProfileView}>
//                     <TouchableOpacity onPress={() => props.closeDrawer()}
//                         style={{ alignSelf: 'flex-start', margin: 10 }}>
//                         {/* <ArrowRightBack height={24} width={24} /> */}
//                     </TouchableOpacity>
//                     <View style={styles.ProfileCenter}>
//                         {/* <Image source={require('../../assets/image/Profile.png')} style={styles.ProfileImage} /> */}
//                     </View>
//                     <Text style={styles.ProfileName}>Sarah Doe</Text>
//                     <Text style={styles.ProfileContact}>Phone: +91 9876543210</Text>

//                 </View>

//             </View>
//         )
//     }

//     return (
//         <DrawerLayoutAndroid
//             ref={drawer}
//             drawerWidth={300}
//             // drawerPosition={drawerPosition}
//             renderNavigationView={navigationView}>
//             <View style={styles.container}>
//                 <HeaderNew openDrawer={openDrawer} {...props} />
//             </View>
//         </DrawerLayoutAndroid>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: 16,
//     },
//     navigationContainer: {
//         backgroundColor: '#ecf0f1',
//     },
//     NavHomeView: { height: 50, flexDirection: 'row', alignItems: 'center' },
//     NavHomeText: { fontSize: 18, fontWeight: '400', color: '#333333', fontFamily: 'Roboto' },
//     NavHomeImage: { height: 24, width: 24, marginHorizontal: 20 },
//     TopProfileView: { height: 234, width: '100%', backgroundColor: '#008080', justifyContent: 'center', alignItems: 'center' },
//     ProfileCenter: { height: 97, width: 97, borderRadius: 100, borderWidth: 2, borderColor: '#F09214', justifyContent: 'center', alignItems: 'center' },
//     ProfileImage: { height: 95, width: 95, borderRadius: 95 },
//     ProfileName: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 15, fontFamily: 'Roboto' },
//     ProfileContact: { fontSize: 16, fontWeight: '600', color: '#fff', marginTop: 5, fontFamily: 'Roboto' }

// });
