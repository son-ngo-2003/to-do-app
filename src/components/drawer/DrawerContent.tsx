import { Text, View, StyleSheet } from 'react-native';
import { Bases } from '../../styles';
import { useTheme } from '@react-navigation/native';

import {
    DrawerContentScrollView,
    type DrawerContentComponentProps,
} from '@react-navigation/drawer';

import {DrawerItemList, UserDrawerItem} from './components/';

function DrawerContent(props: DrawerContentComponentProps) {
    const { colors } = useTheme();
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
        ...Bases.centerSelf.horizontal,
    }
});