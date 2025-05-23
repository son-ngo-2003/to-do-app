import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, ScrollView, Text, Modal} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Bases, Layouts, Outlines } from '../../styles';

import Overlay from './Overlay';
import BaseModal from "./BaseModal";

export type ListModalDataType = {
    label: string,
    icon?: React.ReactNode,
    showIfFocused?: boolean,
    onPress?: () => void,
} | ((index: number) => React.ReactNode);

type ListModalProps = {
    dataList: ListModalDataType[];
    currentIndex?: number,
    onPressOverlay: ()=>void,
    onPressItem?: (index: number) => void //if data doesn't have onPress then call this
    visible?: boolean,

    typeOverlay?: "transparent" | "lowOpacity" | "highOpacity",
    headerComponent?: () => React.ReactNode,
    containerStyle?: ViewStyle,
    listContainerStyle?: ViewStyle,
    itemStyle?: ViewStyle,

    onModalHide?: () => void,
    onModalWillHide?: () => void,
    onModalShow?: () => void,
    onModalWillShow?: () => void,
}

const ListModal : React.FC<ListModalProps> = ({
    dataList,
    currentIndex = 0,
    onPressItem = () => {},
    onPressOverlay,
    visible = true,

    headerComponent,
    containerStyle,
    listContainerStyle,
    itemStyle,
    typeOverlay = "transparent",

    onModalHide,
    onModalWillHide,
    onModalShow,
    onModalWillShow,
}) => {
    const { colors } = useTheme();

    return (
        <BaseModal isVisible={visible} hasBackdrop={true} avoidKeyboard={true}
                   animationIn={'fadeInRight'} animationInTiming={500} animationOut={'fadeOutRight'} animationOutTiming={300}
                   onModalHide={onModalHide} onModalWillHide={onModalWillHide} onModalShow={onModalShow} onModalWillShow={onModalWillShow}

                   customBackdrop={<Overlay onPress={onPressOverlay} background={typeOverlay}/>}
        >

            <View style = {[styles.listContainer,
                            {backgroundColor: colors.card, borderColor: colors.border}, 
                            containerStyle
            ]}>
                {headerComponent && headerComponent()}
                <ScrollView style={[listContainerStyle]}>
                    {dataList.map((data : ListModalDataType, index: number) => {
                        return (
                            typeof data !== 'function'
                            ?
                                <Pressable key={index} 
                                        style={[styles.itemItem, itemStyle,
                                                data.showIfFocused && currentIndex===index && {backgroundColor: colors.border},
                                                //data.icon ? { justifyContent: 'space-between'} : {justifyContent: 'center'}
                                            ]}
                                        onPress={() => {data.onPress 
                                                            ? data.onPress()
                                                            : onPressItem(index);
                                                        onPressOverlay();
                                                }}>
                                    {data.icon}
                                    <Text style={[{color: colors.text}, styles.label ]}>{data.label}</Text>
                                </Pressable>
                            : 
                                data(index)
                        );
                    })}
                </ScrollView>
            </View>
        </BaseModal>
    );
}

export default ListModal;

const styles = StyleSheet.create({
    modal: {
        ...Bases.centerItem.all,
        ...Layouts.screen,
    },
    listContainer: {
        borderWidth: Outlines.borderWidth.thin,
        borderRadius: Outlines.borderRadius.base,
        paddingHorizontal: 5,
        paddingVertical: 5,
        overflow: 'hidden',
        position: 'absolute',
        transform: [{translateX: 0}, {translateY: 0}],
    },
    itemItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 5,
        gap: 10,
        borderRadius: Outlines.borderRadius.base,
        overflow: 'hidden',
    },
    label: {
        textAlign: 'center',
        textTransform: 'capitalize',
    }
});