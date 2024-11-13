import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';

import Microphone from './components/Microphone';
import {MyButton1} from './components/Controls';
import {MyStatusBar} from './components/DarkTheme';
import {useFocusEffect} from '@react-navigation/native';

const LoginScreen = props => {
  const [email, setEmail] = useState('');
  const [suggestions] = useState([
    'Show me agriculture videos',
    'Learn java programming',
  ]);
  const [doNotNavigate, setDoNotNavigate] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, doNotNavigate set to true');
      setDoNotNavigate(true);

      return () => {
        console.log('Screen unfocused, doNotNavigate set to false');
        setDoNotNavigate(false);
      };
    }, []),
  );

  useEffect(() => {
    console.log('doNotNavigate state:', doNotNavigate);
  }, [doNotNavigate]);

  const handleEmailChange = text => {
    setEmail(text);
    console.log('Email Changed:', text);
  };

  const handleLogin = async () => {
    console.log(email);
    props.navigation.navigate('CourseHome', {
      searchText: email,
      tabName: 'Explore Courses',
    });
  };

  const handleSuggestionPress = async suggestion => {
    if (suggestion === 'Get scholarship for undergraduate') {
      props.navigation.navigate('FundingSupportHome', {
        searchText: 'scholarship for undergraduate',
        tabName: 'Explore Courses',
      });
    } else {
      props.navigation.navigate('CourseHome', {
        searchText: suggestion,
        tabName: 'Explore Courses',
      });
    }
  };

  const handleMicrophoneResult = result => {
    setEmail(result);
    console.log('Microphone Result:', result);
  };

  return (
    <SafeAreaView style={styles.container}>
      <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
      <ImageBackground
        source={require('./../assets/image/LoginTop.png')}
        style={styles.backgroundImage}
      />

      <View style={styles.logoContainer}>
        <Image
          source={require('./../assets/image/Logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>ONIX for Bharat</Text>
      </View>

      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="What you want to do today?"
            style={styles.input}
            value={email}
            onChangeText={handleEmailChange}
          />
        </View>
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <MyButton1 onPress={handleLogin}>Search</MyButton1>
      </View>

      <View style={styles.microphoneContainer}>
        <Microphone
          dontNavigate={doNotNavigate}
          onResultChange={handleMicrophoneResult}
          props={{...props}}
        />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    height: 209,
    width: '100%',
  },
  logoContainer: {
    height: 160,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logo: {
    height: 72,
    width: 72,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    padding: 10,
  },
  inputWrapper: {
    padding: 20,
    top: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 51,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#000',
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  suggestionText: {
    fontSize: 14,
    color: '#007BFF',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  microphoneContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
});

export default LoginScreen;
