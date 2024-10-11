import React from 'react';
import {ImageBackground} from 'react-native';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  FlatList,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MyStatusBar} from './components/DarkTheme';

const domains = [
  {image: require('../assets/image/topfood.png')},
  {image: require('../assets/image/groceries.png')},
  {image: require('../assets/image/topfashion.png')},
  {image: require('../assets/image/electronics.png')},
  {image: require('../assets/image/healthwitness.png')},
  {image: require('../assets/image/homedecor.png')},
  {image: require('../assets/image/personalcare.png')},
];

const RetailDomain = () => {
  <View
    style={{
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      marginVertical: 20,
    }}>
    <Text
      style={{
        fontSize: 30,
        color: '#013499',
        fontWeight: '600',
        lineHeight: 36,
      }}>
      “Agriculture”
    </Text>
    <Image
      source={require('../assets/image/LockBottomBlue.png')}
      style={{height: 10, width: 90, alignSelf: 'flex-end', right: 100}}
    />
  </View>;
  const renderItem = ({item}) => (
    <ScrollView horizontal={true}>
      <View>
        <Image
          source={item.image}
          style={{
            width: 150,
            height: 160,
            borderRadius: 7,
            marginLeft: 24,
            marginRight: 24,
            marginBottom: 20,
          }}>
          {/* <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text> */}
        </Image>
      </View>
    </ScrollView>
  );

  return (
    <>
      <SafeAreaView>
        <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
        <View
          style={{
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            marginVertical: 20,
          }}>
          <Text
            style={{
              fontSize: 30,
              color: '#013499',
              fontWeight: '600',
              lineHeight: 36,
            }}>
            “Retail Domains”
          </Text>
          <Image
            source={require('../assets/image/LockBottomBlue.png')}
            style={{height: 10, width: 90, alignSelf: 'flex-end', right: 150}}
          />
        </View>

        <FlatList
          data={domains}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.container}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  card: {
    width: '100%',
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    alignItems: 'center',
    padding: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 100,
    // resizeMode: 'cover',
    borderRadius: 7,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  linearGradientV: {
    height: 'auto',
    width: 'auto',
  },
});

export default RetailDomain;
