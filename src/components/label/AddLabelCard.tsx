import * as React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Bases, Outlines } from '../../styles';

//Components
import { Icon } from '../atomic';
import {LABEL_CARD_HEIGHT} from "./LabelCard";

type AddLabelCardProps = {
    onPress?: () => void,
    type?: 'small' | 'medium',
}

const HEIGHT = {
    small: 40,
    medium: LABEL_CARD_HEIGHT,
}

const AddLabelCard: React.FC<AddLabelCardProps> = ({
    onPress,
    type = 'small',
}) => {
    const { colors } = useTheme();

    return (
        <Pressable style={[styles.container, {backgroundColor: colors.border, height: HEIGHT[type]}]}
                    onPress={onPress}>
            <Icon name="plus" size={HEIGHT[type] * 0.5} color={colors.text} library='Octicons'/>
        </Pressable>
    )
}
export default AddLabelCard;

const styles = StyleSheet.create({
    container: {
        ...Bases.centerItem.all,
        borderRadius: Outlines.borderRadius.large,
    },
});