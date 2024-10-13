import React, {Component} from 'react';
import {
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import {MyStatusBar} from '../components/DarkTheme';
import {Picker} from '@react-native-picker/picker';
import RadioGroup from 'react-native-radio-buttons-group';
import CheckBox from '@react-native-community/checkbox';
import {SvgUri} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class OnboardingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: '',
      middle_name: '',
      last_name: '',
      mobile_number: '',
      dob: '',
      language_preference: 'Select Language',
      gender: '',
      nationality: {
        lookup_code: 'INDIAN',
        display_name: 'Indian',
      },
      address: '',
      accept_terms_and_conditions: false,
      radioButtons: [
        {
          id: '1',
          label: 'Male',
          value: 'MALE',
        },
        {
          id: '2',
          label: 'Female',
          value: 'FEMALE',
        },
        {
          id: '3',
          label: 'Other',
          value: 'OTHER',
        },
      ],
      selectedId: null,
      //   checkBox: false,
    };
  }

  setSelectedId = selectedId => {
    this.setState({selectedId});
  };

  handleSave = async () => {
    const {navigation} = this.props;
    // const token = AsyncStorage.getItem('token');
    const {token, id} = navigation.getParam('authData');
    // const {token, id} = this.props.route.params;
    const url = `http://4.186.25.108:4001/api/v1/onest/backend/auth/${id}/update`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          first_name: this.state.first_name,
          middle_name: this.state.middle_name,
          last_name: this.state.last_name,
          mobile_number: this.state.mobile_number,
          dob: this.state.dob,
          language_preference: this.state.language_preference,
          gender: this.state.radioButtons.find(
            radio => radio.id === this.state.selectedId,
          ).value,
          nationality: this.state.nationality,
          address: this.state.address,
          accept_terms_and_conditions: this.state.accept_terms_and_conditions,
        }),
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }
      console.log('Response from update profile: ', response);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.navigate('HomeScreen'); // Navigate to home screen after successful update
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  render() {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
        <ImageBackground
          source={require('../../assets/image/LogInBackGround.png')}
          style={{flex: 1}}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                margin: 15,
                backgroundColor: '#fff',
                borderRadius: 20,
                opacity: 0.7,
              }}>
              <View style={styles.WelcomVIew}>
                <Text
                  style={{color: '#003F91', fontSize: 24, fontWeight: '700'}}>
                  Welcome
                </Text>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate('HomeScreen')}>
                  <Text
                    style={{color: '#4338CA', fontSize: 14, paddingLeft: 10}}>
                    Skip
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{width: '80%', marginBottom: 20}}>
                <Text
                  style={{fontSize: 16, fontWeight: '500', color: '#4338CA'}}>
                  Here, you can personalize your application and.....
                </Text>
              </View>
              {/* First name */}
              <View style={{marginVertical: 10}}>
                <Text style={styles.name}>First Name </Text>
                <View style={styles.inputView}>
                  <TextInput
                    value={this.state.first_name}
                    onChangeText={text => this.setState({first_name: text})}
                  />
                </View>
              </View>

              {/* Last Name */}
              <View style={{marginVertical: 10}}>
                <Text style={styles.name}>Last Name </Text>
                <View style={styles.inputView}>
                  <TextInput
                    value={this.state.last_name}
                    onChangeText={text => this.setState({last_name: text})}
                  />
                </View>
              </View>
              {/* Phone Number */}
              <Text style={styles.name}>Phone Number </Text>
              <View style={{flexDirection: 'row', width: '100%'}}>
                <View style={styles.inputView1}>
                  <Text style={{fontSize: 16}}>+91</Text>
                </View>
                <View style={styles.inputView2}>
                  <TextInput
                    maxLength={10}
                    keyboardType="decimal-pad"
                    style={{fontSize: 16}}
                    value={this.state.mobile_number}
                    onChangeText={text => this.setState({mobile_number: text})}
                  />
                </View>
              </View>
              {/* Dob */}
              <View style={{marginVertical: 10}}>
                <Text style={styles.name}>DOB </Text>
                <View
                  style={[
                    styles.inputView,
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                    },
                  ]}>
                  <TextInput
                    placeholder="Select Date "
                    value={this.state.dob}
                    onChangeText={text => this.setState({dob: text})}
                  />
                  <Image
                    source={require('../../assets/image/calendar_month.png')}
                    style={{height: 20, width: 18}}
                  />
                </View>
              </View>
              {/* Language preference  */}
              <View style={{marginVertical: 10}}>
                <Text style={styles.name}>Language preference </Text>
                <View style={styles.inputView}>
                  <Picker
                    selectedValue={this.state.language_preference}
                    style={styles.picker}
                    onValueChange={itemValue =>
                      this.setState({language_preference: itemValue})
                    }>
                    <Picker.Item
                      label="Select Language "
                      style={{color: '#989898'}}
                    />
                    <Picker.Item label="English" value="English" />
                    <Picker.Item label="Hindi" value="Hindi" />
                    <Picker.Item label="Spanish" value="Spanish" />
                    <Picker.Item label="German" value="German" />
                  </Picker>
                </View>
              </View>

              {/* Email */}
              <View style={{marginVertical: 10}}>
                <Text style={styles.name}>Email </Text>
                <View style={styles.inputView}>
                  <TextInput
                    value={this.state.email}
                    onChangeText={text => this.setState({email: text})}
                  />
                </View>
              </View>
              <View style={{marginVertical: 10}}>
                <Text style={styles.name}>Gender </Text>
                <RadioGroup
                  radioButtons={this.state.radioButtons}
                  onPress={this.setSelectedId}
                  selectedId={this.state.selectedId}
                  layout="row"
                  containerStyle={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#000',
                  }}
                />
                {/* <Text style={styles.selectedText}>
                            Selected Value: {
                                this.state.radioButtons.find((radioButton) => radioButton.selected)
                                    .label
                            }
                        </Text> */}
              </View>
              {/* Email */}
              <View style={{marginVertical: 10}}>
                <Text style={styles.name}>Nationality </Text>
                <View style={styles.inputView}>
                  <TextInput
                    value={this.state.nationality.lookup_code}
                    onChangeText={text =>
                      this.setState({
                        nationality: {
                          ...this.state.nationality,
                          lookup_code: text,
                        },
                      })
                    }
                  />
                </View>
              </View>
              {/* Email */}
              <View style={{marginVertical: 10}}>
                <Text style={styles.name}>Address </Text>
                <View style={styles.inputView}>
                  <TextInput
                    value={this.state.address}
                    onChangeText={text => this.setState({address: text})}
                  />
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 30,
                  alignItems: 'center',
                }}>
                <CheckBox
                  value={this.state.accept_terms_and_conditions}
                  onValueChange={newValue =>
                    this.setState({accept_terms_and_conditions: newValue})
                  }
                />
                <TouchableOpacity>
                  <Text style={styles.TandC}>Accept terms and conditions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
        <View style={{position: 'absolute', right: 30, bottom: 30}}>
          <TouchableOpacity onPress={this.handleSave} style={styles.NextButton}>
            {/* <SvgUri width="30" height="30"
                            // source={require('../../assets/svg/arrow_left_alt.svg')}
                            Uri={require("../../assets/svg/arrow_left_alt.svg")}
                            /> */}
            <Image
              source={require('../../assets/image/arrow_left_alt.png')}
              style={{height: 28, width: 28}}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  name: {marginBottom: 3, color: '#374151', fontWeight: '500'},
  inputView: {
    height: 42,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
  },
  inputView1: {
    height: 42,
    width: '20%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  inputView2: {
    height: 42,
    width: '80%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  picker: {top: -5},
  NextButton: {
    height: 40,
    width: 40,
    borderRadius: 50,
    backgroundColor: '#1A40A2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  TandC: {fontSize: 18, fontWeight: '500', color: '#374151', marginLeft: 10},
  WelcomVIew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
});
