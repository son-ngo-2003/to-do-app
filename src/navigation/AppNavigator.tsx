import React from 'react';
import { useColorScheme } from 'react-native';

//navigation
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from './DrawerNavigation';

//themes
import { DarkTheme, LightTheme } from '../styles/colors';

type AppNavigatorProps = {
    onReady: () => void,
}

const AppNavigator : React.FC<AppNavigatorProps> = ( {onReady} ) => {
    const scheme = useColorScheme();

    return (
        <NavigationContainer theme={ scheme === 'dark' ? DarkTheme : LightTheme}
                             onReady = {onReady}>
            <DrawerNavigation />
        </NavigationContainer>
    )
}

export default AppNavigator;