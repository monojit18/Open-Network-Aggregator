// LoadingScreen.js

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const LoadingScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centers vertically
    alignItems: 'center', // Centers horizontally
    backgroundColor: '#ffffff', // Background color of the loading screen
  },
  loaderContainer: {
    justifyContent: 'center', // Ensures children are centered vertically within this view
    alignItems: 'center', // Ensures children are centered horizontally within this view
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#6200EE', // Text color
    fontWeight: 'bold',
  },
});

export default LoadingScreen;
