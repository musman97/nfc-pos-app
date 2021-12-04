import 'react-native-gesture-handler';

import React, {FC} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {EmptyProps} from '~/types';
import {AuthContextProvider} from '~/context/AuthContext';
import RootNav from '~/navigation';

const App: FC<EmptyProps> = () => {
  return (
    <AuthContextProvider>
      <NavigationContainer>
        <RootNav />
      </NavigationContainer>
    </AuthContextProvider>
  );
};

export default App;
