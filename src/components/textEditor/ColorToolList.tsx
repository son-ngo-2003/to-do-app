import React from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import {   
    type EditorBridge,
} from '@10play/tentap-editor';

//components
import { ListModal } from '../atomic';
import { ListModalDataType } from '../atomic';
import { Colors, Outlines } from '../../styles';
import { Primary } from '../../styles/colors';

type ColorToolListProps = {
    editor: EditorBridge,
    style: ViewStyle,
    onPressOverlay: () => void,
}

const ColorToolList : React.FC<ColorToolListProps> = ({
    editor,
    style,
    onPressOverlay,
}) => {

    const ColorBox : React.FC<{color: string}> = ({color}) => {
        return (
            <View style={[styles.colorBox, {backgroundColor: color}]}>
            </View>
        )
    }

    const dataList : ListModalDataType[] =
        Colors.listColor.map((color : Primary) => (
            {
                label: color,
                icon: <ColorBox color={Colors.primary[color]}/>,
                onPress: () => {editor.setColor(Colors.primary[color])},
            })
    );

    return (
        <>
            <ListModal
                dataList={dataList}
                containerStyle={style}
                typeOverlay='transparent'
                onPressOverlay={onPressOverlay}
            />
        </>
    )
}

export default ColorToolList;

const styles = StyleSheet.create({
    colorBox: {
        width: 20,
        height: 20,
        borderRadius: Outlines.borderRadius.small,
    }
});