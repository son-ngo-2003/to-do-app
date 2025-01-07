import 'react-native-gesture-handler';
import React, { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { dayjsSetup } from './src/helpers/dayjs';

import AppNavigator from './src/navigation/AppNavigator';

import fonts from './src/assets/fonts/'
import {useTasksData} from "./src/controllers";

export default function App() {
    dayjsSetup();
    const [fontsLoaded, fontError] = useFonts(fonts);
    const { getRepeatTasks, getTaskInstances, deleteForceTaskInstance, getTaskInstancesOverdue, generateTaskInstance } = useTasksData(false);
    
    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    React.useEffect(() => {
        if (!fontsLoaded && !fontError) {
            throw new Error('Fonts are not loaded'); //TODO: handle this error
        }

        // Update instances of repeat tasks if needed
        const updateRepeatTasksInstances = async () => {
            //TODO: check if working
            try {
                const repeatTasks = await getRepeatTasks();
                if (!repeatTasks) return;

                for (const task of repeatTasks) {
                    const instances = await getTaskInstancesOverdue(task);
                    if (!instances) continue;

                    for (const instance of instances) {
                        await deleteForceTaskInstance(instance);
                    }

                    const instancesLeft = await getTaskInstances(task);
                    if (!instancesLeft || instancesLeft.length === 0) { //TODO: may be should generate earlier, not wait for all instances to be deleted
                        await generateTaskInstance(task);
                    }
                }
            } catch (e) {
                console.error("App.tsx: ", e);
            }
        }

        updateRepeatTasksInstances();

    }, []);
    


    return (
        <AppNavigator onReady = {onLayoutRootView}/>
    );
}