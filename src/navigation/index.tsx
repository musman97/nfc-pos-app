import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {useAuthContext} from '~/context/AuthContext';
import {Home, Login, Splash} from '~/screens';
import {RootStackParamList} from '~/types';
import {stackScreenOptions} from './config';
import {routeNames} from './routeNames';

const RootStack = createStackNavigator<RootStackParamList>();

const RootNav = () => {
  const {isLoading, isLoggedIn} = useAuthContext();

  const renderNav = () => {
    if (isLoading) {
      return (
        <>
          <RootStack.Screen name={routeNames.Splash} component={Splash} />
        </>
      );
    } else if (isLoggedIn) {
      return (
        <>
          <RootStack.Screen name={routeNames.Home} component={Home} />
        </>
      );
    } else {
      return (
        <>
          <RootStack.Screen name={routeNames.Login} component={Login} />
        </>
      );
    }
  };

  return (
    <RootStack.Navigator screenOptions={stackScreenOptions}>
      {renderNav()}
    </RootStack.Navigator>
  );
};

export default RootNav;
