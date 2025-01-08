import {StyleSheet, View} from 'react-native';
import {DrawerActions, useTheme} from '@react-navigation/native';

import {type DrawerContentComponentProps, DrawerContentScrollView,} from '@react-navigation/drawer';

import {DrawerItemList, UserDrawerItem} from './components/';
import React from "react";
import {eventEmitter, EventNames} from "../../utils/eventUtil";

function DrawerContent(props: DrawerContentComponentProps) {
    const { colors } = useTheme();

    React.useEffect(() => {
        const listener = eventEmitter.on(EventNames.OpenFloatingActionButton, () => {
            props.navigation.dispatch(DrawerActions.closeDrawer());
        })

        return () => {
            eventEmitter.remove(EventNames.OpenFloatingActionButton, listener);
        }
    }, []);

    return (
        <DrawerContentScrollView {...props}>
            <UserDrawerItem/>
            <View style={[ styles.separator, { backgroundColor: colors.border} ]}></View>
            <DrawerItemList {...props} 
                            forRoutes={['Home', 'Calendar', 'Tasks', 'Notes', 'Labels']}/>
            <View style={[ styles.separator, { backgroundColor: colors.border} ]}></View>
            <DrawerItemList {...props} 
                            forRoutes={['History', 'Trash']}/>
        </DrawerContentScrollView>
    );
}

export default DrawerContent;

const styles = StyleSheet.create({
    separator: {
        marginVertical: 10,
        height: 1,
        width: '80%',
        alignSelf: 'center',
    }
});