import {
  ButtonTab,
  ExploreCourses,
  Fundamentals,
  MyCertification,
  PaymentView,
} from '../components/Controls';
import {CourseLesson, HomeCourses} from '../components/HomeComponent';
import {
  FlatList,
  Image,
  ImageBackground,
  ProgressBarAndroid,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {Component, createRef} from 'react';

import ArrowLeft from '../../assets/svg/arrow_left.svg';
import Certificate from '../../assets/svg/Certificate.svg';
import Clock from '../../assets/svg/Clock.svg';
import Drawer from '../components/Drawer';
import {HeaderNew} from '../components/Header';
import LinearGradient from 'react-native-linear-gradient';
import {MyStatusBar} from '../components/DarkTheme';
import Repear from '../../assets/svg/repear.svg';
import {SearchNew} from '../components/Search';
import Tower from '../../assets/svg/tower.svg';
import getCourseDetails from '../../Utils/APIs/Courses/getCourseDetails';

export default class CourseDetail extends Component {
  constructor(props) {
    super(props);
    this.drawerRef = createRef();
    this.state = {
      data: [
        {
          id: 1,
          name: 'Home',
        },
        {
          id: 2,
          name: 'Explore Courses',
        },
        {
          id: 3,
          name: 'My Certifications',
        },
        {
          id: 4,
          name: 'My Courses',
        },
      ],
      courseDetails: null,
    };
  }
  openDrawer = () => {
    this.drawerRef.current.openDrawer();
  };

  componentDidMount() {
    const courseId = this.props.route.params.courseId;
    // console.log('params: ', this.props.route.params);
    this.fetchCourseDetails(courseId);
  }

  fetchCourseDetails = async courseId => {
    // console.log(courseId);
    try {
      const data = await getCourseDetails(courseId);
      // console.log('courseDetails: ', data);
      this.setState({courseDetails: data});
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };
  render() {
    onPress = props => {
      console.log('*******', props);
      this.setState({CourseName: props});
    };
    const {navigation} = this.props;
    const {courseDetails} = this.state;
    if (!courseDetails) {
      return (
        <SafeAreaView
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Loading...</Text>
        </SafeAreaView>
      );
    }

    return (
      <Drawer ref={this.drawerRef} navigation={navigation}>
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
          <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
          <HeaderNew {...this.props} openDrawer={this.openDrawer} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{marginVertical: 10}}>
              <ButtonTab
                {...this.props}
                data={this.state.data}
                onSubmit={onPress}
              />
            </View>

            <View style={{margin: 15}}>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: '700',
                  color: '#000',
                  width: '90%',
                }}>
                {courseDetails.course_descriptor.name}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 10,
                }}>
                <Image
                  source={require('../../assets/image/Star12.png')}
                  style={{height: 27, width: 27, margin: 5}}
                />
                <Image
                  source={require('../../assets/image/Star12.png')}
                  style={{height: 27, width: 27, margin: 5}}
                />
                <Image
                  source={require('../../assets/image/Star12.png')}
                  style={{height: 27, width: 27, margin: 5}}
                />
                <Image
                  source={require('../../assets/image/Star12.png')}
                  style={{height: 27, width: 27, margin: 5}}
                />
                <Image
                  source={require('../../assets/image/Star12.png')}
                  style={{height: 27, width: 27, margin: 5}}
                />
                <Text style={{fontSize: 14, fontWeight: '600', color: '#000'}}>
                  4.5
                </Text>
              </View>
              <View
                style={{
                  width: '70%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: '50%',
                    height: 21,
                    borderRadius: 21,
                    backgroundColor: '#D9D9D9',
                  }}>
                  <View
                    style={{
                      height: 21,
                      borderRadius: 21,
                      backgroundColor: '#2563EB',
                      width: '30%',
                    }}
                  />
                </View>
                <Text style={{fontSize: 15, fontWeight: '600', color: '#000'}}>
                  {courseDetails.content_metadata.learner_level.value}{' '}
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#000',
                    marginVertical: 10,
                  }}>
                  {courseDetails.course_descriptor.long_description}
                </Text>
              </View>
              <View style={{marginVertical: 10}}>
                <ImageBackground
                  source={{
                    uri: courseDetails.course_descriptor.images[0].url,
                  }}
                  style={{
                    height: 188,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity>
                    <Image
                      source={require('../../assets/image/PlayButton.png')}
                      style={{height: 32, width: 32}}
                    />
                  </TouchableOpacity>
                </ImageBackground>
                <View style={{position: 'absolute', right: 0, top: 10}}>
                  <ImageBackground
                    source={require('../../assets/image/VideoTag.png')}
                    style={{
                      height: 45,
                      width: 160,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{fontSize: 8, fontWeight: '700', color: '#000'}}>
                      Save with a Personalized{'\n'}Discount!{' '}
                      <Text style={{color: '#2015FF'}}>Claim Now</Text>{' '}
                    </Text>
                  </ImageBackground>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginVertical: 10,
                }}>
                <View
                  style={{
                    height: 30,
                    width: '45%',
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                  }}>
                  <Text
                    style={{fontSize: 12, fontWeight: '500', color: '#374151'}}>
                    Download Course{' '}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('PaymentDetails', {
                      courseId: courseDetails.course_id,
                      courseDetails: courseDetails,
                      paymentAmount: courseDetails.total_price,
                    })
                  }
                  style={{
                    height: 30,
                    width: '45%',
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#013499',
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{fontSize: 12, fontWeight: '500', color: '#fff'}}>
                    Enroll Now{' '}
                  </Text>
                  <ArrowLeft height={24} width={24} />
                </TouchableOpacity>
              </View>

              <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>
                <View style={styles.InterButton}>
                  <Tower height={24} width={24} />
                  <Text style={styles.InterFont}>
                    {courseDetails.content_metadata.learner_level.value}
                  </Text>
                </View>
                <View style={styles.InterButton}>
                  <Certificate height={24} width={24} />
                  <Text style={styles.InterFont}>
                    {courseDetails.content_metadata.prerequisite.value}
                  </Text>
                </View>
                <View style={styles.InterButton}>
                  <Repear height={24} width={24} />
                  <Text style={styles.InterFont}>
                    {courseDetails.content_metadata.course_duration.value}
                  </Text>
                </View>
                <View style={styles.InterButton}>
                  <Clock height={24} width={24} />
                  <Text style={styles.InterFont}>
                    {courseDetails.content_metadata.learning_objective.value}
                  </Text>
                </View>
                <View style={styles.InterButton}>
                  {/* <Tower height={24} width={24} /> */}
                  <Text style={styles.InterFont}>
                    Last Updated May 11, 2024
                  </Text>
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
                        {courseDetails.provider_descriptor.name}
                      </Text>
                      <Text
                        style={styles.Onest_View}
                        numberOfLines={3}
                        ellipsizeMode="tail">
                        {' '}
                        {courseDetails.provider_descriptor.short_description}
                      </Text>
                      <Text
                        style={styles.Text_14}
                        numberOfLines={2}
                        ellipsizeMode="tail">
                        View all Courses of{' '}
                        {courseDetails.provider_descriptor.name}{' '}
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
                        this.props.navigation.navigate('CourseHome')
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

              <View>
                <Text style={{fontSize: 18, fontWeight: '600', color: '#000'}}>
                  Practical Info
                </Text>
                <View style={{marginVertical: 15}}>
                  <View style={styles.PriceView}>
                    <Image
                      source={require('../../assets/image/finance_chip.png')}
                      style={{height: 14, width: 22}}
                    />
                    <Text style={styles.memberView}>
                      Price: Free for Members
                    </Text>
                  </View>
                  <View style={styles.PriceView}>
                    <View style={styles.Dot} />
                    <Text style={styles.FlatFee}>
                      Take as many courses as you want for a flat fee.
                    </Text>
                  </View>
                </View>

                <View style={{marginVertical: 15}}>
                  <View style={styles.PriceView}>
                    <Image
                      source={require('../../assets/image/schedule.png')}
                      style={{height: 16, width: 16}}
                    />
                    <Text style={styles.memberView}>
                      Self-Paced Online Course with No Deadlines
                    </Text>
                  </View>
                  <View style={styles.PriceView}>
                    <View style={styles.Dot} />
                    <Text style={styles.FlatFee}>
                      Never miss a class or a deadline.
                    </Text>
                  </View>
                </View>

                <View style={{marginVertical: 15}}>
                  <View style={styles.PriceView}>
                    <Image
                      source={require('../../assets/image/check.png')}
                      style={{height: 12, width: 16}}
                    />
                    <Text style={styles.memberView}>
                      Permanent Access to Course Material
                    </Text>
                  </View>
                  <View style={styles.PriceView}>
                    <View style={styles.Dot} />
                    <Text style={styles.FlatFee}>
                      Access your course material for the entire duration of
                      your membership.
                    </Text>
                  </View>
                </View>

                <View style={{marginVertical: 15}}>
                  <View style={styles.PriceView}>
                    <Image
                      source={require('../../assets/image/laptop_windows.png')}
                      style={{height: 17, width: 24}}
                    />
                    <Text style={styles.memberView}>
                      Online Lessons with Optional Meet-Ups
                    </Text>
                  </View>
                  <View style={styles.PriceView}>
                    <View style={styles.Dot} />
                    <Text style={styles.FlatFee}>
                      Access your course material for the entire duration of
                      your membership.
                    </Text>
                  </View>
                </View>

                <View style={{marginVertical: 15}}>
                  <View style={styles.PriceView}>
                    <Image
                      source={require('../../assets/image/calendar_month1.png')}
                      style={{height: 22, width: 20}}
                    />
                    <Text style={styles.memberView}>
                      13 hours 5 mins over 7 weeks (Estimated)
                    </Text>
                  </View>
                  <View style={styles.PriceView}>
                    <View style={styles.Dot} />
                    <Text style={styles.FlatFee}>
                      No time limit to finish a course, take as much time as you
                      need.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View>
              <CourseLesson {...this.props} />
            </View>
            <View>
              <CourseLesson {...this.props} />
            </View>
            <View>
              <CourseLesson {...this.props} />
            </View>

            <View>
              <HomeCourses {...this.props} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  InterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6597FF',
    borderRadius: 20,
    height: 34,
    paddingHorizontal: 15,
    marginRight: 10,
    marginVertical: 5,
  },
  InterFont: {fontSize: 12, fontWeight: '600', color: '#000', marginLeft: 10},
  Top_Margin: {width: '100%', alignSelf: 'center', marginVertical: 30},
  Text_14: {fontSize: 14, fontWeight: '700', color: '#000000'},
  Onest_View: {
    fontSize: 9,
    fontWeight: '400',
    color: '#3F3F3F',
    paddingVertical: 5,
  },
  scholerShipView: {
    height: 156,
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
    height: 81,
    width: 81,
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
  PriceView: {flexDirection: 'row', alignItems: 'center'},
  memberView: {fontSize: 16, fontWeight: '600', color: '#000', marginLeft: 10},
  Dot: {height: 3, width: 3, borderRadius: 3, backgroundColor: '#000'},
  FlatFee: {fontSize: 12, fontWeight: '500', color: '#000', marginLeft: 10},
});
