import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Book from '../../assets/svg/Book.svg';
import LinearGradient from 'react-native-linear-gradient';
import {navigateToCourseDetailsByIndex} from '../../Utils/APIs/UIAction';

var navigation;
var courses = ['a'];
export var handleDetailsButtonClick;

export const HomeCourses = props => {
  courses = props.courses;
  navigation = props.navigation;
  handleDetailsButtonClick = index => {
    navigateToCourseDetailsByIndex(props.navigation, courses, index);
  };

  return (
    <View>
      <View style={styles.CourseTopView}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={require('../../assets/image/CoursesCom.png')}
            style={{height: 28, width: 28}}
          />
          <Text style={styles.Font_18}> Courses</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate('CourseHome', {
              searchText: 'show me all courses',
              tabName: 'Explore Courses',
            })
          }
          style={{padding: 10}}>
          <Text style={styles.ViewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {courses != null &&
          courses.length > 0 &&
          courses.map((course, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                props.navigation.navigate('CourseDetail', {
                  courseId: course.course_id,
                })
              }
              style={styles.CourseView}>
              <View>
                <Image
                  source={{
                    uri: course.course_descriptor.images[0].url ?? undefined,
                  }}
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
                {course.course_descriptor.name}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  urce={{
                    uri: course.provider_descriptor.images[0].url ?? undefined,
                  }}
                  style={{height: 27, width: 27}}
                />
                <Text style={styles.Font_California}>
                  {course.provider_descriptor.name}
                </Text>
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
                    style={{color: '#065F46', fontSize: 12, fontWeight: '500'}}>
                    Bestseller{' '}
                  </Text>
                </View>
                <View>
                  <Text style={styles.BsFont}>₹{course.total_price}</Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={require('../../assets/image/Star12.png')}
                  style={{height: 20, width: 20}}
                />
                <Text style={styles.Rating}>{course.ratings}</Text>
              </View>
              <Text style={styles.Bg_Font}>
                {course.content_metadata.learner_level.value} . Course .{' '}
                {course.content_metadata.course_duration.value}{' '}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};
export const HomeCoursesNew = props => {
  const course = props.course;
  // console.log('course: ', props);
  // useEffect(() => {
  //   console.log('props: ', props);
  // }, []);
  return (
    <View>
      {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} > */}
      <View style={styles.CourseViewNew}>
        <View>
          <Image
            source={{uri: course.course_descriptor.images[0].url ?? undefined}}
            style={{height: 292, width: '100%', borderRadius: 8}}
          />
          <View style={{position: 'absolute', right: 10, top: 10}}>
            <Image
              source={require('../../assets/image/Degree.png')}
              style={{height: 28, width: 28}}
            />
          </View>
        </View>
        <Text style={styles.Font_16} numberOfLines={2} ellipsizeMode="tail">
          English for Common Interactions in the Workplace: Basic Level
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={{
              uri: course.provider_descriptor.images[0].url ?? undefined,
            }}
            style={{height: 27, width: 27}}
          />
          <Text style={styles.Font_California}>
            {course.provider_descriptor.name}
          </Text>
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
            <Text style={{color: '#065F46', fontSize: 12, fontWeight: '500'}}>
              Bestseller{' '}
            </Text>
          </View>
          <View>
            <Text style={styles.BsFont}>₹{course.total_price}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={require('../../assets/image/Star12.png')}
            style={{height: 20, width: 20}}
          />
          <Text style={styles.Rating}>4.6</Text>
        </View>
        <Text style={styles.Bg_Font}>
          {' '}
          {course.content_metadata.learner_level.value} . Course .{' '}
          {course.content_metadata.course_duration.value}
        </Text>
      </View>

      {/* </ScrollView> */}
    </View>
  );
};

export const HemePopularCourse = props => {
  const courses = props.courses;
  // console.log(courses);
  // const courses = null;
  return (
    <View>
      <View style={styles.CourseTopView}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={require('../../assets/image/golf_course.png')}
            style={{height: 20, width: 17}}
          />
          <Text style={styles.Font_18}> Most Popular Courses </Text>
        </View>
        <TouchableOpacity style={{padding: 10}}>
          <Text style={styles.ViewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {courses != null &&
          courses.length > 0 &&
          courses.map((course, index) => (
            <View style={styles.PCourseView} key={index}>
              <View>
                <Image
                  source={{
                    uri: course.course_descriptor.images[0].url ?? undefined,
                  }}
                  style={{height: 104, width: '100%', borderRadius: 8}}
                />
                {/* <View style={{ position: 'absolute', right: 10, top: 10 }}>
                            <Image source={require('../../assets/image/Degree.png')} style={{ height: 28, width: 28 }} />
                        </View> */}
              </View>
              <Text
                style={styles.Font_16}
                numberOfLines={1}
                ellipsizeMode="tail">
                {course.course_descriptor.name}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={require('../../assets/image/Frame12.png')}
                  style={{height: 27, width: 27}}
                />
                <Text style={styles.Font_California}>
                  {course.provider_descriptor.name}
                </Text>
              </View>
              <View style={[styles.Bestsaller1]}>
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
                    style={{color: '#065F46', fontSize: 12, fontWeight: '500'}}>
                    Bestseller{' '}
                  </Text>
                </View>
                <View>
                  <Text style={styles.BsFont}>₹{course.total_price}</Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={require('../../assets/image/Certificates1.png')}
                  style={{height: 24, width: 24}}
                />
                <Text style={styles.Rating1}>
                  {course.content_metadata.learning_objective.value}{' '}
                </Text>
              </View>
              <Text style={styles.Bg_Font}>
                {course.content_metadata.course_duration.value}{' '}
              </Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

export const HomeScholarship = props => {
  const scholarships = props.scholarships;
  return (
    <View style={{marginBottom: 0}}>
      <View style={styles.CourseTopView}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={require('../../assets/image/school.png')}
            style={{height: 24, width: 24}}
          />
          <Text style={styles.Font_18}> Scholarship People avail </Text>
        </View>
        <TouchableOpacity style={{padding: 10}}>
          <Text style={styles.ViewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {scholarships.length > 0 &&
          scholarships.map((scholarship, index) => (
            <View style={styles.ACourseView} key={index}>
              <View>
                <Image
                  source={{uri: scholarship.images[0] ?? undefined}}
                  style={{height: 104, width: '100%', borderRadius: 8}}
                />
                <View style={{position: 'absolute', right: 10, top: 10}}>
                  <Image
                    source={require('../../assets/image/Frame23.png')}
                    style={{height: 28, width: 28}}
                  />
                </View>
              </View>
              <Text
                style={styles.Font_16}
                numberOfLines={1}
                ellipsizeMode="tail">
                {scholarship.name}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={require('../../assets/image/Frame12.png')}
                  style={{height: 27, width: 27}}
                />
                <Text style={styles.Font_California}>
                  {scholarship.provider_name}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Image
                  source={require('../../assets/image/book_4.png')}
                  style={{height: 16, width: 16}}
                />
                <Text style={styles.Rating}>{scholarship.education} </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Image
                  source={require('../../assets/image/distance.png')}
                  style={{height: 16, width: 16}}
                />
                <Text style={styles.Rating}>
                  {' '}
                  {scholarship.address.city} - {scholarship.address.country}
                </Text>
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

export const CourseLesson = props => {
  return (
    <View>
      <LinearGradient
        start={{x: 0, y: 0.75}}
        end={{x: 1, y: 0.25}}
        colors={['#1A40A2', '#0A183C']}
        style={styles.linearGradient}>
        <View style={{width: '80%', alignSelf: 'center'}}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: '#FFC700',
              marginBottom: 5,
            }}>
            Course 1 • 45 minutes
          </Text>
          <Text
            style={{
              color: '#fff',
              fontSize: 14,
              fontWeight: '500',
              lineHeight: 25,
            }}>
            Welcome to the Deep Learning Nanodegree Program
          </Text>
        </View>
      </LinearGradient>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={styles.LessonView}>
          <View style={styles.LessonNew}>
            <Book height={32} width={32} />
            <Text style={styles.LessonText}>Lesson 1</Text>
          </View>
          <Text style={styles.ProgramText}>
            An Introduction to Your Nanodegree Program
          </Text>
          <Text style={styles.WelcomeText}>
            Welcome! We're so glad you're here.
          </Text>
          <Text style={styles.WelcomeText}>
            Join us in learning a bit more about
          </Text>
          <Text style={styles.WelcomeText}>
            what to expect and ways to succeed.
          </Text>
        </View>

        <View style={styles.LessonView}>
          <View style={styles.LessonNew}>
            <Book height={32} width={32} />
            <Text style={styles.LessonText}>Lesson 1</Text>
          </View>
          <Text style={styles.ProgramText}>
            An Introduction to Your Nanodegree Program
          </Text>
          <Text style={styles.WelcomeText}>
            Welcome! We're so glad you're here.
          </Text>
          <Text style={styles.WelcomeText}>
            Join us in learning a bit more about
          </Text>
          <Text style={styles.WelcomeText}>
            what to expect and ways to succeed.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

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
});
