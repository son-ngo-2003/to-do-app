
import React from 'react';
import {SafeAreaView, View, TouchableOpacity, StyleSheet} from 'react-native';
import { DrawerHeaderProps } from "@react-navigation/drawer";
import { DrawerActions, useTheme } from '@react-navigation/native';

import { Icon } from '../../components';

const AppHeader: React.FC<DrawerHeaderProps> = ({ navigation }) => {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <Icon name="menu" size={35} color= {colors.text} library="Ionicons"/>
            </TouchableOpacity>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={() => navigation.navigate("Search")}>
                    <Icon name="search" size={30} color= {colors.text} library="Feather" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log('show noti')}>
                    <Icon name="notifications-outline" size={30} color= {colors.text} library="Ionicons"/>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default AppHeader;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 17,
    },

    buttonsContainer: {
        flexDirection: 'row',
        gap: 20,
    }
})