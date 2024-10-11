import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
/* eslint-disable prettier/prettier */
import React, {useEffect} from 'react';

import AgricultureScreen from './Screens/AgricultureScreen';
import CourseDetail from './Screens/Course/CourseDetail';
// Course Home
import CourseHome from './Screens/Course/CourseHome';
import DrawerContent from './Screens/DrawerScreens/DrawerContent';
import FlashScreen from './Screens/components/FlashScreen';
import FundingSupportHome from './Screens/FundingSupport/FundingSupportHome';
import HomeScreen from './Screens/Home/HomeScreen';
import JobOpportunityHome from './Screens/JobOpportunity/JobOpportunityHome';
import LoginScreen from './Screens/Home/LoginScreen';
import OnboardingScreen from './Screens/Home/OnboardingScreen';
import OtpScreen from './Screens/Home/OtpScreen';
import PaymentDetails from './Screens/Course/PaymentDetails';
import RetailDomain from './Screens/RetailDomain';
import {SearchCourseDetail} from './Screens/components/SearchCourse';
import {SearchPaymentDetail} from './Screens/components/SearchCourse';
import SearchResults from './Screens/SearchResults';
import ThankYou from './Screens/Course/ThankYou';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import landingPage from './Screens/landingPage';
import {useColorScheme} from 'react-native';

// import Payment from './Screens/Course/Payment';
// import TestScreen from './TestScreen';
// import OnboardingSplash from './screens/OnboardingScreens/OnboardingSplash';

const Stack = createNativeStackNavigator();

const LightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: 'white',
    text: 'black',
  },
};

const DarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: 'black',
    text: 'white',
  },
};

export default function Navigation() {
  const scheme = useColorScheme();
  // useEffect(() => {
  //   const originalConsoleError = console.error;

  //   console.error = (...args) => {
  //     if (typeof args[0] === 'string' && /defaultProps/.test(args[0])) {
  //       return;
  //     }

  //     originalConsoleError(...args);
  //   };

  //   return () => {
  //     console.error = originalConsoleError;
  //   };
  // }, []);
  return (
    <NavigationContainer theme={LightTheme}>
      <Stack.Navigator initialRouteName="FlashScreen">
        <Stack.Screen
          name="FlashScreen"
          component={FlashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OtpScreen"
          component={OtpScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OnboardingScreen"
          component={OnboardingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DrawerContent"
          component={DrawerContent}
          options={{headerShown: false}}
        />
        {/* Course */}
        <Stack.Screen
          name="CourseHome"
          component={CourseHome}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="FundingSupportHome"
          component={FundingSupportHome}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="JobOpportunitiesHome"
          component={JobOpportunityHome}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SearchResults"
          component={SearchResults}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SearchCourseDetail"
          component={SearchCourseDetail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SearchPaymentDetail"
          component={SearchPaymentDetail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AgricultureScreen"
          component={AgricultureScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="RetailDomain"
          component={RetailDomain}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CourseDetail"
          component={CourseDetail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PaymentDetails"
          component={PaymentDetails}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ThankYou"
          component={ThankYou}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="LandingPage"
          component={landingPage}
          options={{headerShown: false}}
        />
        {/* <Stack.Screen name='TestScreen' component={TestScreen} options={{ headerShown: false }} /> */}
        {/* <Stack.Screen name='OnboardingSplash' component={OnboardingSplash} options={{ headerShown: false }} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
