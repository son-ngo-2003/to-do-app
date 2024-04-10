import * as React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { Colors, Bases, Typography, Outlines } from '../../styles';

//Components
import { Icon } from '../atomic';
import { useTheme } from '@react-navigation/native';

type TaskProgressCardProps = {
    label: Label,
    onPress?: () => void,
}

const TaskProgressCard: React.FC<TaskProgressCardProps> = ({ 
    label,
    onPress = () => TaskProgressCard,
}) => {

    const { colors } = useTheme();

    const finishPercent = label.numberOfTasks === 0 
                            ? 0
                            : label.numberOfCompletedTasks / label.numberOfTasks * 100;

    return (
        <Pressable  onPress={onPress}
                    style={[styles.container, {backgroundColor: colors.card},]}>
            <View>
                <View style={[styles.headingCover]}>
                    <Text style={[Typography.header.x40, styles.heading, {color: colors.text}]} numberOfLines={2}
                    >{label.name}</Text>
                </View>

                <Text style={[Typography.body.x10, styles.info, {color: colors.text}]}>{`${label.numberOfNotes} notes`}</Text>
                <Text style={[Typography.body.x10, styles.info, {color: colors.text}]}>{`${label.numberOfTasks} tasks (${label.numberOfCompletedTasks} completed)`}</Text>
            </View>

            <View style={[styles.progressBar]}>
                <View style = {[styles.fillProgressBar, 
                                {backgroundColor: label.color,
                                width: `${finishPercent}%`}]}/>
                <View style = {[styles.progressBarNode, 
                    {backgroundColor: label.color,
                    left: `${finishPercent}%`}]}/>
            </View>

        </Pressable>
    )
}
export default TaskProgressCard;

const styles = StyleSheet.create({
    container: {
        width: 220,
        height: 135,
        paddingHorizontal: 23,
        paddingVertical: 10,
        borderRadius: Outlines.borderRadius.large,
        ...Outlines.shadow.base,
    },
    headingCover: {
        justifyContent: 'center',
        height: 50,
    },
    heading: {
        ...Typography.lineHeight.x20,
        letterSpacing: 0.1,
    },
    info: {
        lineHeight: 17,
    },
    progressBar: {
        marginTop: 15,
        width: '100%',
        height: 4,
        backgroundColor: Colors.neutral.s300,
        borderRadius: Outlines.borderRadius.small,

        position: 'relative',
    },
    fillProgressBar: {
        height: 4,
        position: 'absolute',
        top: 0,
        borderRadius: Outlines.borderRadius.small,
    },
    progressBarNode: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: -2,
    },
});