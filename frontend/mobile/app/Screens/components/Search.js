import {
  Image,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export const SearchNew = forwardRef((props, ref) => {
  const {
    handleSearchNavigate,
    navigation,
    searchText: propsSearchText,
    microphoneActive,
    onMicrophoneToggle,
  } = props;

  const [searchText, setSearchText] = useState(propsSearchText ?? '');
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    setNativeProps: nativeProps =>
      inputRef.current?.setNativeProps(nativeProps),
  }));

  useEffect(() => {
    if (propsSearchText !== undefined && propsSearchText !== searchText) {
      setSearchText(propsSearchText);
    }
  }, [propsSearchText]);

  useEffect(() => {
    if (microphoneActive) {
      inputRef.current?.blur();
    }
  }, [microphoneActive]);

  const handleSearch = () => {
    if (searchText.trim()) {
      handleSearchNavigate(searchText);
    }
  };

  const handleChangeText = text => {
    setSearchText(text);
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Search"
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSearch}
        editable={!microphoneActive}
      />
      <TouchableOpacity style={styles.iconButton} onPress={handleSearch}>
        <Image
          source={require('../../assets/image/Ellipse3.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: '95%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 25,
    borderColor: '#E1E8FF',
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 12,
    color: '#000',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  iconButton: {
    padding: 10,
    marginRight: 5,
  },
  icon: {
    height: 24,
    width: 24,
  },
  micButton: {
    padding: 10,
    marginRight: 5,
  },
  micIcon: {
    height: 24,
    width: 24,
  },
  micIconActive: {
    tintColor: 'red',
  },
});
