import {
  Alert,
  Image,
  ImageBackground,
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
import {ButtonTab} from './Controls';
import Certificate from '../../assets/svg/Certificate.svg';
import Clock from '../../assets/svg/Clock.svg';
import Completion from '../../assets/svg/Completion.svg';
import {CourseLesson} from './HomeComponent';
import Drawer from './Drawer';
import {HeaderNew} from './Header';
import Intermediate from '../../assets/svg/Intermediate.svg';
import {MyButton2} from './Controls';
import {MyStatusBar} from './DarkTheme';
import PaymentPopup from './PaymentPopup';
import Repear from '../../assets/svg/repear.svg';
import {SearchNew} from './Search';
import Tower from '../../assets/svg/tower.svg';
import Video from 'react-native-video';
import {payment} from '../../Utils/APIs/Courses/paymentDetails';
import {selectCourse} from '../../Utils/APIs/L1Adapter';

getYouTubeVideoId = url => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url?.match(regExp);
  return match && match[7].length === 11 ? match[7] : false;
};
const getImageUrl = item => {
  const imageUrl = item?.descriptor?.images
    ? item?.descriptor?.images[0]?.url
    : undefined;

  if (imageUrl) {
    return imageUrl;
  } else {
    const mediaUrl = item?.descriptor?.media
      ? item?.descriptor?.media[0]?.url
      : undefined;

    if (mediaUrl) {
      const videoId = getYouTubeVideoId(mediaUrl);

      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/0.jpg;`;
      }
    }

    return 'https://www.shutterstock.com/shutterstock/photos/744886198/display_1500/stock-vector-no-image-available-vector-illustration-on-white-background-744886198.jpg'; // Placeholder image
  }
};
const getVideoUrl = item => {
  const mediaUrl = item?.descriptor?.media
    ? item?.descriptor?.media[0]?.url
    : undefined;

  if (mediaUrl) {
    if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
      const videoId = getYouTubeVideoId(mediaUrl);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (mediaUrl.includes('vimeo.com')) {
      return {type: 'vimeo', url: mediaUrl};
    } else {
      return {type: 'other', url: mediaUrl};
    }
  }

  return null;
};
export const SearchCourse = ({course, navigation}) => {
  // Extract variables with fallback values
  const catalog = course?.catalog ?? {};
  const providers = catalog?.providers ?? [];

  return (
    <View>
      {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}> */}

      {providers.map(provider =>
        provider.items.map(item => {
          // Extract item details with fallback values
          const courseName = item?.descriptor?.name ?? 'N/A';
          const courseImage = getImageUrl(item);
          const providerName = provider?.descriptor?.name ?? 'N/A';
          const providerImage =
            provider?.descriptor?.images?.[0]?.url &&
            provider?.descriptor?.images?.[0]?.url != ''
              ? provider?.descriptor?.images?.[0]?.url
              : undefined;
          const coursePrice = item?.price?.value ?? 'N/A';
          const courseRating = item?.rating ?? 'N/A';
          const learnerLevel = item?.tags?.[0]?.list?.[0]?.value ?? undefined;
          const learnerLevelTag = item?.tags?.find(
            tag => tag.descriptor?.code === 'content-metadata',
          );

          const courseDuration =
            learnerLevelTag?.list?.find(
              tagItem => tagItem.descriptor?.code === 'course-duration',
            )?.value ?? 'N/A';

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.CourseViewNew}
              onPress={() =>
                navigation.navigate('SearchCourseDetail', {
                  courseDetails: item,
                  providerDetails: provider,
                })
              }>
              <View>
                <Image
                  source={{uri: courseImage}}
                  style={{height: 292, width: '100%', borderRadius: 8}}
                />
                <View style={{position: 'absolute', right: 10, top: 10}}>
                  <Image
                    source={require('../../assets/image/Degree.png')}
                    style={{height: 28, width: 28}}
                  />
                </View>
              </View>
              <Text
                style={styles.Font_16}
                numberOfLines={2}
                ellipsizeMode="tail">
                {courseName}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={{uri: providerImage}}
                  style={{height: 27, width: 27}}
                />
                <Text style={styles.Font_California}>{providerName}</Text>
              </View>
              <View style={styles.Bestsaller}>
                <View style={styles.BestsallerView}>
                  <View
                    style={{
                      height: 5,
                      width: 5,
                      backgroundColor: '#34D399',
                      borderRadius: 5,
                      marginRight: 5,
                    }}
                  />
                  <Text
                    style={{
                      color: '#065F46',
                      fontSize: 12,
                      fontWeight: '500',
                    }}>
                    Bestseller
                  </Text>
                </View>
                <View>
                  <Text style={styles.BsFont}>₹{coursePrice}</Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={require('../../assets/image/Star12.png')}
                  style={{height: 20, width: 20}}
                />
                <Text style={styles.Rating}>{courseRating}</Text>
              </View>
              <Text style={styles.Bg_Font}>
                {learnerLevel} . Course . {courseDuration}
              </Text>
            </TouchableOpacity>
          );
        }),
      )}
    </View>
  );
};

export class SearchCourseDetail extends Component {
  constructor(props) {
    super(props);
    this.drawerRef = createRef();
    this.state = {
      data: [
        {id: 1, name: 'Home'},
        {id: 2, name: 'Explore Courses'},
        {id: 3, name: 'My Certifications'},
        {id: 4, name: 'My Courses'},
      ],
      isPlaying: false,
    };
    this.videoRef = React.createRef();
  }
  openDrawer = () => {
    this.drawerRef.current.openDrawer();
  };
  togglePlayPause = () => {
    this.setState(prevState => ({
      isPlaying: !prevState.isPlaying,
    }));
  };

  componentDidMount() {
    // const courseId = this.props.route.params.courseId;
    const res = selectCourse();
    console.log('select course: ', res);
  }

  render() {
    const {navigation} = this.props;
    onPress = props => {
      console.log('*******', props);
      // this.setState({CourseName: props});
    };
    const item = this.props.route.params.courseDetails;
    const provider = this.props.route.params.providerDetails;
    // console.log(this.props.route.params.courseDetails);
    // const {courseDetails} = this.state;
    // if (!courseDetails) {
    //   return (
    //     <SafeAreaView
    //       style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    //       <Text>Loading...</Text>
    //     </SafeAreaView>
    //   );
    // }

    // const catalog = courseDetails?.catalog ?? {};
    // const providers = catalog?.providers ?? [];
    // const provider = providers[0] ?? {};
    // const items = provider?.items ?? [];
    // const item = items[0] ?? {};

    // Extract values with default fallbacks
    const providerName = provider?.descriptor?.name ?? 'N/A';
    const courseName = item?.descriptor?.name ?? 'N/A';
    const courseVideo = getVideoUrl(item);
    console?.log('ASD:SMDASDMASMDAS:DA', courseVideo);
    const courseImage = getImageUrl(item);
    const courseShortDesc = item?.descriptor?.short_desc ?? 'N/A';
    const courseLongDesc = item?.descriptor?.long_desc ?? 'N/A';
    const providerShortDesc = provider?.descriptor?.short_desc ?? 'N/A';

    const providerImage =
      provider?.descriptor?.images?.[0]?.url &&
      provider?.descriptor?.images?.[0]?.url != ''
        ? provider?.descriptor?.images?.[0]?.url
        : undefined;
    const coursePrice = item?.price?.value ?? 'N/A';
    const courseRating = item?.rating ?? 'N/A';
    const learnerLevel = item?.tags?.[0]?.list?.[0]?.value ?? 'N/A';
    const learnerLevelTag = item?.tags?.find(
      tag => tag.descriptor?.code === 'content-metadata',
    );

    const courseDuration =
      learnerLevelTag?.list?.find(
        tagItem => tagItem.descriptor?.code === 'course-duration',
      )?.value ?? 'N/A';
    console.log('Course Name:', courseName);
    console.log('Provider Name:', providerName);
    console.log('Course Image:', courseImage);
    console.log('Provider Image:', providerImage);
    console.log('Course Price:', coursePrice);
    console.log('Course Rating:', courseRating);
    console.log('Learner Level:', learnerLevel);

    return (
      <Drawer ref={this.drawerRef} navigation={navigation}>
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
          <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
          <HeaderNew {...this.props} openDrawer={this.openDrawer} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* <SearchNew  {...this.props} /> */}

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
                {courseName}
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
                  {courseRating}
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
                  {learnerLevel}{' '}
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
                  {courseLongDesc}
                </Text>
              </View>
              <View style={{marginVertical: 10}}>
                <ImageBackground
                  source={{uri: courseImage}}
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
                  <View style={{marginVertical: 10}}>
                    <View style={styles.videoContainer}>
                      {/* <Video
                        ref={this.videoRef}
                        source={{uri: courseVideo}} // Assuming courseImage is a video URL
                        style={styles.video}
                        resizeMode="cover"
                        paused={!this.state.isPlaying}
                        onError={error => console.log('Video Error:', error)}
                      /> */}
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={this.togglePlayPause}>
                        <Image
                          source={require('../../assets/image/PlayButton.png')}
                          style={{height: 32, width: 32}}
                        />
                      </TouchableOpacity>
                    </View>
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
                          style={{
                            fontSize: 8,
                            fontWeight: '700',
                            color: '#000',
                          }}>
                          Save with a Personalized{'\n'}Discount!{' '}
                          <Text style={{color: '#2015FF'}}>Claim Now</Text>{' '}
                        </Text>
                      </ImageBackground>
                    </View>
                  </View>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginVertical: 10,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('SearchPaymentDetail', {
                      courseId: null,
                      item: item,
                      paymentAmount: coursePrice,
                    })
                  }
                  style={{
                    height: 30,
                    width: '100%',
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
                  <Text style={styles.InterFont}>{learnerLevel}</Text>
                </View>
                <View style={styles.InterButton}>
                  <Certificate height={24} width={24} />
                  <Text style={styles.InterFont}>
                    {/* {courseDetails.content_metadata.prerequisite.value} */}
                  </Text>
                </View>
                <View style={styles.InterButton}>
                  <Repear height={24} width={24} />
                  <Text style={styles.InterFont}>{courseDuration}</Text>
                </View>
                <View style={styles.InterButton}>
                  <Clock height={24} width={24} />
                  <Text style={styles.InterFont}>
                    {/* {courseDetails.content_metadata.learning_objective.value} */}
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
                        {providerName}
                      </Text>
                      <Text
                        style={styles.Onest_View}
                        numberOfLines={3}
                        ellipsizeMode="tail">
                        {' '}
                        {providerShortDesc}
                      </Text>
                      <Text
                        style={styles.Text_14}
                        numberOfLines={2}
                        ellipsizeMode="tail">
                        View all Courses of {providerName}{' '}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.scholerShip, styles.boxWithShadow]}>
                    <Image
                      source={{uri: providerImage}}
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

            {/* <View>
              <HomeCourses {...this.props} />
            </View> */}
          </ScrollView>
        </SafeAreaView>
      </Drawer>
    );
  }
}
export class SearchPaymentDetail extends Component {
  constructor(props) {
    super(props);
    this.drawerRef = createRef();
    this.state = {
      name: 'Nina',
      email: 'nina123@gmail.com',
      phone: '8888888888',
      address:
        '21, PRO4 LAAVISH, opposite Zolo, Spice Garden Layout Rd, Marathahalli, Bengaluru, Karnataka 560037',
      courseId: '',
      paymentAmount: '',
      item: null,
      isPopupVisible: false,
    };
  }
  componentDidMount() {
    console.log('params: ', this.props.route.params);
    const {courseId, paymentAmount, item} = this.props.route.params;
    this.setState({
      paymentAmount,
      courseId,
      item,
    });
    // console.log(courseDetails);
  }
  openDrawer = () => {
    this.drawerRef.current.openDrawer();
  };
  handlePay = async () => {
    const {name, email, phone, address, courseId, paymentAmount} = this.state;
    // if (courseId == null) courseId = 'course_2';
    // Prepare the request body
    const body = {
      course_id: 'course_2',
      payment_amount: paymentAmount,
      billing_address: {
        name,
        email,
        phone,
        address,
      },
    };

    try {
      //data = await payment(body);
      this.togglePopup();
      //console.log('Payment successful:', data);
      // Handle successful payment, navigate to success screen or update UI
      //Alert.alert('Confirm Payment');
      
      //this.props.navigation.navigate('ThankYou'); // Example navigation to thank you screen
    } catch (error) {
      console.error('Error making payment:', error.message);
      Alert.alert(
        'Payment Error',
        'Failed to complete payment. Please try again later.',
      );
    }
  };
  togglePopup = () => {
    this.setState(prevState => ({
      isPopupVisible: !prevState.isPopupVisible,
    }));
  };
  render() {
    const {navigation} = this.props;
    const {name, email, phone, address, paymentAmount, courseId, item} = this.state;
    const courseName = item?.descriptor?.name ?? 'N/A';
    const courseImage = item?.descriptor?.images?.[0]?.url ?? 'N/A';
    const coursePrice = item?.price?.value ?? 'N/A';

    const learnerLevel = item?.tags?.[0]?.list?.[0]?.value ?? 'N/A';
    const learnerLevelTag = item?.tags?.find(
      tag => tag.descriptor?.code === 'content-metadata',
    );
    const courseDuration =
      learnerLevelTag?.list?.find(
        tagItem => tagItem.descriptor?.code === 'course-duration',
      )?.value ?? 'N/A';

    if (!item) {
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
            <SearchNew {...this.props} searchText={this.state.searchText} />

            <View style={{marginHorizontal: 15}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 10,
                }}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}>
                  <Image
                    source={require('../../assets/image/BackBlue.png')}
                    style={{height: 24, width: 24}}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '600',
                    color: '#000',
                    marginLeft: 10,
                  }}>
                  Complete your Purchase as Guest
                </Text>
              </View>
              <View
                style={{
                  height: 189,
                  width: '100%',
                  borderWidth: 1,
                  borderColor: '#D9D9D9',
                  borderRadius: 8,
                }}>
                {/* {console.log('coursedetails2: ', courseDetails)} */}
                <View style={{flexDirection: 'row'}}>
                  <View style={{width: '35%'}}>
                    <Image
                      source={{uri: courseImage}}
                      style={{
                        height: 87,
                        width: '90%',
                        margin: 10,
                        borderRadius: 8,
                      }}
                    />
                  </View>
                  <View style={{width: '55%', marginLeft: 10}}>
                    <Text
                      style={{fontSize: 16, fontWeight: '600', color: '#000'}}>
                      {courseName}
                    </Text>
                    <Text
                      style={{fontSize: 14, fontWeight: '600', color: '#000'}}>
                      {coursePrice}
                    </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image
                        source={require('../../assets/image/finance_chip.png')}
                        style={{height: 10, width: 15}}
                      />
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '500',
                          color: '#000',
                          marginLeft: 10,
                        }}>
                        Price: Free for Members
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Clock height={20} width={20} />
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '500',
                          color: '#000',
                          marginLeft: 7,
                        }}>
                        Self-Paced Online Course with No Deadlines
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    height: 50,
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    marginTop: 20,
                  }}>
                  <Intermediate height={36} width={36} />
                  <Text
                    style={{fontSize: 12, fontWeight: '600', color: '#013499'}}>
                    {learnerLevel}
                  </Text>
                  <Completion height={36} width={36} />
                  <Text
                    style={{fontSize: 12, fontWeight: '600', color: '#013499'}}>
                    Completion Certificate
                  </Text>
                </View>
              </View>
              <View style={{marginVertical: 15}}>
                <Text style={{fontSize: 14, fontWeight: '600', color: '#000'}}>
                  Billing Address
                </Text>
                <View style={{margin: 10}}>
                  <Text style={styles.NameText}>Name</Text>
                  <View style={styles.InputView}>
                    <TextInput
                      style={{width: '100%'}}
                      value={name}
                      onChangeText={text => this.setState({name: text})}
                    />
                  </View>
                </View>
                <View style={{margin: 10}}>
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
                        value={phone}
                        onChangeText={text => this.setState({phone: text})}
                      />
                    </View>
                  </View>
                </View>

                <View style={{margin: 10}}>
                  <Text style={styles.NameText}>Email ID</Text>
                  <View style={styles.InputView}>
                    <TextInput
                      style={{width: '100%'}}
                      value={email}
                      onChangeText={text => this.setState({email: text})}
                    />
                  </View>
                </View>
                <View style={{margin: 10}}>
                  <Text style={styles.NameText}>Address</Text>
                  <View style={[styles.InputView, {height: 100}]}>
                    <TextInput
                      multiline={true}
                      style={{width: '100%'}}
                      value={address}
                      onChangeText={text => this.setState({address: text})}
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
          <View marginBottom={5}>
            <MyButton2 onPress={this.handlePay}>Pay ₹{paymentAmount}</MyButton2>
          </View>
          <PaymentPopup
            isPopupVisible={this.state.isPopupVisible}
            state_data={this.state}
            togglePopup={this.togglePopup}
          />
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
  // scholerShip: {
  //   position: 'absolute',
  //   left: -10,
  //   top: -20,
  //   height: 81,
  //   width: 81,
  //   borderRadius: 75,
  //   borderWidth: 2,
  //   borderColor: '#c0c0c0',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   margin: 5,
  // },
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
    width: 50,
    borderRadius: 40,
    borderWidth: 5,
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
  CourseViewNew: {
    width: '90%',
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
  linearGradient: {
    height: 138,
    width: '100%',
    justifyContent: 'center',
    marginTop: 10,
  },
  LessonView: {
    height: 239,
    width: 270,
    borderWidth: 1,
    borderColor: '#A6A5A5',
    borderRadius: 8,
    padding: 15,
    margin: 15,
  },
  LessonNew: {flexDirection: 'row', alignItems: 'center', marginVertical: 15},
  LessonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
    marginHorizontal: 10,
  },
  ProgramText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginVertical: 10,
    width: '80%',
  },
  WelcomeText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000',
    marginVertical: 5,
  },
  InputView: {
    height: 42,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  NameText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 5,
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
  name: {marginBottom: 3, color: '#374151', fontWeight: '500'},
});
