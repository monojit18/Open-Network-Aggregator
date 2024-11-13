import {
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo} from 'react';

const CourseAndVideoRenderer = React.memo(({data, navigation}) => {
  const openYouTubeVideo = item => {
    if (item.videoId) {
      // Open URL using videoId
      Linking.openURL(`https://www.youtube.com/watch?v=${item.videoId}`);
    } else if (item.id) {
      // Open URL using id
      Linking.openURL(`${item.embedUrl}`);
    }
  };

  const replaceNewlinesWithSpaces = long_desc => {
    if (long_desc !== null && long_desc !== undefined) {
      return long_desc.replace(/(\r\n|\n|\r)/g, ' ');
    }
    return null;
  };

  const uniqueVideos = useMemo(() => {
    if (!data?.provider?.videos) return [];

    const uniqueMap = new Map();
    data.provider.videos.forEach(video => {
      if (!uniqueMap.has(video.videoId || video.id)) {
        uniqueMap.set(video.videoId || video.id, video);
      }
    });

    return Array.from(uniqueMap.values());
  }, [data?.provider?.videos]);

  const renderVideoItem = ({item}) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => openYouTubeVideo(item)}>
      <Image
        source={{uri: item?.thumbnails?.medium?.url || item?.preview_url}}
        style={styles.videoThumbnail}
      />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2} ellipsizeMode="tail">
          {item.title || item.short_desc}
        </Text>
        <Text style={styles.channelTitle}>
          {replaceNewlinesWithSpaces(item.long_desc)}
        </Text>
        <Text style={styles.publishDate}>
          {new Date().toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Videos</Text>
      <FlatList
        data={uniqueVideos}
        renderItem={renderVideoItem}
        keyExtractor={item => item.videoId || item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  videoItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 8,
    elevation: 2,
  },
  videoThumbnail: {
    width: 120,
    height: 90,
    borderRadius: 4,
  },
  videoInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  channelTitle: {
    fontSize: 12,
    color: '#666',
  },
  publishDate: {
    fontSize: 10,
    color: '#999',
  },
});

export default CourseAndVideoRenderer;
