import {
  ButtonTab,
  Fundamentals,
  MyCertification,
  ReusableFilters,
} from '../components/Controls';
import React, {Component, createRef} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';

import Drawer from '../components/Drawer';
import {HeaderNew} from '../components/Header';
import Microphone from '../components/Microphone';
import {MyStatusBar} from '../components/DarkTheme';
import {SearchNew} from '../components/Search';
import SearchResults from '../SearchResults';
import {createMessage} from '../../Utils/helper /searchMessage';
import {fetchData} from '../../Utils/APIs/getSearchCourses';

export default class CourseHome extends Component {
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
      searchText: props.route?.params?.searchText || 'show me all courses',
      initialSearchText: 'show me all courses',
      inputText: '',
      showInput: false,
      appliedFilters: {},
      filterText: '',
      shouldUpdateResults: true,
      CourseName: props.route?.params?.tabName || '',
      filters: [
        {
          label: 'Subject Area',
          checkboxes: [
            {
              id: 1,
              label: 'Business (2,375)',
              checked: false,
              field: 'Subject Area',
            },
            {
              id: 2,
              label: 'Computer Science (2,100)',
              checked: false,
              field: 'Subject Area',
            },
            {
              id: 3,
              label: 'Data Science (1,414)',
              checked: false,
              field: 'Subject Area',
            },
            {
              id: 4,
              label: 'Information Technology (1,140)',
              checked: false,
              field: 'Subject Area',
            },
          ],
        },
        {
          label: 'Course Provider',
          checkboxes: [
            {id: 1, label: 'NPTEL', checked: false, field: 'Course Provider'},
            {id: 2, label: 'TTM', checked: false, field: 'Course Provider'},
            {id: 3, label: 'Oxford', checked: false, field: 'Course Provider'},
            {id: 4, label: 'CIOT', checked: false, field: 'Course Provider'},
          ],
        },
        {
          label: 'Course Type',
          checkboxes: [
            {id: 1, label: 'Paid', checked: false, field: 'Course Type'},
            {id: 2, label: 'Free', checked: false, field: 'Course Type'},
          ],
        },
        {
          label: 'Course Level',
          checkboxes: [
            {id: 1, label: 'Beginner', checked: false, field: 'Course Level'},
            {
              id: 2,
              label: 'Intermediate',
              checked: false,
              field: 'Course Level',
            },
            {id: 3, label: 'Advanced', checked: false, field: 'Course Level'},
          ],
        },
        {
          label: 'Course Duration',
          checkboxes: [
            {
              id: 1,
              label: 'Short (< 4 weeks)',
              checked: false,
              field: 'Course Duration',
            },
            {
              id: 2,
              label: 'Medium (4-12 weeks)',
              checked: false,
              field: 'Course Duration',
            },
            {
              id: 3,
              label: 'Long (> 12 weeks)',
              checked: false,
              field: 'Course Duration',
            },
          ],
        },
      ],
    };
  }

  componentDidMount() {
    this.handleSearchNavigate(
      this.props.route?.params?.searchText ?? this.state.searchText,
    );
  }

  componentDidUpdate(prevProps) {
    const newSearchText = this.props.route?.params?.searchText;
    const newTabName = this.props.route?.params?.tabName;
    if (
      newSearchText &&
      newSearchText !== prevProps.route?.params?.searchText
    ) {
      this.setState({searchText: newSearchText}, () => {
        this.handleSearchNavigate(newSearchText);
      });
    }
    if (newTabName && newTabName !== prevProps.route?.params?.tabName) {
      this.setState({CourseName: newTabName});
    }
  }

  handleSearchNavigate = searchText => {
    this.setState(
      {
        filterText: searchText,
        searchText: searchText,
        shouldUpdateResults: true,
      },
      () => {
        const message = createMessage(searchText, this.state.appliedFilters);
        fetchData(searchText, this.props.navigation, message);
      },
    );
  };

  applyFilters = () => {
    const appliedFilters = {};
    this.state.filters.forEach(filterGroup => {
      const selectedFilters = filterGroup.checkboxes
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.label);
      if (selectedFilters.length > 0) {
        appliedFilters[filterGroup.label] = selectedFilters;
      }
    });

    this.setState(
      {
        appliedFilters: appliedFilters,
        shouldUpdateResults: true,
      },
      async () => {
        const updatedSearchText = await createMessage(
          this.state.initialSearchText,
          this.state.appliedFilters,
        );

        this.setState({searchText: updatedSearchText}, () => {
          fetchData(updatedSearchText, this.props.navigation);
        });
      },
    );
  };

  openDrawer = () => {
    if (this.drawerRef.current) {
      this.drawerRef.current.openDrawer();
    }
  };

  toggleInput = () => {
    this.setState(prevState => ({showInput: !prevState.showInput}));
  };

  handleMicResultChange = result => {
    this.setState(
      {
        searchText: result,
        filterText: result,
        CourseName: 'Explore Courses',
        shouldUpdateResults: true,
      },
      () => {
        this.handleSearchNavigate(result);
        this.props.navigation.navigate('CourseHome', {
          searchText: result,
          tabName: 'Explore Courses',
        });
      },
    );
  };

  handleResultChange = result => {
    this.setState({inputText: result}, () => {
      this.handleSearchNavigate(result);
    });
  };

  handleTabPress = tabName => {
    this.setState({CourseName: tabName});
    if (tabName === 'Explore Courses') {
      this.setState({
        searchText: this.state.initialSearchText,
        shouldUpdateResults: true,
      });
    }
  };

  render() {
    const {navigation} = this.props;
    const {
      searchText,
      appliedFilters,
      filterText,
      shouldUpdateResults,
      CourseName,
      filters,
    } = this.state;
    const isVideoSearch =
      searchText.toLowerCase().includes('video') ||
      searchText.toLowerCase().includes('videos');

    return (
      <Drawer ref={this.drawerRef} navigation={navigation}>
        <SafeAreaView style={styles.container}>
          <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
          <HeaderNew {...this.props} openDrawer={this.openDrawer} />
          <View style={styles.content}>
            <SearchNew
              {...this.props}
              searchText={searchText}
              handleSearchNavigate={this.handleSearchNavigate}
            />
            <ButtonTab
              {...this.props}
              data={this.state.data}
              tabName={CourseName}
              onSubmit={this.handleTabPress}
            />
            {!isVideoSearch && (
              <ReusableFilters
                {...this.props}
                filters={filters}
                applyFilters={this.applyFilters}
              />
            )}
            {(CourseName === '' || CourseName === 'Explore Courses') && (
              <SearchResults
                key={`${searchText}-${JSON.stringify(appliedFilters)}`}
                {...this.props}
                from={'courses'}
                searchText={searchText}
                appliedFilters={appliedFilters}
                filterText={filterText}
              />
            )}
            {CourseName === 'Home' && <Fundamentals {...this.props} />}
            {CourseName === 'My Certifications' && (
              <MyCertification {...this.props} />
            )}
            {CourseName === 'My Courses' && <PaymentView {...this.props} />}
          </View>
          <Microphone
            dontNavigate={false}
            style={styles.microphone}
            onPress={this.toggleInput}
            onResultChange={this.handleMicResultChange}
            props={{...this.props}}
          />
        </SafeAreaView>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  microphone: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});
