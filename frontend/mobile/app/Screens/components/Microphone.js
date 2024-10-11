import {
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import Voice from '@react-native-voice/voice';

const Microphone = ({
  props,
  handleEmailChange = () => {},
  dontNavigate,
  onResultChange,
}) => {
  const [result, setResult] = useState('');
  const [partialResults, setPartialResults] = useState([]);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const timeoutRef = useRef(null);

  const logEvent = (eventName, data) => {
    console.log(`[Microphone] ${eventName}:`, data);
  };

  useEffect(() => {
    console.log('Microphone dontNavigate prop changed:', dontNavigate);
  }, [dontNavigate]);

  useEffect(() => {
    const voiceSetup = async () => {
      try {
        const isAvailable = await Voice.isAvailable();
        logEvent('Voice.isAvailable', isAvailable);
        if (!isAvailable) {
          throw new Error('Voice recognition not available');
        }

        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechPartialResults = onSpeechPartialResults;
        Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;
        logEvent('Voice listeners set up', true);
      } catch (e) {
        console.error('Voice recognition setup error:', e);
        setError('Voice recognition not available on this device: ');
      }
    };

    voiceSetup();

    return () => {
      Voice.destroy().then(() => {
        Voice.removeAllListeners();
        logEvent('Voice destroyed and listeners removed', true);
      });
    };
  }, [dontNavigate]);

  const onSpeechStart = useCallback(() => {
    logEvent('onSpeechStart', true);
    setIsRecording(true);
    setError('');
    timeoutRef.current = setTimeout(() => {
      if (isRecording) {
        stopRecording();
        setError('No speech detected. Please try again.');
      }
    }, 10000);
  }, [isRecording]);

  const onSpeechEnd = useCallback(() => {
    logEvent('onSpeechEnd', true);
    setIsRecording(false);
    clearTimeout(timeoutRef.current);
  }, []);

  const onSpeechError = useCallback(error => {
    logEvent('onSpeechError', error);
    setIsRecording(false);
    clearTimeout(timeoutRef.current);
    if (error.error?.code === '7' && error.error?.message === '7/No match') {
      setError('No speech recognized. Please try speaking more clearly.');
    } else {
      setError('Speech recognition error');
    }
  }, []);

  const onSpeechResults = useCallback(
    event => {
      logEvent('onSpeechResults', event);
      setIsRecording(false);
      clearTimeout(timeoutRef.current);

      if (event.value && event.value.length > 0) {
        const res = event.value[0];
        setResult(res);
        handleEmailChange(res);
        console.log('dontNavigate value:', dontNavigate);
        if (!dontNavigate) {
          setTimeout(() => {
            props.navigation.navigate('CourseHome', {searchText: res});
          }, 2000);
        } else {
          onResultChange(res);
        }
      } else {
        setError('No speech detected. Please try again.');
      }
    },
    [handleEmailChange, props.navigation, dontNavigate, onResultChange],
  );

  const onSpeechPartialResults = useCallback(
    event => {
      logEvent('onSpeechPartialResults', event);
      if (event.value && event.value.length > 0) {
        const res = event.value[0];
        handleEmailChange(res);
        setPartialResults(event.value);
      }
    },
    [handleEmailChange],
  );

  const onSpeechVolumeChanged = useCallback(event => {
    logEvent('onSpeechVolumeChanged', event);
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      const hasPermission = await requestMicrophonePermission();
      if (hasPermission) {
        setIsRecording(true);
        setPartialResults([]);
        setResult('');
        logEvent('Starting Voice.start', true);
        await Voice.start('en_US', {
          RECOGNIZER_ENGINE: 'GOOGLE',
          EXTRA_PARTIAL_RESULTS: true,
        });
        logEvent('Voice.start completed', true);
      } else {
        setError('Microphone permission denied');
      }
    } catch (err) {
      logEvent('startRecording error', err);
      setError('Failed to start recording: ');
    }
  };

  const stopRecording = async () => {
    try {
      logEvent('Stopping Voice.stop', true);
      await Voice.stop();
      logEvent('Voice.stop completed', true);
      setIsRecording(false);
      clearTimeout(timeoutRef.current);
    } catch (err) {
      logEvent('stopRecording error', err);
      setError('Failed to stop recording: ');
    }
  };

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message:
              'This app needs access to your microphone to record your voice.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        logEvent('Microphone permission result', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        logEvent('Failed to request microphone permission', err);
        return false;
      }
    }
    return true; // iOS automatically requests permission
  };

  return (
    <View
      style={{
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        left: 10,
      }}>
      <TouchableOpacity
        onPressIn={startRecording}
        onPressOut={stopRecording}
        style={[styles.button, isRecording && styles.buttonRecording]}>
        <Image
          source={require('../../assets/image/microphone.png')}
          style={{
            height: 30,
            width: 30,
            tintColor: '#FFFFFF', // White icon for contrast
          }}
        />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    left: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonRecording: {
    backgroundColor: '#FF4136',
  },
  icon: {
    height: 45,
    width: 45,
    tintColor: '#FFFFFF',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
    maxWidth: 200,
  },
  recordingText: {
    color: '#4CAF50',
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default Microphone;
