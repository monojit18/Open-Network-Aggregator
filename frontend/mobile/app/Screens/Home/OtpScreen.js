import React, {Component} from 'react';
import {
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import {MyStatusBar} from '../components/DarkTheme';
import {MyButton1} from '../components/Controls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {storeToken} from '../../Utils/storage';
import {auth} from '../../Utils/APIs';

export default class OtpScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otp: '',
    };
  }

  handleOTPChange = otp => {
    this.setState({otp});
  };

  handleSignIn = async () => {
    const {id} = this.props.route.params;
    const {otp} = this.state;

    try {
      const response = await auth.verifyOTP(id, otp);
      // const res = await response.JSON();
      const {id: verifiedId, token} = response.data;
      // console.log('Response from otpverify: ', response);
      await storeToken(token);

      this.props.navigation.navigate('OnboardingScreen');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    }
  };
  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
        <ImageBackground
          source={require('../../assets/image/LoginTop.png')}
          style={{height: 209, width: '100%'}}>
          <View
            style={{justifyContent: 'flex-end', alignItems: 'center', top: 60}}>
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
        </ImageBackground>

        <View
          style={{
            height: 160,
            width: '100%',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
          <Image
            source={require('../../assets/image/Logo.png')}
            style={{height: 45, width: 45}}
          />
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#000',
              padding: 10,
            }}>
            Welcome
          </Text>
        </View>

        <View style={{padding: 20, top: 10}}>
          <Text style={{fontSize: 18, fontWeight: '500', color: '#000'}}>
            OTP{' '}
          </Text>
          <View
            style={{
              height: 51,
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              paddingHorizontal: 10,
              top: 3,
            }}>
            <TextInput
              placeholder="* * * *"
              style={{fontSize: 18}}
              maxLength={6}
              onChangeText={this.handleOTPChange}
              value={this.state.otp}
            />
          </View>
          <Text style={{color: '#A52B0E', fontSize: 12, top: 5}}>
            Resend OTP 00:30{' '}
          </Text>
        </View>

        <View style={{flex: 1}}>
          <MyButton1 onPress={this.handleSignIn}>Sign Up</MyButton1>
        </View>
      </SafeAreaView>
    );
  }
}
