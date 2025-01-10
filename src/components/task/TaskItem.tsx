import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import { Colors, Typography, Outlines, Animations as Anim } from '../../styles';
import { useSharedValue, useAnimatedStyle, interpolateColor } from 'react-native-reanimated';
import { LabelsList } from '../label';

import { Icon } from '../atomic';
import {AnimatedPressable} from "../../helpers/animated";
import {useTasksData} from "../../controllers";
import {useAlert} from "../../hooks";

type TaskItemProps = {
    task: Task,
    onPress?: (task: Task) => void,
    onChangeCompletedStatus?: (task: Task, isFinished: boolean) => void,
    onPressDelete?: (task: Task) => void,
    showLabel?: boolean,
}

const TaskItem: React.FC<TaskItemProps> = ({ 
    task,
    onPress,
    onChangeCompletedStatus,
    onPressDelete,
    showLabel = true,
}) => {
    const { deleteTask, updateTask } = useTasksData(false);
    const { alert } = useAlert();
    const [ isCompleted, setIsCompleted ] = React.useState<boolean>(task.isCompleted); 
    const { colors } = useTheme();
    const colorProgress = useSharedValue<number>( isCompleted ? 1 : 0);
    const lastSetTimeOut = React.useRef<NodeJS.Timeout>();

    const onPressItem = React.useCallback( () => {
        onPress?.(task);
    }, [onPress, task]);

    const onPressCompletedItem = React.useCallback( () => {
        const completed = !isCompleted;
        setIsCompleted(completed);
        colorProgress.value = Anim.timing<number>(1-(completed ? 0 : 1)).easeIn.fast;

        lastSetTimeOut.current && clearTimeout(lastSetTimeOut.current);
        lastSetTimeOut.current = setTimeout(async () => {
            try {
                const updatedTask = await updateTask({_id:task._id, isCompleted: completed});
                onChangeCompletedStatus?.(updatedTask, completed);
            } catch (e) {
                console.error('TaskItem.tsx: ', e);
                alert({
                    type: 'error',
                    title: 'Error',
                    message: 'An error occurred while updating task as completed',
                });
            }
        }, 1000); //TODO: number here can be created at a constant, or a context (so can be modified in setting)
    }, [isCompleted, updateTask, onChangeCompletedStatus, alert, setIsCompleted, lastSetTimeOut.current, task._id]);

    const onPressDeleteItem = React.useCallback( async () => {
        try {
            const deletedTask = await deleteTask(task);
            onPressDelete?.(deletedTask);
        } catch (e) {
            console.error('TaskItem.tsx: ', e);
            await alert({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while deleting task',
            });
        }
    }, [task, onPressDelete, deleteTask, alert]);

    const checkboxAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor( colorProgress.value, [ 0, 1 ],
                [ colors.card, Colors.primary.yellow ], 'RGB',
            ),
        };
    });

    return (
        <TouchableOpacity  onPress={onPressItem} style={[styles.container, {backgroundColor: colors.card}] }>
            <View  style={[styles.infoPart]}>
                <AnimatedPressable style={[styles.checkbox, checkboxAnimatedStyles]}
                        hitSlop={15}
                        onPress={onPressCompletedItem}
                />

                <Text style={[Typography.subheader.x30, styles.info, {color: colors.text},
                                {textDecorationLine: isCompleted ? 'line-through' : 'none'}]}
                        numberOfLines={2}
                    >{`${task.title}`}</Text>

                <TouchableOpacity onPress={onPressDeleteItem}>
                    <Icon name='minus' size={17} color={colors.text} library='FontAwesome5'/>
                </TouchableOpacity>
            </View>

            {
                showLabel &&
                <View style={[styles.labelsPart]}>
                    <LabelsList
                        withAddButton={false}
                        withDeleteButton={false}
                        chosenLabelsList={task.labels}
                    />
                </View>
            }
        </TouchableOpacity>
    )
}
export default TaskItem;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 10,
        paddingHorizontal: 15,
        borderRadius: Outlines.borderRadius.large,
        ...Outlines.shadow.base,
    },
    infoPart: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    labelsPart: {
        overflow: 'hidden',
        paddingLeft: 26,
    },
    info: {
        flexShrink: 2,
        flexGrow: 2,
        paddingHorizontal: 12,
    },
    checkbox: {
        width: 17,
        height: 17,
        borderRadius: Outlines.borderRadius.small,
        borderWidth: 1,
        borderColor: Colors.primary.yellow,
    },
});