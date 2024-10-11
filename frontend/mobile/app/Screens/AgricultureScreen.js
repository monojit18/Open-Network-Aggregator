import React from 'react';
import { StyleSheet, View, Text, Image, FlatList, ScrollView, SafeAreaView } from 'react-native';
import { MyStatusBar } from './components/DarkTheme';


const agricultureCrops = [
    { name: 'ARHAR DAL SPLIT', image: require('../assets/image/ARHARDAL.png') },
    { name: 'CHANA DAL SPLIT', image: require('../assets/image/CHANADAL.png') },
    { name: 'KALA CHANA', image: require('../assets/image/KALACHANA.png') },
    { name: 'LOBIA', image: require('../assets/image/Lobia.png') },
    { name: 'MASOOR(WHOLE)', image: require('../assets/image/Masoor.png') },
    { name: 'BARLEY', image: require('../assets/image/Barley.png') },
];

const horticultureCrops = [

    { name: 'ANWALA', image: require('../assets/image/Anwala.png') },
    { name: 'APPLE', image: require('../assets/image/APPLETREE.png') },
    { name: 'APRIKOT', image: require('../assets/image/Apricotseeds.png') },
    { name: 'CUSTARD APPLE', image: require('../assets/image/CustardApple.png') },
    { name: 'OKRA/BHINDI', image: require('../assets/image/okra.png') },
    { name: 'BUTTON MUSHROOM', image: require('../assets/image/ButtonMushroom.png') },
];

const CropCard = ({ item }) => (
    <View style={styles.card}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.cardText}>{item.name}</Text>
    </View>
);

const AgricultureScreen = () => {
    return (
        <SafeAreaView>
            <MyStatusBar backgroundColor="#01308f" barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ flexDirection: "row", justifyContent:"space-between"}}>
                    <View style={{ justifyContent: 'flex-end', alignItems: 'flex-start', marginVertical: 20 }}>
                        <Text style={{ fontSize: 30, color: '#013499', fontWeight: '600', lineHeight: 36 }}>“Agriculture”</Text>
                        <Image source={require('../assets/image/LockBottomBlue.png')} style={{ height: 10, width: 90, alignSelf: 'flex-end',  }} />
                    </View>
                    <View>
                        <Image source={require('../assets/image/OBJECTS.png')} style={{ marginRight: 50, height: 137, width: 100 }} />
                    </View>
                </View>
                <Text style={styles.header}>AGRICULTURE CROPS</Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <View style={styles.grid}>
                        {agricultureCrops.map((item, index) => (
                            <CropCard key={index} item={item} />
                        ))}
                    </View>
                </ScrollView>

                <Text style={styles.header}>HORTICULTURE CROPS SEEDS & SIBLINGS</Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    <View style={styles.grid}>
                        {horticultureCrops.map((item, index) => (
                            <CropCard key={index} item={item} />
                        ))}
                    </View>
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {

    },

    header: {
        paddingHorizontal: 10,
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        color: "#898A8D",
        fontFamily: 'inter',
        fontSize: 12,
        textAlign: "left",




    },
    flatList: {
        justifyContent: 'space-between',
    },
    card: {
        paddingHorizontal: 10,
        flex: 1,
        margin: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        alignItems: 'center',
        padding: 10,
        overflow: 'hidden',
    },
    image: {
        width: 76,
        height: 76,
        borderRadius: 35,
    },
    cardText: {
        textAlign: 'center',
        marginTop: 5,
        fontSize: 10,
        fontWeight: "300",
        color: "#5F6067",
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});

export default AgricultureScreen;
