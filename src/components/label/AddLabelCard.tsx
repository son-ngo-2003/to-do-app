import * as React from 'react';
import {StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Bases, Outlines } from '../../styles';

//Components
import {Icon, InsetShadowCard} from '../atomic';
import {LABEL_CARD_HEIGHT} from "./LabelCard";

type AddLabelCardProps = {
    onPress?: () => void,
    type?: 'small' | 'medium',
    style?: ViewStyle,
}

const HEIGHT = {
    small: 40,
    medium: LABEL_CARD_HEIGHT,
}

const AddLabelCard: React.FC<AddLabelCardProps> = ({
    onPress,
    type = 'small',
    style
}) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity style={[styles.container, {borderColor: colors.border, height: HEIGHT[type]}, style]}
                    onPress={onPress}>
            <InsetShadowCard
                offsetPercent={0.07}
                shadowColor={Outlines.shadow.base.shadowColor as string}
                shadowOpacity={0.105}
                style={{borderRadius: Outlines.borderRadius.large - 3, overflow: 'hidden'}}
            />
            <Icon name="plus" size={HEIGHT[type] * 0.3} color={colors.border} library='Octicons'/>
        </TouchableOpacity>
    )
}
export default AddLabelCard;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        ...Bases.centerItem.all,
        borderWidth: Outlines.borderWidth.thick,
        borderRadius: Outlines.borderRadius.large,
        ...Outlines.shadow.base,
    },
});