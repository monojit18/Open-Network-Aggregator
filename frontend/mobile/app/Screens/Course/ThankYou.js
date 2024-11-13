import {
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {Component} from 'react';

import CheckGreen from '../../assets/svg/CheckGreen.svg';
import {MyStatusBar} from '../components/DarkTheme';

export default class ThankYou extends Component {
  navigateToCourseHome = () => {
    this.props.navigation.navigate('CourseHome', {CourseName: 'Home'});
  };
  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
        <ImageBackground
          source={require('../../assets/image/ThankYouImg.png')}
          style={{flex: 1}}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('HomeScreen')}
            style={styles.TopView}>
            <Image
              source={require('../../assets/image/BackBlue.png')}
              style={{height: 24, width: 24}}
            />
          </TouchableOpacity>

          <View style={{padding: 15}}>
            <View style={styles.ThankYouView}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <CheckGreen height={36} width={36} />
                <Text style={styles.ThankYouText}>
                  Thank you!{'\n'}You have enrolled successfully 😊
                </Text>
              </View>
              {/* <View style={styles.BasicLevelView}>
                <Image
                  source={require('../../assets/image/Image213.png')}
                  style={{height: 87, width: 66}}
                />
                <View style={{marginLeft: 10, width: '75%'}}>
                  <Text style={styles.MyText}>
                    English for Common Interactions in the Workplace: Basic
                    Level
                  </Text>
                  <View style={styles.CommonView}>
                    <Image
                      source={require('../../assets/image/Frame12.png')}
                      style={{height: 27, width: 27}}
                    />
                    <Text style={styles.commonText}>
                      California Institute of Technology
                    </Text>
                  </View>
                </View>
              </View> */}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity style={styles.ButtonView}>
                  <Text style={styles.ButtonText}>View Details </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ButtonView}
                  onPress={this.navigateToCourseHome}>
                  <Text style={styles.ButtonText}>My Courses</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  ButtonView: {
    height: 28,
    width: 123,
    borderRadius: 20,
    backgroundColor: '#97C3F92B',
    opacity: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginHorizontal: 10,
  },
  ButtonText: {fontSize: 14, fontWeight: '500', color: '#1A40A2'},
  CommonView: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  commonText: {fontSize: 10, fontWeight: '500', color: '#000', marginLeft: 10},
  MyText: {fontSize: 14, fontWeight: '600', color: '#000'},
  BasicLevelView: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  ThankYouView: {
    height: 120,
    width: '100%',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#E5E7EB',
    padding: 10,
    elevation: 5,
    backgroundColor: '#fff',
  },
  ThankYouText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#013499',
    lineHeight: 25,
    marginLeft: 10,
  },
  TopView: {height: 50, justifyContent: 'center', paddingLeft: 15},
});
