import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {Component, createRef} from 'react';

import Clock from '../../assets/svg/Clock.svg';
import Completion from '../../assets/svg/Completion.svg';
import Drawer from '../components/Drawer';
import {HeaderNew} from '../components/Header';
import Intermediate from '../../assets/svg/Intermediate.svg';
import {MyButton2} from '../components/Controls';
import {MyStatusBar} from '../components/DarkTheme';
import {SearchNew} from '../components/Search';
import {payment} from '../../Utils/APIs/Courses/paymentDetails';

export default class PaymentDetails extends Component {
  constructor(props) {
    super(props);
    this.drawerRef = createRef();
    this.state = {
      name: '',
      email: '',
      phone: '',
      address: '',
      courseId: '',
      paymentAmount: '',
      courseDetails: null,
    };
  }

  componentDidMount() {
    console.log('params: ', this.props.route.params);
    const {courseId, paymentAmount, courseDetails} = this.props.route.params;
    this.setState({
      paymentAmount,
      courseId,
      courseDetails,
    });
  }

  openDrawer = () => {
    this.drawerRef.current.openDrawer();
  };

  handlePay = async () => {
    const {name, email, phone, address, courseId, paymentAmount} = this.state;

    const body = {
      course_id: courseId,
      payment_amount: paymentAmount,
      billing_address: {
        name,
        email,
        phone,
        address,
      },
    };

    try {
      // data = await payment(body);
      this.props.navigation.navigate('ThankYou');
    } catch (error) {
      console.error('Error making payment:', error.message);
      Alert.alert(
        'Payment Error',
        'Failed to complete payment. Please try again later.',
      );
    }
  };

  render() {
    const {navigation} = this.props;
    const {name, email, phone, address, paymentAmount, courseDetails} =
      this.state;

    if (!courseDetails) {
      return (
        <SafeAreaView style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </SafeAreaView>
      );
    }

    return (
      <Drawer ref={this.drawerRef} navigation={navigation}>
        <SafeAreaView style={styles.container}>
          <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
          <HeaderNew {...this.props} openDrawer={this.openDrawer} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <SearchNew {...this.props} />

            <View style={styles.contentContainer}>
              <View style={styles.headerContainer}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}
                  style={styles.backButton}>
                  <Image
                    source={require('../../assets/image/BackBlue.png')}
                    style={styles.backIcon}
                  />
                </TouchableOpacity>
                <Text style={styles.headerText}>
                  Complete your Purchase as Guest
                </Text>
              </View>
              <View style={styles.courseInfoContainer}>
                <View style={styles.courseInfoRow}>
                  <View style={styles.courseImageContainer}>
                    <Image
                      source={{
                        uri: courseDetails.course_descriptor.images[0].url,
                      }}
                      style={styles.courseImage}
                    />
                  </View>
                  <View style={styles.courseDetailsContainer}>
                    <Text style={styles.courseName}>
                      {courseDetails.course_descriptor.name}
                    </Text>
                    <Text style={styles.coursePrice}>
                      {courseDetails.total_price}
                    </Text>
                    <View style={styles.priceInfoContainer}>
                      <Image
                        source={require('../../assets/image/finance_chip.png')}
                        style={styles.financeChipIcon}
                      />
                      <Text style={styles.priceInfoText}>
                        Price: Free for Members
                      </Text>
                    </View>
                    <View style={styles.courseTypeContainer}>
                      <Clock height={20} width={20} />
                      <Text style={styles.courseTypeText}>
                        Self-Paced Online Course with No Deadlines
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.courseFeaturesContainer}>
                  <Intermediate height={36} width={36} />
                  <Text style={styles.courseFeatureText}>
                    {courseDetails.content_metadata.learner_level.value}
                  </Text>
                  <Completion height={36} width={36} />
                  <Text style={styles.courseFeatureText}>
                    Completion Certificate
                  </Text>
                </View>
              </View>
              <View style={styles.billingContainer}>
                <Text style={styles.billingTitle}>Billing Address</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.formInput}
                      value={name}
                      onChangeText={text => this.setState({name: text})}
                    />
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={styles.phoneInputContainer}>
                    <View style={styles.phoneCountryCode}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <View style={styles.phoneNumberInput}>
                      <TextInput
                        maxLength={10}
                        keyboardType="decimal-pad"
                        style={styles.formInput}
                        value={phone}
                        onChangeText={text => this.setState({phone: text})}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email ID</Text>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.formInput}
                      value={email}
                      onChangeText={text => this.setState({email: text})}
                    />
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <View style={[styles.inputView, styles.addressInput]}>
                    <TextInput
                      multiline={true}
                      style={styles.formInput}
                      value={address}
                      onChangeText={text => this.setState({address: text})}
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={styles.payButtonContainer}>
            <MyButton2 onPress={this.handlePay}>Pay ₹{paymentAmount}</MyButton2>
          </View>
        </SafeAreaView>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    marginHorizontal: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    height: 24,
    width: 24,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },
  courseInfoContainer: {
    height: 189,
    width: '100%',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
  },
  courseInfoRow: {
    flexDirection: 'row',
  },
  courseImageContainer: {
    width: '35%',
  },
  courseImage: {
    height: 87,
    width: '90%',
    margin: 10,
    borderRadius: 8,
  },
  courseDetailsContainer: {
    width: '55%',
    marginLeft: 10,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  coursePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  priceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financeChipIcon: {
    height: 10,
    width: 15,
  },
  priceInfoText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#000',
    marginLeft: 10,
  },
  courseTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseTypeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#000',
    marginLeft: 7,
  },
  courseFeaturesContainer: {
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 20,
  },
  courseFeatureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#013499',
  },
  billingContainer: {
    marginVertical: 15,
  },
  billingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  inputContainer: {
    margin: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 5,
  },
  inputView: {
    height: 42,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  formInput: {
    width: '100%',
    fontSize: 16,
    color: '#D1D5DB',
    backgroundColor: '#FFFFFF'
  },
  phoneInputContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  phoneCountryCode: {
    height: 42,
    width: '20%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',    
  },
  countryCodeText: {
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F5F5F5',
  },
  phoneNumberInput: {
    height: 42,
    width: '80%',
    borderWidth: 1,
    color: '#000000',
    backgroundColor: '#F5F5F5',
    borderColor: '#D1D5DB',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  addressInput: {
    height: 100,
    color: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  payButtonContainer: {
    marginBottom: 5,
  },
});
