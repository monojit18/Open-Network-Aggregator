import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
} from 'react-native';
import MyStyle from '../../style';
import CheckBox from 'react-native-check-box';

const MatrimonyFilter = ({ navigation }) => {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    const onTabChange = (tabIndex) => {
        setActiveTabIndex(tabIndex);
    };

    return (
        <SafeAreaView style={MyStyle.BodyWhite}>
            <View style={[MyStyle.TopView, { paddingHorizontal: 10, justifyContent: 'center' }]}>
                <TouchableOpacity onPress={() => navigation.navigate('Matrimony_View')} style={{ position: 'absolute', left: 10 }}>
                    <Image source={require('../../../img/left-arrow.png')} style={MyStyle.Image19} />
                </TouchableOpacity>
                <Text style={[MyStyle.Text_marginHorizontal, MyStyle.Text16_Regular_One, { textAlign: 'center' }]}>Filter</Text>
            </View>

            <View style={[MyStyle.Row, { flex: 1 }]}>
                <View style={{ flex: 1, backgroundColor: '#6767672E' }}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => onTabChange(index)}
                            style={[MyStyle.CloseImage_One, activeTabIndex === index && { backgroundColor: '#fff' }]}
                        >
                            <Text>
                                {index === 0 && 'Age'}
                                {index === 1 && 'Denomination'}
                                {index === 2 && 'State'}
                                {index === 3 && 'District'}
                                {index === 4 && 'Marital Status'}
                                {index === 5 && 'Gender'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flex: 1 }}>
                    {activeTabIndex === 0 && (
                        <View>
                            <CheckBoxItem label="Select A" />
                            <CheckBoxItem label="Select A" />
                            <CheckBoxItem label="Select A" />
                            <CheckBoxItem label="Select A" />
                        </View>
                    )}
                    {activeTabIndex === 1 && (
                        <View>
                            <CheckBoxItem label="Select B" />
                            <CheckBoxItem label="Select B" />
                            <CheckBoxItem label="Select B" />
                            <CheckBoxItem label="Select B" />
                        </View>
                    )}
                    {activeTabIndex === 2 && (
                        <View>
                            <CheckBoxItem label="Select C" />
                            <CheckBoxItem label="Select C" />
                            <CheckBoxItem label="Select C" />
                            <CheckBoxItem label="Select C" />
                        </View>
                    )}
                    {activeTabIndex === 3 && (
                        <View>
                            <CheckBoxItem label="Select D" />
                            <CheckBoxItem label="Select D" />
                            <CheckBoxItem label="Select D" />
                            <CheckBoxItem label="Select D" />
                        </View>
                    )}
                    {activeTabIndex === 4 && (
                        <View>
                            <CheckBoxItem label="Select E" />
                            <CheckBoxItem label="Select E" />
                            <CheckBoxItem label="Select E" />
                            <CheckBoxItem label="Select E" />
                        </View>
                    )}
                    {activeTabIndex === 5 && (
                        <View>
                            <CheckBoxItem label="Select F" />
                            <CheckBoxItem label="Select F" />
                            <CheckBoxItem label="Select F" />
                            <CheckBoxItem label="Select F" />
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const CheckBoxItem = ({ label }) => {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <View style={[MyStyle.Row, MyStyle.SpaceUpDown]}>
            <CheckBox onClick={() => setIsChecked(!isChecked)} isChecked={isChecked} />
            <Text style={[MyStyle.Text14_Light, MyStyle.Space_Horizontal]}>{label}</Text>
        </View>
    );
};

export default MatrimonyFilter;

const styles = StyleSheet.create({
    // Add any additional styles here if needed
});
