/* eslint-disable prettier/prettier */
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
} from 'react-native';
import logo from '../../assets/image/Logo.png';
const PaymentPopup = ({isPopupVisible, togglePopup, state_data}) => {
  const navigate = useNavigation();

  const Paynow = () => {
    console.log('state_data = > ', state_data);
    navigate.replace('ThankYou');
  };
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isPopupVisible}
      onRequestClose={togglePopup}>
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={{fontSize: 25, fontWeight: 'bold'}}>
            PAYMENT GATEWAY
          </Text>
          <View style={styles.contentContainer}>
            <Image source={logo} style={styles.image} />
          </View>
          <View style={{width: 200}}>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{state_data?.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payable Amount:</Text>
              <Text style={styles.value}>₹{state_data?.paymentAmount}</Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancel_button}
              onPress={togglePopup}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={Paynow}>
              <Text style={styles.buttonText}>Pay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    width: 350,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  text: {
    flex: 1,
    fontSize: 16,
  },
  image: {
    width: 60,
    height: 60,
    marginLeft: 10,
    marginTop: '3%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  value: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: '15%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  cancel_button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default PaymentPopup;
