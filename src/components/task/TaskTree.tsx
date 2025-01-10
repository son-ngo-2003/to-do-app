import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {Typography, Outlines, Colors} from '../../styles';
import {TaskItem} from "./index";
import {UNLABELED_KEY} from "../../constant";

const TASKTREE_CIRCLE_RADIUS = 6;

type TaskTreeProps = {
    tasks: Task[],               //if showShowMoreButton is not specified, the tasks end is null will indicate that there are more tasks
    label: Label | typeof UNLABELED_KEY,

    onPressTask?: (task: Task) => void,
    onPressDeleteTask?: (task: Task) => void,
    onChangeCompletedStatusTask?: (task: Task, isFinished: boolean) => void,

    showShowMoreButton?: boolean,
    onPressShowMore?: () => void,

    showLabel?: boolean,
}

const TaskTree: React.FC<TaskTreeProps> = ({
    tasks,
    label,

    onPressTask,
    onPressDeleteTask,
    onChangeCompletedStatusTask,

    showShowMoreButton = false,
    onPressShowMore,

    showLabel = true,
}) => {
    const { colors } = useTheme();
    const colorTree = React.useMemo(() => label === UNLABELED_KEY ? Colors.primary.teal : label.color, [label]);
    const treeTitle = React.useMemo(() => label === UNLABELED_KEY ? 'Not Labeled' : label.name, [label]);

    return (
        <View>
            <Text style={[ Typography.header.x40, { textTransform: 'uppercase', color: colorTree } ]}>{treeTitle}</Text>
            <View style={[styles.container]}>
                { tasks.map((task: Task, index: number) => (
                    <View key={index} style={[styles.treeItem, { backgroundColor: colors.background }]}>
                        <View style={[styles.line, { backgroundColor: colorTree },
                            index === 0 && { borderTopLeftRadius: Outlines.borderRadius.base / 2, borderTopRightRadius: Outlines.borderRadius.base / 2 },
                            index === tasks.length-1 && { borderBottomLeftRadius: Outlines.borderRadius.base / 2, borderBottomRightRadius: Outlines.borderRadius.base / 2 },
                        ]}></View>
                        <View style={[styles.milestone, { backgroundColor: colorTree, borderColor: colors.background }]}></View>

                        <View style={[styles.leaf]}>
                            <TaskItem
                                task={task}
                                onPress={onPressTask}
                                onChangeCompletedStatus={ onChangeCompletedStatusTask }
                                onPressDelete={onPressDeleteTask}
                                showLabel={showLabel}
                            />
                        </View>
                    </View>
                ))}


                { showShowMoreButton && (
                    <TouchableOpacity onPress={onPressShowMore} style={{paddingTop: 4, paddingLeft: 5}}>
                        <Text style={[Typography.subheader.x30, { color: colorTree }]}>Show More</Text>
                    </TouchableOpacity>
                )}

            </View>
        </View>
    )
}
export default TaskTree;

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    treeItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    line: {
        position: 'absolute',
        width: Outlines.lineWidth.base,
        height: '100%',
        left: 10,
    },
    milestone: {
        position: 'absolute',
        left: 10,
        top: '50%',
        transform: [{ translateY: -TASKTREE_CIRCLE_RADIUS }, { translateX: -TASKTREE_CIRCLE_RADIUS + Outlines.lineWidth.base / 2 }],

        width: TASKTREE_CIRCLE_RADIUS * 2,
        height: TASKTREE_CIRCLE_RADIUS * 2,
        borderRadius: TASKTREE_CIRCLE_RADIUS,

        borderWidth: Outlines.borderWidth.base,
    },
    leaf: {
        width: '100%',
        paddingLeft: 30,
        paddingVertical: 7,
    },
});