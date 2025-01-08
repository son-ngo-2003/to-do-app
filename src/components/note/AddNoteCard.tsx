import * as React from 'react';
import { StyleSheet, ViewStyle, TouchableOpacity} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Icon } from '../atomic';
import {Outlines, Colors} from '../../styles';
import {CARD_DIMENSIONS, LABEL_HEIGHT} from "./NoteCard";

type AddNoteCardProps = {
    orientation: 'landscape' | 'portrait',
    onPress?: () => void,
    heightSameAsCardWithLabel?: boolean,
    style?: ViewStyle,
}

const AddNoteCard: React.FC<AddNoteCardProps> = ({
    orientation,
    onPress,
    heightSameAsCardWithLabel = false,
    style,
}) => {
    const { colors } = useTheme();
    const dimensions = React.useMemo(() => {
        let dim = {...CARD_DIMENSIONS[orientation]};
        heightSameAsCardWithLabel && (dim.height += LABEL_HEIGHT);
        return dim;
    }, [orientation, heightSameAsCardWithLabel]);

    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, {borderColor: colors.border}, dimensions, style]}
        >
            <Icon name={'plus'} size={35} color={ colors.border } library={'FontAwesome6'}/>
        </TouchableOpacity>
    )
}

export default AddNoteCard;

const styles = StyleSheet.create({
    container: {
        borderRadius: Outlines.borderRadius.large,
        ...Outlines.shadow.base,
        borderWidth: Outlines.borderWidth.thick,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }
});