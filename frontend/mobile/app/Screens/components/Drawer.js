import {
  Button,
  DrawerLayoutAndroid,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';

import Account_circle from '../../assets/svg/account_circle.svg';
import Assignment from '../../assets/svg/assignment_ind.svg';
import Book from '../../assets/svg/Book.svg';
import Certification from '../../assets/svg/Certification.svg';
import Clock from '../../assets/svg/ClockBlue.svg';
import CloseButton from '../../assets/svg/CloseButton.svg';
import {Image} from 'react-native-svg';
import Logo from '../../assets/image/Logo.png';
import School from '../../assets/svg/school.svg';
import Work from '../../assets/svg/work.svg';

const Drawer = forwardRef((props, ref) => {
  const drawerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    openDrawer: () => {
      drawerRef.current.openDrawer();
    },
    closeDrawer: () => {
      drawerRef.current.closeDrawer();
    },
  }));

  const navigationView = (
    <View style={styles.drawerContainer}>
      <View
        style={{
          marginVertical: 30,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Image
          source={require('../../assets/image/Logo.png')}
          style={{height: 28, width: 28}}
        />
        <TouchableOpacity onPress={() => drawerRef.current.closeDrawer()}>
          <CloseButton height={40} width={40} />
        </TouchableOpacity>
      </View>
      {/* <Text>sdfg</Text> */}

      <TouchableOpacity
        onPress={() => {
          drawerRef.current.closeDrawer();
          props.navigation.navigate('CourseHome', {
            searchText: 'show all courses',
            tabName: 'Explore Courses',
          });
        }}
        style={styles.TabView}>
        <Book height={24} width={24} />
        <Text style={styles.MenuView}>Courses</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          drawerRef.current.closeDrawer();
          props.navigation.navigate('JobOpportunitiesHome', {
            searchText: 'jobs',
          });
        }}
        style={styles.TabView}>
        <Work height={24} width={24} />
        <Text style={styles.MenuView}>Jobs</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          drawerRef.current.closeDrawer();
          props.navigation.navigate('FundingSupportHome', {
            searchText: 'scholarship for undergraduate',
          });
        }}
        style={styles.TabView}>
        <School height={24} width={24} />
        <Text style={styles.MenuView}>Scholarship </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          drawerRef.current.closeDrawer();
          props.navigation.navigate('CourseHome', {
            searchText: 'show me all courses',
            tabName: 'My Certifications',
          });
        }}
        style={styles.TabView}>
        <Certification height={22} width={24} />
        <Text style={styles.MenuView}>Certification </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          drawerRef.current.closeDrawer();
          props.navigation.navigate('CourseHome');
        }}
        style={styles.TabView}>
        <Clock height={24} width={24} />
        <Text style={styles.MenuView}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          drawerRef.current.closeDrawer();
          props.navigation.navigate('CourseHome');
        }}
        style={styles.TabView}>
        <Assignment height={24} width={24} />
        <Text style={styles.MenuView}>Profile </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          drawerRef.current.closeDrawer();
          props.navigation.navigate('CourseHome');
        }}
        style={styles.TabView}>
        <Account_circle height={24} width={24} />
        <Text style={styles.MenuView}>Sign up </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={300}
      drawerPosition="left"
      renderNavigationView={() => navigationView}>
      {props.children}
    </DrawerLayoutAndroid>
  );
});

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  drawerHeader: {
    fontSize: 24,
    marginBottom: 16,
  },
  MenuView: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginHorizontal: 20,
  },
  TabView: {flexDirection: 'row', alignItems: 'center', paddingVertical: 20},
});

export default Drawer;
