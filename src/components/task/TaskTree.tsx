import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import { Typography, Outlines } from '../../styles';
import {TaskItem} from "./index";

const TASKTREE_CIRCLE_RADIUS = 6;

type TaskTreeProps = {
    tasks: (Task|null)[],               //if showShowMoreButton is not specified, the tasks end is null will indicate that there are more tasks
    onPressTask?: (task: Task) => void,

    showShowMoreButton?: boolean,
    onPressShowMore?: () => void,

    colorTree: string,
    showLabel?: boolean,
}

const TaskTree: React.FC<TaskTreeProps> = ({
    tasks,
    onPressTask,

    showShowMoreButton,
    onPressShowMore,

    colorTree,
    showLabel = true,
}) => {
    const { colors } = useTheme();
    const [ isShowMoreVisible, setIsShowMoreVisible ] = React.useState(showShowMoreButton === undefined ? tasks[tasks.length-1] === null : showShowMoreButton);

    React.useEffect(() => {
        if (showShowMoreButton !== undefined) setIsShowMoreVisible(showShowMoreButton);
        setIsShowMoreVisible(tasks[tasks.length-1] === null);
    }, [showShowMoreButton, tasks]);

    return (
        <View style={[styles.container]}>
            { tasks.map((task: Task | null, index: number) => (
                task &&
                <View key={index} style={[styles.treeItem, { backgroundColor: colors.background }]}>
                    <View style={[styles.line, { backgroundColor: colorTree },
                        index === 0 && { borderTopLeftRadius: Outlines.borderRadius.base / 2, borderTopRightRadius: Outlines.borderRadius.base / 2 },
                        index === tasks.length-1 && { borderBottomLeftRadius: Outlines.borderRadius.base / 2, borderBottomRightRadius: Outlines.borderRadius.base / 2 },
                    ]}></View>
                    <View style={[styles.milestone, { backgroundColor: colorTree, borderColor: colors.background }]}></View>

                    <View style={[styles.leaf]}>
                        <TaskItem
                            task={task}
                            onPress={ (task) => onPressTask?.(task) } //TODO
                            onChangeCompletedStatus={ () => console.log('Task Tree: callback when task is pressed at finish button') } //TODO: add to task tree, or think more about this
                            onPressDelete={ () => console.log('Task Tree: onPressDeleteTask')} //TODO: add to task tree, or think more about this
                            showLabel={showLabel}
                        />
                    </View>
                </View>
            ))}


            { isShowMoreVisible && (
                <TouchableOpacity onPress={onPressShowMore} style={{paddingTop: 4, paddingLeft: 5}}>
                    <Text style={[Typography.subheader.x30, { color: colorTree }]}>Show More</Text>
                </TouchableOpacity>
            )}

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