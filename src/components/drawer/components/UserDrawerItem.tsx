//src: @react-navigation/drawer/views/DrawerItem

import { PlatformPressable } from '@react-navigation/elements';
import { useTheme } from '@react-navigation/native';
import * as React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import { Typography, Colors, Bases } from '../../../styles';

type UserDrawerItemProps = {
    /**
     * Whether label font should scale to respect Text Size accessibility settings.
     */
    allowFontScaling?: boolean;
    /**
     * ID to locate this drawer item in tests.
     */
    testID?: string;
}

type InfoUserProps = {
    name: string,
    email: string,
    avatar?: string,
}
/**
 * A component used to show an action item with an icon and a label in a navigation drawer.
 */
export default function UserDrawerItem(props: UserDrawerItemProps) {
    const [ userInfo, setUserInfo] = React.useState<InfoUserProps | undefined>(undefined);
    const { colors } = useTheme();
    
    const avatarStored = require('../../../assets/images/avatar.jpg') 
    //this will use as default avatar, or in case user sync data, we will download their avatar
    //locally, and using this way to get image

    const {
        allowFontScaling,
        testID,
        ...rest
    } = props;

    const handlePress = () => {}

    React.useEffect(() => {
        const getInfoUser = async () => {
            //get info user, maybe from context or from async storage
            const infoUserGet : InfoUserProps = {
                name: 'Son Ngo',
                email: '<EMAIL>',
            };
            setUserInfo(infoUserGet);
        } 
        getInfoUser();
    }, []);

    return (
        <View
            collapsable={false}

            style={[styles.container]}
        >
            <PlatformPressable
                testID={testID}
                onPress={handlePress}
                // accessibilityLabel={accessibilityLabel}
                // accessibilityRole="button"
                // accessibilityState={{ selected: focused }}
                // pressColor={pressColor}
                // pressOpacity={pressOpacity}
                // href={href}
            >
                <View style={[ styles.wrapper ]}>
                    {userInfo && (
                        <>
                            <Image
                                style={[styles.avatar]}
                                resizeMode='cover'
                                source={ userInfo.avatar 
                                            ? { uri: userInfo.avatar} 
                                            : avatarStored }
                            />
                            <View style={[styles.label, { marginStart: 16 }]}>
                                <Text
                                    numberOfLines={1}
                                    allowFontScaling={allowFontScaling}
                                    style={[styles.labelText, { color: colors.text }, Typography.subheader.x50]}
                                >
                                    {userInfo.name}
                                </Text>
                            </View>
                        </>
                    )}
                    
                </View>
            </PlatformPressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 14,
        marginVertical: 4,
        overflow: 'hidden',
    },
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 5,
    },
    label: {
        marginEnd: 12,
        marginVertical: 4,
        flex: 1,
    },
    labelText: {
        lineHeight: 24,
        textAlignVertical: 'center',
    },
    avatar: {
        ...Bases.circle(40),
        backgroundColor: Colors.primary.yellow,
        overflow: 'hidden', 
    }
});