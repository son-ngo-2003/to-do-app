import React from 'react';
import { useColorScheme } from 'react-native';

//navigation
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigation from './DrawerNavigation';

//themes
import { DarkTheme, LightTheme } from '../styles/colors';
import {AlertProvider} from "../hooks";
import {DataModalProvider, useDataModal} from "../contexts/DataModalContext";
import {FloatingActionButton} from "../components";
import {Layouts} from "../styles";
import {eventEmitter, EventNames} from "../utils/eventUtil";

type AppNavigatorProps = {
    onReady: () => void,
}

const FAB : React.FC = () => {
    const { showModal, setDataModal } = useDataModal({});

    const onPressAddNote = React.useCallback(() => {
        setDataModal('note', undefined, 'add');
        showModal('note');
    }, [setDataModal, showModal]);

    const onPressAddTask = React.useCallback(() => {
        setDataModal('task', undefined, 'add');
        showModal('task');
    }, [setDataModal, showModal]);

    return (
        <FloatingActionButton
            initialPosition={{x: Layouts.screen.width - 50, y: Layouts.screen.height - 50}}
            subButtons={[
              {icon: {name: 'sticker-text-outline', library: 'MaterialCommunityIcons'}, onPress: onPressAddNote},
              {icon: {name: 'checkbox-multiple-marked-outline', library: 'MaterialCommunityIcons'}, onPress: onPressAddTask},
            ]}
            onPress={() => {
                eventEmitter.emit(EventNames.OpenFloatingActionButton);
            }}
        />
    )
}

const AppNavigator : React.FC<AppNavigatorProps> = ( {onReady} ) => {
    const scheme = useColorScheme();

    return (
        <NavigationContainer theme={ scheme === 'dark' ? DarkTheme : LightTheme}
                             onReady = {onReady}>
            <AlertProvider>
                <DataModalProvider>
                    <FAB />
                    <DrawerNavigation />
                </DataModalProvider>
            </AlertProvider>
        </NavigationContainer>
    )
}

export default AppNavigator;