//src: @react-navigation/drawer/views/DrawerItemList
import * as React from 'react';
import {
    CommonActions,
    DrawerActions,
//    useLinkBuilder,
} from '@react-navigation/native';
import {
    type DrawerContentComponentProps,
} from '@react-navigation/drawer';

import { type RouteName } from '../../../screens';

//components
import DrawerItem from './DrawerItem';

type DrawerItemListProps = DrawerContentComponentProps & { forRoutes?: RouteName[] };

/**
 * Component that renders the navigation list in the drawer.
 */
export default function DrawerItemList({ state, navigation, descriptors, forRoutes }: DrawerItemListProps) {
    // const { buildHref } = useLinkBuilder();

    const focusedRoute = state.routes[state.index];
    return state.routes.map((route, i) => {
        if (forRoutes && !forRoutes.includes(route.name as RouteName)) {
            return null;
        }

        const focused = i === state.index;

        const onPress = () => {
            const event = navigation.emit({
                type: 'drawerItemPress',
                target: route.key,
                canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
            navigation.dispatch({
                ...(focused
                ? DrawerActions.closeDrawer()
                : CommonActions.navigate(route)),
                target: state.key,
            });
            }
        };

        const {
            title,
            drawerIcon,
            drawerAllowFontScaling
        } = descriptors[route.key].options;

        return (
            <DrawerItem
                key={route.key}
                label={ title || route.name }
                icon={drawerIcon}
                focused={focused}
                allowFontScaling={drawerAllowFontScaling}
                onPress={onPress}
            />
        );
    }) as React.ReactNode as React.ReactElement;
}