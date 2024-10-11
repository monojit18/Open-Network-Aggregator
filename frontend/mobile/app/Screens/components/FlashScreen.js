import React, {Component} from 'react';
import {Text, View, SafeAreaView, ImageBackground, Image} from 'react-native';
import {MyStatusBar} from './DarkTheme';
import {FlashScreen1} from './Controls';

export default class FlashScreen extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.props.navigation.navigate('LandingPage');
    }, 3000);
  }
  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
        <ImageBackground
          source={require('../../assets/image/FlashBack.png')}
          style={{flex: 1}}
          imageStyle={{flex: 1}}>
          <View
            style={{
              flex: 0.3,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 30,
                color: '#ffffff',
                fontWeight: '600',
                lineHeight: 36,
              }}>
              “Unlock Your Future”
            </Text>
            <Image
              source={require('../../assets/image/LockBottom.png')}
              style={{height: 10, width: 90, alignSelf: 'flex-end', right: 65}}
            />

            <View style={{width: '80%', top: 20}}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: '#ffffff',
                  textAlign: 'center',
                }}>
                 Sign Up for Courses, Scholarships, and Job Opportunities!”
              </Text>
            </View>
          </View>
          <View style={{flex: 0.7, justifyContent: 'center'}}>
            <Image
              source={require('../../assets/image/FlashImage.png')}
              style={{height: 407, width: '100%'}}
            />
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}
