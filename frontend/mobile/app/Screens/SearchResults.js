import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import CourseAndVideoRenderer from './components/CourseAndVideoRenderer';
import LoadingScreen from './components/LoadingScreen';
import {SearchCourse} from './components/SearchCourse';
import {createMessage} from '../Utils/helper /searchMessage';
import eventEmitter from '../Utils/eventEmitter';
import {fetchData} from '../Utils/APIs/getSearchCourses';

const SearchResults = props => {
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadData = useCallback(
    async (isRefresh = false) => {
      const {searchText, navigation, appliedFilters} = props;
      const message = await createMessage(searchText, appliedFilters);
      if (!isRefresh) {
        setIsLoading(true);
      }
      setData([]);
      setHasError(false);
      fetchData(searchText, navigation, message);
    },
    [props.searchText, props.appliedFilters, props.navigation],
  );

  const getUniqueId = item => {
    return item.id || item.descriptor?.name || JSON.stringify(item);
  };

  useEffect(() => {
    const handleNewData = newData => {
      setData(prevData => {
        let updatedData;
        if (prevData.length === 0) {
          // If it's the first set of data, use it as is
          updatedData = newData;
        } else {
          const existingProviders = prevData[0]?.catalog?.providers || [];
          const newProviders = newData?.catalog?.providers || [];

          const uniqueProvidersMap = new Map();

          existingProviders.forEach(provider => {
            uniqueProvidersMap.set(getUniqueId(provider), provider);
          });

          newProviders.forEach(provider => {
            uniqueProvidersMap.set(getUniqueId(provider), provider);
          });

          updatedData = {
            ...newData,
            catalog: {
              ...newData.catalog,
              providers: Array.from(uniqueProvidersMap.values()),
            },
          };
        }

        return [updatedData];
      });

      setIsLoading(false);
      setIsRefreshing(false);
    };

    const handleError = error => {
      setErrors(prevErrors => [...prevErrors, error]);
      setIsLoading(false);
      setIsRefreshing(false);
      if (error.status !== 200) {
        setHasError(true);
      }
    };

    eventEmitter.on('newData', handleNewData);
    eventEmitter.on('error', handleError);

    loadData();

    return () => {
      eventEmitter.off('newData', handleNewData);
      eventEmitter.off('error', handleError);
    };
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData(true);
  }, [loadData]);

  const filteredData = useMemo(() => {
    if (!props.filterText) return data || [];

    return (data || [])
      .map(course => ({
        ...course,
        catalog: {
          ...course?.catalog,
          providers: (course?.catalog?.providers || [])
            .map(provider => ({
              ...provider,
              items: (provider?.items || []).filter(item =>
                (item?.descriptor?.name || '')
                  .toLowerCase()
                  .includes((props.filterText || '').toLowerCase()),
              ),
            }))
            .filter(provider => (provider?.items || []).length > 0),
        },
      }))
      .filter(course => (course?.catalog?.providers || []).length > 0);
  }, [data, props.filterText]);

  const renderItem = useCallback(
    ({item}) => {
      if (item?.network?.name === 'VIDEO') {
        return (
          <CourseAndVideoRenderer data={item} navigation={props.navigation} />
        );
      } else {
        return <SearchCourse course={item} {...props} />;
      }
    },
    [props],
  );

  const keyExtractor = useCallback((item, index) => {
    return item && item.id ? item.id.toString() : index.toString();
  }, []);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 100,
      offset: 100 * index,
      index,
    }),
    [],
  );

  const ListEmptyComponent = useCallback(() => {
    if (hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Something went wrong, please try again
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.noResultsContainer}>
        {/* <Text style={styles.noResultsText}>No match found</Text> */}
      </View>
    );
  }, [hasError, onRefresh]);

  if (isLoading && !isRefreshing) {
    return (
      <View style={{marginTop: 100}}>
        <LoadingScreen />
      </View>
    );
  }

  return (
    <FlatList
      data={data ? data : filteredData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      showsVerticalScrollIndicator={false}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      contentContainerStyle={styles.listContainer}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={21}
      initialNumToRender={10}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={<View style={styles.listFooter} />}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  listFooter: {
    height: 80,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default React.memo(SearchResults);
