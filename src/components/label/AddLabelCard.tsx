import * as React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, Bases, Typography, Outlines } from '../../styles';

//Components
import { Icon } from '../atomic';

type AddLabelCardProps = {
//    label: Label,
}

const AddLabelCard: React.FC<AddLabelCardProps> = ({}) => {
    const { colors } = useTheme();

    const onPress = React.useCallback(() => {
        console.log("add label")
    },[]);

    return (
        <Pressable style={[styles.container, {backgroundColor: colors.border}]}
                    onPress={onPress}>
            <Icon name="plus" size={80} color={colors.background} library='Octicons'/>
        </Pressable>
    )
}
export default AddLabelCard;

const styles = StyleSheet.create({
    container: {
        ...Bases.centerItem.all,
        height: 160,
        borderRadius: Outlines.borderRadius.large,
    },
});