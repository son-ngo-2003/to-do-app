import React from 'react';
import { useColorScheme } from 'react-native';

//navigation
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from './DrawerNavigation';

//themes
import { DarkTheme, LightTheme } from '../styles/colors';
import {AlertProvider} from "../hooks/uiHooks/useAlert";

type AppNavigatorProps = {
    onReady: () => void,
}

const AppNavigator : React.FC<AppNavigatorProps> = ( {onReady} ) => {
    const scheme = useColorScheme();
    return (
        <NavigationContainer theme={ scheme === 'dark' ? DarkTheme : LightTheme}
                             onReady = {onReady}>
            <AlertProvider>
                <DrawerNavigation />
            </AlertProvider>
        </NavigationContainer>
    )
}

export default AppNavigator;