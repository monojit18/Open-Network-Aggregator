import React, {Component, createRef} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';

import Drawer from '../components/Drawer';
import {HeaderNew} from '../components/Header';
import Microphone from '../components/Microphone';
import {MyStatusBar} from '../components/DarkTheme';
import {ReusableFilters} from '../components/Controls';
import {SearchNew} from '../components/Search';
import SearchResults from '../SearchResults';
import {createMessage} from '../../Utils/helper /searchMessage';
import {fetchData} from '../../Utils/APIs/getSearchCourses';

export default class JobOpportunityHome extends Component {
  constructor(props) {
    super(props);
    this.drawerRef = createRef();
    this.scrollViewRef = createRef();
    this.state = {
      data: [{id: 1, name: 'Home'}],
      searchText: props.route?.params?.searchText || 'engineering jobs',
      initialSearchText: 'engineering jobs',
      inputText: '',
      showInput: false,
      appliedFilters: {},
      filterText: '',
      shouldUpdateResults: true,
      isMicrophoneActive: false,
    };
  }

  componentDidMount() {
    this.handleSearchNavigate(this.state.searchText);
  }

  componentDidUpdate(prevProps) {
    const newSearchText = this.props.route?.params?.searchText;
    if (
      newSearchText &&
      newSearchText !== prevProps.route?.params?.searchText
    ) {
      this.setState({searchText: newSearchText}, () => {
        this.handleSearchNavigate(newSearchText);
      });
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

  applyFilters = filters => {
    const transformedFilters = this.transformFilters(filters);

    this.setState(
      {
        appliedFilters: transformedFilters,
        shouldUpdateResults: true,
      },
      async () => {
        const updatedSearchText = await createMessage(
          this.state.searchText || this.state.initialSearchText,
          this.state.appliedFilters,
        );

        this.setState({searchText: updatedSearchText}, () => {
          fetchData(updatedSearchText, this.props.navigation);
        });
      },
    );
  };

  transformFilters = filters => {
    const transformedFilters = {};
    filters.forEach(filter => {
      if (filter.field) {
        if (!transformedFilters[filter.field]) {
          transformedFilters[filter.field] = [];
        }
        transformedFilters[filter.field].push(filter.value);
      }
    });
    return transformedFilters;
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
        shouldUpdateResults: true,
        isMicrophoneActive: false,
      },
      () => {
        this.handleSearchNavigate(result);
      },
    );
  };

  handleMicrophoneToggle = isActive => {
    this.setState({isMicrophoneActive: isActive});
  };

  filters = [
    {
      label: 'Gender',
      checkboxes: [
        {id: 1, label: 'Male', value: 'male', field: 'Gender'},
        {id: 2, label: 'Female', value: 'female', field: 'Gender'},
      ],
    },
    {
      label: 'Provider',
      checkboxes: [
        {id: 1, label: 'ABC Tech', value: 'abc_tech', field: 'Provider'},
      ],
    },
    {
      label: 'Industry',
      checkboxes: [
        {
          id: 1,
          label: 'IT Services & Consulting',
          value: 'it_services_consulting',
          field: 'Industry',
        },
      ],
    },
    {
      label: 'Employment Type',
      checkboxes: [
        {
          id: 1,
          label: 'Full-time',
          value: 'full_time',
          field: 'Employment Type',
        },
        {
          id: 2,
          label: 'Part-time',
          value: 'part_time',
          field: 'Employment Type',
        },
      ],
    },
    {
      label: 'Location',
      checkboxes: [
        {id: 1, label: 'Bangalore', value: 'bangalore', field: 'Location'},
        {id: 2, label: 'Pune', value: 'pune', field: 'Location'},
      ],
    },
  ];

  render() {
    const {navigation} = this.props;
    const {
      searchText,
      appliedFilters,
      filterText,
      shouldUpdateResults,
      isMicrophoneActive,
    } = this.state;

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
              microphoneActive={isMicrophoneActive}
            />
            <ReusableFilters
              {...this.props}
              applyFilters={this.applyFilters}
              filters={this.filters}
            />
            <View style={styles.resultsContainer}>
              {shouldUpdateResults && (
                <SearchResults
                  key={`${searchText}-${JSON.stringify(appliedFilters)}`}
                  {...this.props}
                  from={'job'}
                  searchText={searchText}
                  appliedFilters={appliedFilters}
                  filterText={filterText}
                />
              )}
            </View>
            <Microphone
              dontNavigate={true}
              style={styles.microphone}
              onPress={this.toggleInput}
              onResultChange={this.handleMicResultChange}
              onMicrophoneToggle={this.handleMicrophoneToggle}
              props={{...this.props}}
            />
          </View>
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
  resultsContainer: {
    flex: 1,
  },
  microphone: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});
