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
import {auth} from '../../Utils/APIs';

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
    };
  }

  componentDidMount() {
    setTimeout(() => {
      // this.props.navigation.navigate('HomeScreen');
    }, 3000);
  }

  handleEmailChange = email => {
    this.setState({email});
    // console.log(email);
  };

  handleLogin = async () => {
    const {email} = this.state;

    try {
      const res = await auth.login(email);
      const {id} = res.data;

      this.props.navigation.navigate('OtpScreen', {id});
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Login Error', 'Failed to login. Please try again.');
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
            Email ID Phone Number{' '}
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
              placeholder="you@example.com"
              style={{fontSize: 18}}
              value={this.state.email}
              onChangeText={this.handleEmailChange}
            />
          </View>
        </View>

        <View style={{flex: 1}}>
          <MyButton1 onPress={this.handleLogin}>Sign Up</MyButton1>
        </View>
      </SafeAreaView>
    );
  }
}
