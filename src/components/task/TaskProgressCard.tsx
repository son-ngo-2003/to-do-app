import * as React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { Colors, Typography, Outlines } from '../../styles';

//Components
import { useTheme } from '@react-navigation/native';
import {UNLABELED_KEY} from "../../constant";

type TaskProgressCardProps = {
    label: Label | typeof UNLABELED_KEY,
    numberOfNotes : number,
    numberOfTasks : number,
    numberOfCompletedTasks : number,
    onPress?: () => void,
}

export const TASK_PROGRESS_CARD_HEIGHT = 135;
export const TASK_PROGRESS_CARD_WIDTH = 220;

const TaskProgressCard: React.FC<TaskProgressCardProps> = ({ 
    label,
    numberOfNotes,
    numberOfTasks,
    numberOfCompletedTasks,
    onPress,
}) => {

    const { colors } = useTheme();
    const cardTitle = React.useMemo(() => label === UNLABELED_KEY ? 'Not Labelled' : label.name, [label]);
    const progressColor = React.useMemo(() => label === UNLABELED_KEY ? Colors.primary.teal : label.color, [label]);

    const finishPercent = numberOfTasks === 0
                            ? 0
                            : numberOfCompletedTasks / numberOfTasks * 100;

    return (
        <Pressable  onPress={onPress}
                    style={[styles.container, {backgroundColor: colors.card},]}>
            <View>
                <View style={[styles.headingCover]}>
                    <Text style={[Typography.header.x40, styles.heading, {color: colors.text}]} numberOfLines={2}
                    >{cardTitle}</Text>
                </View>

                <Text style={[Typography.body.x10, styles.info, {color: colors.text}]}>{`${numberOfNotes} notes`}</Text>
                <Text style={[Typography.body.x10, styles.info, {color: colors.text}]}>{`${numberOfTasks} tasks (${numberOfCompletedTasks} completed)`}</Text>
            </View>

            <View style={[styles.progressBar]}>
                <View style = {[styles.fillProgressBar, 
                                {backgroundColor: progressColor,
                                width: `${finishPercent}%`}]}/>
                <View style = {[styles.progressBarNode, 
                    {backgroundColor: progressColor,
                    left: `${finishPercent}%`}]}/>
            </View>

        </Pressable>
    )
}
export default TaskProgressCard;

const styles = StyleSheet.create({
    container: {
        width: TASK_PROGRESS_CARD_WIDTH,
        height: TASK_PROGRESS_CARD_HEIGHT,
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