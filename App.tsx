import 'react-native-gesture-handler';
import React, { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { dayjsSetup } from './src/helpers/dayjs';

import AppNavigator from './src/navigation/AppNavigator';

import fonts from './src/assets/fonts/'
import {useTasksData} from "./src/controllers";
import {GestureHandlerRootView} from "react-native-gesture-handler";

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
            // TODO: show loading screen and announce error if needed
        }
    }, [fontsLoaded, fontError]);

    React.useEffect(() => {
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
        <GestureHandlerRootView>
            <AppNavigator onReady = {onLayoutRootView}/>
        </GestureHandlerRootView>
    );
}