import React from 'react';
import { useColorScheme } from 'react-native';

//navigation
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from './DrawerNavigation';

//themes
import { DarkTheme, LightTheme } from '../styles/colors';

const AppNavigator : React.FC = () => {
    const scheme = useColorScheme();

    return (
        <NavigationContainer theme={ scheme === 'dark' ? DarkTheme : LightTheme}>
            <DrawerNavigation />
        </NavigationContainer>
    )
}

export default AppNavigator;