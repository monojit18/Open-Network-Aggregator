import {
  HemePopularCourse,
  HomeCourses,
  HomeScholarship,
} from '../components/HomeComponent';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {Component, createRef} from 'react';
import {getCourses, homePageList} from '../../Utils/APIs';

import {Button} from 'react-native-elements';
import Drawer from '../components/Drawer';
import {HeaderNew} from '../components/Header';
import LinearGradient from 'react-native-linear-gradient';
import Microphone from '../components/Microphone';
import {MyStatusBar} from '../components/DarkTheme';
import {getScholarships} from '../../Utils/APIs/Scholarships/getScholarships';
import {handleDetailsButtonClick} from '../components/HomeComponent';
import {performScrollAction} from '../../Utils/APIs/UIAction';

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.drawerRef = createRef();
    this.scrollViewRef = createRef();
    this.state = {
      courses: {}, // Initialize state for courses
      scholarships: [],
      inputText: '',
      showInput: false,
      microphoneResult: '',
    };
  }
  openDrawer = () => {
    this.drawerRef.current.openDrawer();
  };

  handleScrollAction = direction => {
    console.log('scroll');
    performScrollAction(this.scrollViewRef, direction);
  };

  handleResultChange = result => {
    this.setState({inputText: result});
  };

  componentDidMount() {
    // this.fetchCourses();
    // this.fetchScholarships();
  }
  componentDidUpdate() {
    // Optional: Log contentOffset for debugging
    if (this.scrollViewRef.current) {
      const {contentOffset} = this.scrollViewRef.current;
      console.log('ScrollView contentOffset:', contentOffset);
    }
  }

  // fetchCourses = async () => {
  //   try {
  //     const data = await getCourses(); // Call API function to fetch courses
  //     // console.log('all courses data for homescreen: ', data);
  //     this.setState({courses: data}); // Assuming your API response has a 'courses' array
  //   } catch (error) {
  //     console.error('Error fetching courses in Homepage:', error);
  //     // Handle error state or show error message
  //   }
  // };
  // fetchScholarships = async () => {
  //   try {
  //     const data = await getScholarships(); // Call API function to fetch courses
  //     // console.log('all scholarships data for homescreen: ', data);
  //     this.setState({scholarships: data}); // Assuming your API response has a 'courses' array
  //   } catch (error) {
  //     console.error('Error fetching courses in Homepage:', error);
  //     // Handle error state or show error message
  //   }
  // };
  handleOkPress = async () => {
    const {inputText} = this.state;
    try {
      // var response = await performTextAction(inputText);
      // console.log(response);

      response = {
        domains: [{name: 'UI', action: 'scroll', direction: inputText}],
      };
      response = {
        domains: [{name: 'UI', action: 'select', indexes: [inputText]}],
      };
      console.log(response['domains'][0]['action']);

      if (response['domains'][0]['name'] == 'UI') {
        if (response['domains'][0]['action'] == 'scroll') {
          var direction = response['domains'][0]['direction'];
          console.log(inputText);
          if (direction.includes('up') || direction.includes('above'))
            this.handleScrollAction('up');
          if (direction.includes('down') || direction.includes('below'))
            this.handleScrollAction('down');
        }
        if (response['domains'][0]['action'] == 'select') {
          var index = +response['domains'][0]['indexes'][0];
          console.log(index);
          handleDetailsButtonClick(index);
        }
      }
      // Alert.alert('Success', 'API call successful!');
      this.setState({showInput: false});
      this.setState({inputText: ''});
    } catch (error) {
      console.error('Error calling API:', error);
      Alert.alert('Error', 'Failed to call API');
    }
  };

  toggleInput = () => {
    const {showInput} = this.state;
    this.setState({showInput: !showInput}); // Toggle input visibility
  };

  render() {
    const {navigation} = this.props;
    const {courses} = this.state;
    const {scholarships} = this.state;
    const {inputText} = this.state;
    const {showInput} = this.state;
    const {microphoneResult} = this.state;
    return (
      <Drawer ref={this.drawerRef} navigation={navigation}>
        <SafeAreaView style={{flex: 1}}>
          <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
          <HeaderNew {...this.props} openDrawer={this.openDrawer} />
          <ScrollView
            ref={this.scrollViewRef}
            showsVerticalScrollIndicator={false}>
            {/* <LinearGradient
                            start={{ x: 0, y: 0.75 }} end={{ x: 1, y: 0.25 }}
                            colors={['#1A40A2', '#0A183C']}
                            style={styles.linearGradient}>

                            <View>
                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500', paddingLeft: 15 }}>Complete Your profile for better experience </Text>
                            </View>
                        </LinearGradient> */}

            <LinearGradient
              colors={['#FFFFFF', '#E1E8FF']}
              style={styles.linearGradientView}>
              <View
                style={{
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginVertical: 20,
                }}>
                <Text
                  style={{
                    fontSize: 30,
                    color: '#013499',
                    fontWeight: '600',
                    lineHeight: 36,
                  }}>
                  “Unlock Your Future”
                </Text>
                <Image
                  source={require('../../assets/image/LockBottomBlue.png')}
                  style={{
                    height: 10,
                    width: 90,
                    alignSelf: 'flex-end',
                    right: 65,
                  }}
                />
              </View>

              <View>
                <View>
                  <View style={styles.Top_Margin}>
                    <View style={styles.scholerShipView}>
                      <View style={{width: '60%'}}>
                        <Text
                          style={styles.Text_14}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          About Course{' '}
                        </Text>
                        <Text
                          style={styles.Onest_View}
                          numberOfLines={3}
                          ellipsizeMode="tail">
                          {' '}
                          ONEST aims to make education and skilling more
                          accessible by being an open and decentralized
                          network..
                        </Text>
                        <Text
                          style={styles.Text_14}
                          numberOfLines={2}
                          ellipsizeMode="tail">
                          View course Page{' '}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.scholerShip, styles.boxWithShadow]}>
                      <Image
                        source={require('../../assets/image/images1.jpeg')}
                        style={{height: 74, width: 74, borderRadius: 74}}
                      />
                    </View>
                    <View style={{position: 'absolute', right: 35, bottom: 20}}>
                      <TouchableOpacity
                        onPress={() =>
                          this.props.navigation.navigate('CourseHome', {
                            searchText: 'show me all courses',
                            tabName: 'Explore Courses',
                          })
                        }
                        style={styles.NextButton}>
                        <Image
                          source={require('../../assets/image/arrow_left_alt.png')}
                          style={{height: 28, width: 28}}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={styles.Top_Margin}>
                  <View style={styles.scholerShipView}>
                    <View style={{width: '60%'}}>
                      <Text
                        style={styles.Text_14}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        About Scholarship{' '}
                      </Text>
                      <Text
                        style={styles.Onest_View}
                        numberOfLines={3}
                        ellipsizeMode="tail">
                        {' '}
                        ONEST aims to make education and skilling more
                        accessible by being an open and decentralized network..
                      </Text>
                      <Text
                        style={styles.Text_14}
                        numberOfLines={2}
                        ellipsizeMode="tail">
                        View Scholarship Page{' '}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.scholerShip, styles.boxWithShadow]}>
                    <Image
                      source={require('../../assets/image/images1.jpeg')}
                      style={{height: 74, width: 74, borderRadius: 74}}
                    />
                  </View>
                  <View style={{position: 'absolute', right: 35, bottom: 20}}>
                    <TouchableOpacity
                      style={styles.NextButton}
                      onPress={() =>
                        this.props.navigation.navigate('FundingSupportHome', {
                          searchText: 'scholarship for undergraduate',
                        })
                      }>
                      <Image
                        source={require('../../assets/image/arrow_left_alt.png')}
                        style={{height: 28, width: 28}}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View>
                <View style={styles.Top_Margin}>
                  <View style={styles.scholerShipView}>
                    <View style={{width: '60%'}}>
                      <Text
                        style={styles.Text_14}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        About Job Provider{' '}
                      </Text>
                      <Text
                        style={styles.Onest_View}
                        numberOfLines={3}
                        ellipsizeMode="tail">
                        {' '}
                        ONEST aims to make education and skilling more
                        accessible by being an open and decentralized network..
                      </Text>
                      <Text
                        style={styles.Text_14}
                        numberOfLines={2}
                        ellipsizeMode="tail">
                        View Job Provider{' '}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.scholerShip, styles.boxWithShadow]}>
                    <Image
                      source={require('../../assets/image/images1.jpeg')}
                      style={{height: 74, width: 74, borderRadius: 74}}
                    />
                  </View>
                  <View style={{position: 'absolute', right: 35, bottom: 20}}>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('JobOpportunitiesHome', {
                          searchText: 'engineering jobs',
                          tabName: 'Explore Courses',
                        })
                      }
                      style={styles.NextButton}>
                      <Image
                        source={require('../../assets/image/arrow_left_alt.png')}
                        style={{height: 28, width: 28}}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>

            <View>
              <HomeCourses {...this.props} courses={courses.allCourse} />
            </View>

            <View>
              <HemePopularCourse
                {...this.props}
                courses={courses.popularCourse}
              />
            </View>

            <View>
              <HomeScholarship {...this.props} scholarships={scholarships} />
            </View>
            <View style={{backgroundColor: '#000', height: 210, padding: 20}}>
              <Text style={styles.CustomerText}>Customer service </Text>

              <TouchableOpacity style={styles.TermView}>
                <View style={styles.Dot} />
                <Text style={styles.TermText}>Term of Use</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.TermView}>
                <View style={styles.Dot} />
                <Text style={styles.TermText}>Search Terms</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.TermView}>
                <View style={styles.Dot} />
                <Text style={styles.TermText}>FAQ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.TermView}>
                <View style={styles.Dot} />
                <Text style={styles.TermText}>Help Center</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.TermView}>
                <View style={styles.Dot} />
                <Text style={styles.TermText}>About Us</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <View>
            <Microphone
              dontNavigate={false}
              style={{marginLeft: 10}}
              onPress={this.toggleInput}
              onResultChange={this.handleResultChange}
              props={{...this.props}}
            />
            <Text style={{backgroundColor: 'white', fontSize: 20, padding: 5}}>
              {inputText ? inputText : ''}
            </Text>
            {inputText ? (
              <Button
                title="OK"
                color="#1A40A2"
                style={{width: 100}}
                onPress={() => this.handleOkPress()}
              />
            ) : null}
          </View>
        </SafeAreaView>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  linearGradient: {
    height: 38,
    width: '100%',
    justifyContent: 'center',
    marginTop: 3,
  },
  linearGradientView: {
    height: 610,
    width: '100%',
  },
  boxWithShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 5,
  },
  Top_Margin: {width: '80%', alignSelf: 'center', marginVertical: 20},
  Text_14: {fontSize: 14, fontWeight: '700', color: '#000000'},
  Onest_View: {
    fontSize: 9,
    fontWeight: '400',
    color: '#3F3F3F',
    paddingVertical: 5,
  },
  scholerShipView: {
    height: 121,
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignSelf: 'center',
    margin: 5,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scholerShip: {
    position: 'absolute',
    left: -10,
    top: -20,
    height: 77,
    width: 77,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#c0c0c0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  NextButton: {
    height: 40,
    width: 40,
    borderRadius: 50,
    backgroundColor: '#1A40A2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Course View
  CourseTopView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  CourseView: {
    width: 316,
    height: 500,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 15,
    alignSelf: 'center',
    margin: 10,
  },
  Font_16: {fontSize: 16, fontWeight: '600', color: '#000', marginVertical: 10},
  Font_California: {
    fontSize: 10,
    fontWeight: '500',
    color: '#000',
    paddingLeft: 10,
  },
  Bestsaller: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  BestsallerView: {
    height: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  BsFont: {color: '#000000', fontSize: 13, fontWeight: '500'},
  Rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 10,
  },
  Bg_Font: {fontSize: 12, fontWeight: '500', color: '#A6A5A5', padding: 5},
  Font_18: {fontSize: 18, fontWeight: '500', color: '#000'},
  ViewAll: {fontSize: 14, fontWeight: '500', color: '#2563EB'},

  PCourseView: {
    width: 238,
    height: 310,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 15,
    alignSelf: 'center',
    margin: 10,
  },
  Rating1: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2015FF',
    paddingHorizontal: 10,
  },
  Bestsaller1: {height: 60, justifyContent: 'center', width: 89},

  ACourseView: {
    width: 238,
    height: 260,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 15,
    alignSelf: 'center',
    marginHorizontal: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  TermView: {
    height: 30,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 10,
  },
  Dot: {
    height: 4,
    width: 4,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  TermText: {fontSize: 12, fontWeight: '400', color: '#fff'},
  CustomerText: {color: '#fff', fontSize: 16, fontWeight: '600'},
});
