import 'react-native-gesture-handler';
import { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import AppNavigator from './src/navigation/AppNavigator';

import fonts from './src/assets/fonts/'

export default function App() {
    const [fontsLoaded, fontError] = useFonts(fonts);
    
    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);
    
    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <AppNavigator onReady = {onLayoutRootView}/>
    );
}