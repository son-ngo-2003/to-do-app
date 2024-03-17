import { Text } from 'react-native';

import {
    DrawerContentScrollView,
    type DrawerContentComponentProps,
} from '@react-navigation/drawer';

import DrawerItemList from './components/DrawerItemList';

function DrawerContent(props: DrawerContentComponentProps) {
    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
}

export default DrawerContent;