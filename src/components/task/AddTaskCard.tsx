import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import { Colors, Outlines } from '../../styles';

import { Icon } from '../atomic';

type AddTaskCardProps = {
    onPress?: () => void,
    heightSameAsItemWithLabel?: boolean,
    style?: ViewStyle,
}

const CARD_HEIGTH = 55;
const LABEL_HEIGHT = 40;

const AddTaskCard: React.FC<AddTaskCardProps> = ({
    onPress,
    heightSameAsItemWithLabel = false,
    style
}) => {
    const { colors } = useTheme();
    const height = React.useMemo(() => heightSameAsItemWithLabel ? CARD_HEIGTH + LABEL_HEIGHT : CARD_HEIGTH ,[heightSameAsItemWithLabel]);

    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, {borderColor: colors.border, height}, style]}
        >
            <Icon name={'plus'} size={30} color={ Colors.neutral.white } library={'FontAwesome6'}/>
        </TouchableOpacity>
    )
}
export default AddTaskCard;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderWidth: Outlines.borderWidth.thick,
        borderRadius: Outlines.borderRadius.large,
        ...Outlines.shadow.base,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }
});