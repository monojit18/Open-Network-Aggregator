import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {HomeCourses, HomeCoursesNew} from './HomeComponent';
import {
  getAllCourses,
  getInProgressCourses,
  homePageList,
} from '../../Utils/APIs';
import {
  getUserCertifications,
  getUserPayments,
} from '../../Utils/APIs/Courses/getUserCourses';
import {useEffect, useState} from 'react';

import Arrow from '../../assets/svg/downArrow.svg';
import CheckBox from '@react-native-community/checkbox';
import {MyStatusBar} from './DarkTheme';
import {Overlay} from 'react-native-elements';
import {Picker} from '@react-native-picker/picker';
import {RadioGroup} from 'react-native-radio-buttons-group';

export const MyButton1 = props => {
  return (
    <View>
      <TouchableOpacity disabled={props.disabled} onPress={props.onPress}>
        {(props.loading && <ActivityIndicator color="blue" />) || (
          <Text
            style={[
              {
                width: '90%',
                backgroundColor: '#013499',
                borderColor: '#013499',
                borderWidth: 1,
                borderRadius: 25,
                overflow: 'hidden',
                textAlign: 'center',
                textAlignVertical: 'center',
                color: '#fff',
                marginTop: 20,
                paddingVertical: 12,
                alignSelf: 'center',
              },
              props.active && {backgroundColor: '#73589B', color: '#fff'},
              props.contentStyle,
            ]}>
            {props.children}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
export const MyButton2 = props => {
  return (
    <View>
      <TouchableOpacity disabled={props.disabled} onPress={props.onPress}>
        {(props.loading && <ActivityIndicator color="blue" />) || (
          <Text
            style={[
              {
                width: '90%',
                backgroundColor: '#013499',
                borderColor: '#013499',
                borderWidth: 1,
                borderRadius: 25,
                overflow: 'hidden',
                textAlign: 'center',
                textAlignVertical: 'center',
                color: '#fff',
                marginTop: 20,
                paddingVertical: 12,
                alignSelf: 'center',
              },
              props.active && {backgroundColor: '#013499', color: '#fff'},
              props.contentStyle,
            ]}>
            {props.children}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export const FlashScreen1 = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
      <ImageBackground
        source={require('../../assets/image/FlashBack.png')}
        style={{flex: 1}}
        imageStyle={{flex: 1}}>
        <View
          style={{flex: 0.3, justifyContent: 'flex-end', alignItems: 'center'}}>
          <Text
            style={{
              fontSize: 30,
              color: '#ffffff',
              fontWeight: '600',
              lineHeight: 36,
            }}>
            “Unlock Your Future”
          </Text>
          <Image
            source={require('../../assets/image/LockBottom.png')}
            style={{height: 10, width: 90, alignSelf: 'flex-end', right: 65}}
          />

          <View style={{width: '80%', top: 20}}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: '#ffffff',
                textAlign: 'center',
              }}>
               Sign Up for Courses, Scholarships, and Job Opportunities!”
            </Text>
          </View>
        </View>
        <View style={{flex: 0.7, justifyContent: 'center'}}>
          <Image
            source={require('../../assets/image/FlashImage.png')}
            style={{height: 407, width: '100%'}}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export const ButtonTab = props => {
  const {data, tabName} = props;
  const [SelectedButton, setSelectedButton] = useState(tabName || 'Home');

  useEffect(() => {
    if (tabName) {
      setSelectedButton(tabName);
    }
  }, [tabName]);
  const onSubmitanc = item => {
    setSelectedButton(item?.name), props.onSubmit(item?.name);
  };

  return (
    <View>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={{backgroundColor: '#f7fafe', marginHorizontal: 10}}>
        {data?.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => onSubmitanc(item)}>
            <View
              style={[
                {
                  height: 36,
                  width: 138,
                  borderRadius: 6,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  marginRight: 10,
                  marginVertical: 0,
                },
                SelectedButton === item?.name
                  ? {backgroundColor: '#E0E7FF', borderColor: '#E0E7FF'}
                  : {backgroundColor: '#f7fafe', borderColor: '#f7fafe'},
              ]}>
              <Text
                style={[
                  {fontSize: 12, fontWeight: '600'},
                  SelectedButton === item?.name
                    ? {color: '#4338CA'}
                    : {color: '#6B7280'},
                ]}>
                {item?.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
export const Fundamentals = props => {
  const [courses, setCourses] = useState([]);
  const [progressCourses, setProgressCourses] = useState([]);
  // const progressCourses = [1, 2];

  useEffect(() => {
    fetchCourses();
    fetchProgressCourses();
  }, []);
  const fetchProgressCourses = async () => {
    try {
      const data = await getInProgressCourses();
      console.log('courses in progress: ', data);
      setProgressCourses(data); // Assuming your API response has a 'courses' array
    } catch (error) {
      console.error('Error fetching in progress courses:', error);
      // Handle error state or show error message
    }
  };
  const fetchCourses = async () => {
    try {
      const data = await homePageList();
      setCourses(data); // Assuming your API response has a 'courses' array
    } catch (error) {
      console.error('Error fetching courses for course homepage:', error);
      // Handle error state or show error message
    }
  };
  return (
    <View>
      {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}> */}
      {progressCourses.map((course, index) => (
        <View
          style={{
            height: 209,
            width: '90%',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#A6A5A5',
            alignSelf: 'center',
            marginVertical: 15,
            padding: 15,
          }}>
          <View style={{flexDirection: 'row'}}>
            <View style={{width: '25%'}}>
              <Image
                source={{
                  uri:
                    course.items.course_descriptor.images[0].url ?? undefined,
                }}
                style={{height: 40, width: 65, borderRadius: 8}}
              />
            </View>
            <View style={{width: '75%'}}>
              <Text
                style={styles.Font_16}
                numberOfLines={1}
                ellipsizeMode="tail">
                {course.items.course_descriptor.name}
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
            </View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 25}}>
            <View style={{width: '50%'}}>
              <Text
                style={styles.Font_14}
                numberOfLines={1}
                ellipsizeMode="tail">
                Current Lesson
              </Text>
              <Text style={{fontSize: 12, fontWeight: '500', color: '#636363'}}>
                {course.items.current_lesson}
              </Text>
              <View
                style={{
                  height: 30,
                  width: 126,
                  backgroundColor: '#E0E7FF',
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Text
                  style={{fontSize: 12, fontWeight: '500', color: '#4338CA'}}>
                  Go to the lesson{' '}
                </Text>
              </View>
            </View>
            <View style={{width: '50%'}}>
              <Text
                style={styles.Font_14}
                numberOfLines={1}
                ellipsizeMode="tail">
                overall Performance{' '}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 14, fontWeight: '600'}}>
                  {' '}
                  {course.items.ratings}
                </Text>
                <Image
                  source={require('../../assets/image/Star21.png')}
                  style={{height: 13, width: 13}}
                />
                <View
                  style={{
                    height: 20,
                    width: 80,
                    borderRadius: 4,
                    backgroundColor: '#FEF3C7',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginLeft: 20,
                    marginTop: 10,
                  }}>
                  <View
                    style={{
                      height: 6,
                      width: 6,
                      backgroundColor: '#FBBF24',
                      borderRadius: 6,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: '#92400E',
                    }}>
                    {course.course_performance}
                  </Text>
                </View>
              </View>
              {/* <ProgressBarAndroid color="#2196F3"  /> */}
              <View style={{right: 10, bottom: 0, position: 'absolute'}}>
                <ImageBackground
                  source={require('../../assets/image/Group12.png')}
                  style={{
                    height: 50,
                    width: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{fontSize: 6, textAlign: 'center', color: '#000'}}>
                    {' '}
                    {course.items.completion_percentage}%{'\n'}Completed
                  </Text>
                </ImageBackground>
              </View>
            </View>
          </View>
        </View>
      ))}
      {/* </ScrollView> */}
      {/* <View>
        <FundamentalsFilters {...props} />
      </View> */}

      <View>
        <HomeCourses {...props} courses={courses.allCourse} />
        <HomeCourses {...props} courses={courses.recentViewedCourse} />
        <HomeCourses {...props} courses={courses.popularCourse} />
      </View>
    </View>
  );
};

export const FundamentalsFilters = props => {
  const [modalVisible, setModalVisible] = useState(false);
  const [radioButtons, setRadioButtons] = useState([
    {
      id: '1',
      label: 'Course Fee Hight to Low',
      value: 'Course Fee Hight to Low',
    },
    {
      id: '2',
      label: 'Course Fee Low to High',
      value: 'Course Fee Low to High',
    },
    {
      id: '3',
      label: 'Rating hight to Low         ',
      value: 'Rating hight to Low        ',
    },
    {
      id: '4',
      label: 'Rating Low to High          ',
      value: 'Rating Low to High          ',
    },
    {
      id: '5',
      label: 'Course list A to z             ',
      value: 'Course list A to z             ',
    },
    {
      id: '6',
      label: 'Course list Z To A            ',
      value: 'Course list Z To A            ',
    },
  ]);
  const [selectedId, setSelectedId] = useState(null);

  const setSelectedRadio = selectedId => {
    setSelectedId(selectedId);
    setModalVisible(!modalVisible);
  };

  const [visible, setVisible] = useState(false);

  const toggleOverlay = () => {
    setVisible(!visible);
  };
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const onTabChange = tabIndex => {
    setActiveTabIndex(tabIndex);
  };
  const [selectedValues, setSelectedValues] = useState([]);
  const [checkboxes, setCheckboxes] = useState([
    {id: 1, label: 'Business (2,375)', checked: false},
    {id: 2, label: 'Computer Science (2,100)', checked: false},
    {id: 3, label: 'Data Science (1,414)', checked: false},
    {id: 4, label: 'Information Technology (1,140)', checked: false},
  ]);

  const handleCheckboxChange = label => {
    const updatedCheckboxes = checkboxes.map(checkbox =>
      checkbox.label === label
        ? {...checkbox, checked: true}
        : {...checkbox, checked: false},
    );
    setCheckboxes(updatedCheckboxes);
    const selected = updatedCheckboxes.filter(checkbox => checkbox.checked);
    setSelectedValues(selected.map(checkbox => checkbox.label));
  };
  const [checkboxes1, setCheckboxes1] = useState([
    {id: 1, label: 'NPTEL', checked: false},
    {id: 2, label: 'TTM', checked: false},
    {id: 3, label: 'Oxford', checked: false},
    {id: 4, label: 'CIOT', checked: false},
  ]);
  const handleCheckboxChange1 = label => {
    const updatedCheckboxes = checkboxes1.map(checkbox =>
      checkbox.label === label
        ? {...checkbox, checked: true}
        : {...checkbox, checked: false},
    );
    setCheckboxes1(updatedCheckboxes);
    const selected = updatedCheckboxes.filter(checkbox => checkbox.checked);
    setSelectedValues(selected.map(checkbox => checkbox.label));
  };

  const [checkboxes2, setCheckboxes2] = useState([
    {id: 1, label: 'Paid', checked: false},
    {id: 2, label: 'Free', checked: false},
  ]);
  const handleCheckboxChange2 = label => {
    const updatedCheckboxes = checkboxes2.map(checkbox =>
      checkbox.label === label
        ? {...checkbox, checked: true}
        : {...checkbox, checked: false},
    );
    setCheckboxes2(updatedCheckboxes);
    const selected = updatedCheckboxes.filter(checkbox => checkbox.checked);
    setSelectedValues(selected.map(checkbox => checkbox.label));
  };

  const [checkboxes3, setCheckboxes3] = useState([
    {id: 1, label: 'Available', checked: false},
    {id: 2, label: 'Not available', checked: false},
  ]);
  const handleCheckboxChange3 = label => {
    const updatedCheckboxes = checkboxes3.map(checkbox =>
      checkbox.label === label
        ? {...checkbox, checked: true}
        : {...checkbox, checked: false},
    );
    setCheckboxes3(updatedCheckboxes);
    const selected = updatedCheckboxes.filter(checkbox => checkbox.checked);
    setSelectedValues(selected.map(checkbox => checkbox.label));
  };

  const [checkboxes4, setCheckboxes4] = useState([
    {id: 1, label: 'Available', checked: false},
    {id: 2, label: 'Not available', checked: false},
  ]);
  const handleCheckboxChange4 = label => {
    const updatedCheckboxes = checkboxes4.map(checkbox =>
      checkbox.label === label
        ? {...checkbox, checked: true}
        : {...checkbox, checked: false},
    );
    setCheckboxes4(updatedCheckboxes);
    const selected = updatedCheckboxes.filter(checkbox => checkbox.checked);
    setSelectedValues(selected.map(checkbox => checkbox.label));
  };

  const [checkboxes5, setCheckboxes5] = useState([
    {id: 1, label: 'Available', checked: false},
    {id: 2, label: 'Not available', checked: false},
  ]);
  const handleCheckboxChange5 = label => {
    const updatedCheckboxes = checkboxes5.map(checkbox =>
      checkbox.label === label
        ? {...checkbox, checked: true}
        : {...checkbox, checked: false},
    );
    setCheckboxes5(updatedCheckboxes);
    const selected = updatedCheckboxes.filter(checkbox => checkbox.checked);
    setSelectedValues(selected.map(checkbox => checkbox.label));
  };

  return (
    <View>
      <View style={{flexDirection: 'row', padding: 15}}>
        <TouchableOpacity
          onPress={toggleOverlay}
          style={[
            styles.inputView,
            {
              justifyContent: 'space-evenly',
              alignItems: 'center',
              flexDirection: 'row',
            },
          ]}>
          <Text style={{fontSize: 12}}>Filter</Text>
          <Arrow height={20} width={20} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[
            styles.inputView,
            {
              justifyContent: 'space-evenly',
              alignItems: 'center',
              flexDirection: 'row',
            },
          ]}>
          <Text>Sort</Text>
          <Arrow height={20} width={20} />
        </TouchableOpacity>
      </View>

      <Overlay
        isVisible={visible}
        onBackdropPress={toggleOverlay}
        overlayStyle={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          bottom: 0,
          top: 0,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 10,
          }}>
          <TouchableOpacity onPress={toggleOverlay}>
            <Image
              source={require('../../assets/image/BackBlue.png')}
              style={{height: 24, width: 24}}
            />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '90%',
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#000',
                marginLeft: 10,
              }}>
              Filter
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: '#1A40A2',
                  marginLeft: 10,
                }}>
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{height: 50, flexDirection: 'row'}}>
          {selectedValues.map((value, index) => (
            <View
              style={{
                paddingHorizontal: 20,
                backgroundColor: '#FEF3C7',
                height: 35,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 40,
              }}>
              <Text key={index} style={styles.selectedValue}>
                {value} <Text style={{fontSize: 12, color: '#FBBF24'}}> X</Text>
              </Text>
            </View>
          ))}
        </View>

        <View style={{flex: 2, flexDirection: 'row'}}>
          <View
            style={{
              flex: 0.7,
              backgroundColor: '#D5E6FB40',
              opacity: 0.8,
              left: -10,
            }}>
            {/* <TouchableOpacity onPress={() => { this.setState({ currentTab: "Year" }) }} style={{ flexDirection: 'row', marginVertical: 10, paddingVertical: 10, backgroundColor: this.state.currentTab == "Year" ? "#fff" : "#F2F3F7" }}>
              <Text style={{ fontWeight: "bold", marginLeft: 7 }}>Years of Experience</Text>
            </TouchableOpacity> */}
            {[0, 1, 2, 3, 4, 5].map(index => (
              <TouchableOpacity
                key={index}
                onPress={() => onTabChange(index)}
                style={[
                  styles.CloseImage_One,
                  activeTabIndex === index && {backgroundColor: '#D5E6FB'},
                ]}>
                <Text
                  style={{
                    color: '#000',
                    paddingLeft: 10,
                    fontSize: 14,
                    fontWeight: '500',
                  }}>
                  {index === 0 && 'Topic  '}
                  {index === 1 && 'Provider    '}
                  {index === 2 && 'Free    '}
                  {index === 3 && 'Scholarship'}
                  {index === 4 && 'Certification'}
                  {index === 5 && 'Live Classes'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{flex: 1.3, backgroundColor: '#fff', paddingTop: 10}}>
            {activeTabIndex === 0 && (
              <View>
                {checkboxes.map(checkbox => (
                  <View key={checkbox.label} style={styles.checkboxItem}>
                    <CheckBox
                      value={checkbox.checked}
                      onValueChange={() => handleCheckboxChange(checkbox.label)}
                    />
                    <Text style={styles.label}>{checkbox.label}</Text>
                  </View>
                ))}
              </View>
            )}
            {activeTabIndex === 1 && (
              <View>
                {checkboxes1.map(checkbox => (
                  <View key={checkbox.label} style={styles.checkboxItem}>
                    <CheckBox
                      value={checkbox.checked}
                      onValueChange={() =>
                        handleCheckboxChange1(checkbox.label)
                      }
                    />
                    <Text style={styles.label}>{checkbox.label}</Text>
                  </View>
                ))}
              </View>
            )}
            {activeTabIndex === 2 && (
              <View>
                {checkboxes2.map(checkbox => (
                  <View key={checkbox.label} style={styles.checkboxItem}>
                    <CheckBox
                      value={checkbox.checked}
                      onValueChange={() =>
                        handleCheckboxChange2(checkbox.label)
                      }
                    />
                    <Text style={styles.label}>{checkbox.label}</Text>
                  </View>
                ))}
              </View>
            )}
            {activeTabIndex === 3 && (
              <View>
                {checkboxes3.map(checkbox => (
                  <View key={checkbox.label} style={styles.checkboxItem}>
                    <CheckBox
                      value={checkbox.checked}
                      onValueChange={() =>
                        handleCheckboxChange3(checkbox.label)
                      }
                    />
                    <Text style={styles.label}>{checkbox.label}</Text>
                  </View>
                ))}
              </View>
            )}
            {activeTabIndex === 4 && (
              <View>
                {checkboxes4.map(checkbox => (
                  <View key={checkbox.label} style={styles.checkboxItem}>
                    <CheckBox
                      value={checkbox.checked}
                      onValueChange={() =>
                        handleCheckboxChange4(checkbox.label)
                      }
                    />
                    <Text style={styles.label}>{checkbox.label}</Text>
                  </View>
                ))}
              </View>
            )}
            {activeTabIndex === 5 && (
              <View>
                {checkboxes5.map(checkbox => (
                  <View key={checkbox.label} style={styles.checkboxItem}>
                    <CheckBox
                      value={checkbox.checked}
                      onValueChange={() =>
                        handleCheckboxChange5(checkbox.label)
                      }
                    />
                    <Text style={styles.label}>{checkbox.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View>
          <MyButton2 onPress={toggleOverlay}>Apply</MyButton2>
        </View>

        {/* <View style={styles.overlayContent} >
          <Text h4>Overlay Title</Text>
          <Text>This is an overlay example.</Text>
        </View>
        <Button title="Close Overlay" onPress={toggleOverlay} /> */}
      </Overlay>
      <View>
        <Modal
          animationType={'fade'}
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => [setModalVisible(!modalVisible)]}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#000',
                    marginBottom: 15,
                  }}>
                  Sort by
                </Text>

                <View>
                  <RadioGroup
                    radioButtons={radioButtons}
                    onPress={setSelectedRadio}
                    selectedId={selectedId}
                    // layout=""
                    containerStyle={styles.radioContainer}
                    buttonContainerStyle={styles.buttonContainer}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export const ReusableFilters = ({applyFilters, filters}) => {
  const [visible, setVisible] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedValues, setSelectedValues] = useState([]);
  const [filterTabs, setFilterTabs] = useState(filters);

  const handleCheckboxChange = (tabIndex, label, value) => {
    const updatedFilterTabs = [...filterTabs];
    updatedFilterTabs[tabIndex] = {
      ...updatedFilterTabs[tabIndex],
      checkboxes: updatedFilterTabs[tabIndex].checkboxes.map(checkbox =>
        checkbox.label === label
          ? {...checkbox, checked: !checkbox.checked}
          : checkbox,
      ),
    };

    setFilterTabs(updatedFilterTabs);

    const selected = updatedFilterTabs[tabIndex].checkboxes.filter(
      checkbox => checkbox.checked,
    );
    const selectedItems = selected.map(checkbox => ({
      label: checkbox.label,
      value: checkbox.value,
      field: checkbox.field,
    }));

    setSelectedValues(prevSelectedValues => {
      const newSelectedValues = prevSelectedValues.filter(
        item =>
          !updatedFilterTabs[tabIndex].checkboxes
            .map(checkbox => checkbox.value)
            .includes(item.value),
      );

      return [...newSelectedValues, ...selectedItems];
    });
  };

  const removeFilter = value => {
    setSelectedValues(prevSelectedValues =>
      prevSelectedValues.filter(item => item.value !== value),
    );

    const updatedFilterTabs = filterTabs.map(tab => ({
      ...tab,
      checkboxes: tab.checkboxes.map(checkbox =>
        checkbox.value === value ? {...checkbox, checked: false} : checkbox,
      ),
    }));

    setFilterTabs(updatedFilterTabs);
  };

  const clearAllFilters = () => {
    setSelectedValues([]);
    const resetFilterTabs = filterTabs.map(tab => ({
      ...tab,
      checkboxes: tab.checkboxes.map(checkbox => ({
        ...checkbox,
        checked: false,
      })),
    }));
    setFilterTabs(resetFilterTabs);
  };

  const toggleOverlay = () => {
    console.log('Selected Values:', selectedValues);
    applyFilters(selectedValues);
    setVisible(!visible);
  };

  const hasFiltersApplied = selectedValues.length > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleOverlay} style={styles.filterButton}>
        <Text style={styles.filterButtonText}>Filter</Text>
        {hasFiltersApplied && <View style={styles.filterIndicator} />}
        <Arrow height={20} width={20} />
      </TouchableOpacity>

      <Overlay
        isVisible={visible}
        onBackdropPress={toggleOverlay}
        overlayStyle={styles.overlay}>
        <View style={styles.overlayHeader}>
          <TouchableOpacity onPress={toggleOverlay} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.overlayTitle}>Filter</Text>
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal style={styles.selectedValuesContainer}>
          {selectedValues.map((item, index) => (
            <View key={index} style={styles.selectedValueChip}>
              <Text style={styles.selectedValueText}>
                {item.label}{' '}
                <Text
                  style={styles.removeFilterText}
                  onPress={() => removeFilter(item.value)}>
                  ×
                </Text>
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.filterContent}>
          <ScrollView style={styles.tabContainer}>
            {filterTabs.map((tab, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveTabIndex(index)}
                style={[
                  styles.tabItem,
                  activeTabIndex === index && styles.activeTabItem,
                ]}>
                <Text style={styles.tabText}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView style={styles.checkboxesContainer}>
            {filterTabs[activeTabIndex].checkboxes.map(checkbox => (
              <View key={checkbox.id} style={styles.checkboxItem}>
                <CheckBox
                  value={checkbox.checked || false}
                  onValueChange={() =>
                    handleCheckboxChange(
                      activeTabIndex,
                      checkbox.label,
                      checkbox.value,
                    )
                  }
                />
                <Text style={styles.checkboxLabel}>{checkbox.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <MyButton2 onPress={toggleOverlay} style={styles.applyButton}>
          Apply
        </MyButton2>
      </Overlay>
    </View>
  );
};

// export const ExploreCourses = props => {
//   const [selected, setSelectedValue] = useState();
//   return (
//     <View>
//       {/* <View style={{ flexDirection: 'row', padding: 15 }}>
//         <View style={styles.inputView}>
//           <Picker
//             selectedValue={selected}
//             style={styles.picker}
//             onValueChange={itemValue => setSelectedValue(itemValue)}>
//             <Picker.Item label="Filter" style={{color: '#989898'}} />
//             <Picker.Item label="English" value="English" />
//             <Picker.Item label="Hindi" value="Hindi" />
//             <Picker.Item label="Spanish" value="Spanish" />
//             <Picker.Item label="German" value="German" />
//           </Picker>
//         </View>
//         <View style={styles.inputView}>
//           <Picker
//             selectedValue={selected}
//             style={styles.picker}
//             onValueChange={itemValue => setSelectedValue(itemValue)}>
//             <Picker.Item label="Sort " style={{color: '#989898'}} />
//             <Picker.Item label="English" value="English" />
//             <Picker.Item label="Hindi" value="Hindi" />
//             <Picker.Item label="Spanish" value="Spanish" />
//             <Picker.Item label="German" value="German" />
//           </Picker>
//         </View>
//       </View> */}
//       <View>
//         <FundamentalsFilters {...props} />
//       </View>

//       <View>
//         <HomeCoursesNew {...props} />
//         <HomeCoursesNew {...props} />
//         <HomeCoursesNew {...props} />
//         <HomeCoursesNew {...props} />
//       </View>
//     </View>
//   );
// };
export const ExploreCourses = props => {
  const [selected, setSelectedValue] = useState();
  const [courses, setCourses] = useState([]);
  // const progressCourses = [1, 2];

  useEffect(() => {
    fetchCourses();
  }, []);
  const fetchCourses = async () => {
    try {
      const data = await getAllCourses();
      console.log('courses in explore: ', data);
      setCourses(data); // Assuming your API response has a 'courses' array
    } catch (error) {
      console.error('Error fetching in explore courses:', error);
      // Handle error state or show error message
      Alert.alert('Cannot show Explore courses');
    }
  };

  return (
    <View>
      <View style={{flexDirection: 'row', padding: 15}}>
        <View style={styles.inputView}>
          <Picker
            selectedValue={selected}
            style={styles.picker}
            onValueChange={itemValue => setSelectedValue(itemValue)}>
            <Picker.Item label="Filter" style={{color: '#989898'}} />
            <Picker.Item label="English" value="English" />
            <Picker.Item label="Hindi" value="Hindi" />
            <Picker.Item label="Spanish" value="Spanish" />
            <Picker.Item label="German" value="German" />
          </Picker>
        </View>
        <View style={styles.inputView}>
          <Picker
            selectedValue={selected}
            style={styles.picker}
            onValueChange={itemValue => setSelectedValue(itemValue)}>
            <Picker.Item label="Sort " style={{color: '#989898'}} />
            <Picker.Item label="English" value="English" />
            <Picker.Item label="Hindi" value="Hindi" />
            <Picker.Item label="Spanish" value="Spanish" />
            <Picker.Item label="German" value="German" />
          </Picker>
        </View>
      </View>

      <View>
        {courses.length > 0 &&
          courses.map((course, index) => (
            <HomeCoursesNew key={index} course={course} />
          ))}
      </View>
    </View>
  );
};
export const MyCertification = props => {
  const [courses, setCourses] = useState([]);
  // const progressCourses = [1, 2];

  useEffect(() => {
    fetchCourses();
  }, []);
  const fetchCourses = async () => {
    try {
      const data = await getUserCertifications();
      console.log('DATA FROM MY CERTS; ', data);
      setCourses(data);
    } catch (error) {
      console.error('Error fetching in user certifications', error);
      // Handle error state or show error message
    }
  };

  const [selected, setSelectedValue] = useState();
  return (
    <View>
      {/* <View style={{ flexDirection: 'row', padding: 15 }}>
        <View style={styles.inputView}>
          <Picker
            selectedValue={selected}
            style={styles.picker}
            onValueChange={itemValue => setSelectedValue(itemValue)}>
            <Picker.Item label="Filter" style={{color: '#989898'}} />
            <Picker.Item label="English" value="English" />
            <Picker.Item label="Hindi" value="Hindi" />
            <Picker.Item label="Spanish" value="Spanish" />
            <Picker.Item label="German" value="German" />
          </Picker>
        </View>
        <View style={styles.inputView}>
          <Picker
            selectedValue={selected}
            style={styles.picker}
            onValueChange={itemValue => setSelectedValue(itemValue)}>
            <Picker.Item label="Sort " style={{color: '#989898'}} />
            <Picker.Item label="English" value="English" />
            <Picker.Item label="Hindi" value="Hindi" />
            <Picker.Item label="Spanish" value="Spanish" />
            <Picker.Item label="German" value="German" />
          </Picker>
        </View>
      </View> */}
      {/* <View>
        <FundamentalsFilters {...props} />
      </View> */}
      <View>
        <View style={styles.CourseTopView}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={require('../../assets/image/CoursesCom.png')}
              style={{height: 28, width: 28}}
            />
            <Text style={styles.Font_18}> Courses</Text>
          </View>
          <TouchableOpacity style={{padding: 10}}>
            <Text style={styles.ViewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {courses.length > 0 &&
          courses.map((course, index) => (
            <View style={styles.UxStyle}>
              <View style={{flexDirection: 'row'}}>
                <View style={{width: '25%'}}>
                  <Image
                    source={{
                      uri:
                        course.provider_descriptor.images[0].url ?? undefined,
                    }}
                    style={{height: 45, width: 73, borderRadius: 6}}
                  />
                </View>
                <View style={{width: '50%'}}>
                  <Text style={styles.UxText}>
                    {course.items.course_descriptor.name}
                  </Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image
                      source={{
                        uri:
                          course.provider_descriptor.images[0].url ?? undefined,
                      }}
                      style={{height: 25, width: 25}}
                    />
                    <Text style={styles.California}>
                      {course.provider_descriptor.name}
                    </Text>
                  </View>
                </View>
                <View style={{width: '25%', justifyContent: 'flex-end'}}>
                  <ImageBackground
                    source={require('../../assets/image/Cricle1.png')}
                    style={{
                      height: 50,
                      width: 50,
                      alignSelf: 'flex-end',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 6,
                        fontWeight: '500',
                        color: '#000',
                      }}>
                      {' '}
                      {course.items.completion_percentage}%{'\n'}Completed
                    </Text>
                  </ImageBackground>
                </View>
              </View>
              <View style={styles.ButtonView}>
                <TouchableOpacity style={styles.ViewCertificat}>
                  <Text
                    style={{fontSize: 12, fontWeight: '500', color: '#374151'}}>
                    View Certification{' '}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.DownloadView}>
                  <Text
                    style={{fontSize: 12, fontWeight: '500', color: '#fff'}}>
                    Download Certification
                  </Text>
                </TouchableOpacity>
                <View></View>
              </View>
            </View>
          ))}
      </View>

      <View>
        {/* Recently viewed courses */}
        {/* <HomeCourses {...props} courses={courses} /> */}
        {/* Most popular certificates */}
        {/* <HomeCourses {...props} /> */}
        {/* <HomeCoursesNew {...props} /> */}
        {/* <HomeCoursesNew {...props} /> */}
      </View>
    </View>
  );
};
export const PaymentView = props => {
  const [courses, setCourses] = useState([]);
  // const progressCourses = [1, 2];

  useEffect(() => {
    fetchCourses();
  }, []);
  const fetchCourses = async () => {
    try {
      const data = await getUserPayments();
      // console.log('DATA FROM MY PAYMENTS; ', data);
      setCourses(data);
    } catch (error) {
      console.error('Error fetching in user payments', error);
      // Handle error state or show error message
    }
  };
  return (
    <View>
      {courses.map((course, index) => (
        <View key={index} style={styles.UxStyle}>
          <View style={{flexDirection: 'row'}}>
            <View style={{width: '25%'}}>
              <Image
                source={{
                  uri:
                    course.items.course_descriptor.images[0].url ?? undefined,
                }}
                style={{height: 45, width: 73, borderRadius: 6}}
              />
            </View>
            <View style={{width: '50%'}}>
              <Text style={styles.UxText}>
                {course.items.course_descriptor.name}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={{
                    uri: course.provider_descriptor.images[0].url ?? undefined,
                  }}
                  style={{height: 25, width: 25}}
                />
                <Text style={styles.California}>
                  {course.provider_descriptor.name}
                </Text>
              </View>
              <Text style={{fontSize: 13, fontWeight: '500', color: '#000'}}>
                ₹{course.total_price}
              </Text>
            </View>
          </View>
          <View style={[styles.ButtonView1]}>
            <TouchableOpacity
              style={[styles.DownloadView, {alignSelf: 'flex-end'}]}>
              <Text style={{fontSize: 12, fontWeight: '500', color: '#fff'}}>
                Download invoice
              </Text>
            </TouchableOpacity>
            <View></View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    // alignItems: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  modalView: {
    marginTop: 10,
    elevation: 5,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 35,
    borderTopWidth: 2,
    borderTopColor: '#EBEBEB',
    // alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
  },
  Font_16: {fontSize: 16, fontWeight: '600', color: '#000', marginVertical: 0},
  Font_California: {
    fontSize: 10,
    fontWeight: '500',
    color: '#000',
    paddingLeft: 10,
  },
  Font_14: {fontSize: 14, fontWeight: '500', color: '#000', marginVertical: 0},
  inputView: {
    height: 35,
    width: '30%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginRight: 10,
  },
  picker: {top: -5},
  CourseTopView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  Font_18: {fontSize: 18, fontWeight: '500', color: '#000'},
  ViewAll: {fontSize: 14, fontWeight: '500', color: '#2563EB'},
  UxStyle: {
    height: 130,
    width: '90%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#C7C7C7',
    padding: 7,
    marginBottom: 10,
  },
  UxText: {fontSize: 14, fontWeight: '500', color: '#000000'},
  California: {
    fontSize: 10,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 10,
  },
  ButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginLeft: 10,
  },
  ButtonView1: {justifyContent: 'flex-end', marginTop: 20, marginLeft: 10},
  ViewCertificat: {
    height: 30,
    width: '45%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  DownloadView: {
    height: 30,
    width: '45%',
    backgroundColor: '#013499',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioContainer: {
    alignSelf: 'flex-start',
    // justifyContent: 'center' // Ensures the RadioGroup stretches horizontally
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#3740ff',
    borderRadius: 5,
    backgroundColor: '#fff', // Background color of the radio button container
  },
  overlayContent: {flexDirection: 'row', height: 50, alignItems: 'center'},
  checkboxItem: {flexDirection: 'row', alignItems: 'center', height: 50},
  CloseImage_One: {height: 35, justifyContent: 'center', marginTop: 15},
  selectedValue: {
    fontSize: 14,
    color: '#374151',
  },
  label: {fontSize: 12, fontWeight: '500', color: '#374151'},

  container: {
    padding: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    width: '30%',
    borderColor: '#ccc',
    borderRadius: 5,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#000',
  },
  filterIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    position: 'absolute',
    right: 5,
    top: 5,
  },
  overlay: {
    width: '100%',
    height: '90%',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  clearAllText: {
    fontSize: 16,
    color: '#1A40A2',
  },
  selectedValuesContainer: {
    flexGrow: 0,
    maxHeight: 50,
    marginVertical: 10,
  },
  selectedValueChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedValueText: {
    color: '#000',
  },
  removeFilterText: {
    fontSize: 16,
    color: '#FBBF24',
    fontWeight: 'bold',
  },
  filterContent: {
    flex: 1,
    flexDirection: 'row',
  },
  tabContainer: {
    flex: 0.4,
    backgroundColor: '#F3F4F6',
  },
  tabItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activeTabItem: {
    backgroundColor: '#D5E6FB',
  },
  tabText: {
    fontSize: 14,
    color: '#000',
  },
  checkboxesContainer: {
    flex: 0.6,
    padding: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
  applyButton: {
    margin: 15,
  },
});
