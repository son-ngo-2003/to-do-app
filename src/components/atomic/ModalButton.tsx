import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../../styles';
import Icon from './Icon';

export type ButtonMode = 'add' | 'edit' | 'loading' | 'added' | 'edited';

type ModalButtonProps = {
    mode: ButtonMode;
    isDisabled?: boolean;
    size?: number;
    color?: string;
    onPress?: Partial<Record< ButtonMode, ()=>Promise<void>>>
};

const iconConfig: Record<
    ButtonMode,
    { name: string; library: string; defaultColor?: string }
> = {
    add: { name: 'plus', library: 'Octicons' },
    edit: { name: 'cloud-upload', library: 'SimpleLineIcons' },
    loading: { name: 'ActivityIndicator', library: 'Ionicons' },
    added: { name: 'checkbox-marked-circle-plus-outline', library: 'MaterialCommunityIcons', defaultColor: Colors.success.s400 },
    edited: { name: 'cloud-check-outline', library: 'MaterialCommunityIcons', defaultColor: Colors.success.s400 },
};

const ModalButton: React.FC<ModalButtonProps> = ({
    mode,
    isDisabled = true,
    size = 16,
    color,
    onPress,
}) => {
    const { colors } = useTheme();
    const iconInfo = iconConfig[mode];
    const iconColor = color || iconInfo.defaultColor || colors.text;

    return (
        <TouchableOpacity
            onPress={!isDisabled ? onPress?.[mode] : undefined}
            hitSlop={6}
            disabled={isDisabled}
            style={[styles.button, { opacity: isDisabled ? 0.6 : 1 }]}
        >
            <Icon name={iconInfo.name} size={size} color={iconColor} library={iconInfo.library} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ModalButton;
