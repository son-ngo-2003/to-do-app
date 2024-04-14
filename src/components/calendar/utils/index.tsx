import { DimensionValue } from "react-native";
import { MAX_NUMBER_OF_TASKS_SHOW_EACH_MOMENT, TIMELINE_CELL_HEIGHT } from "../constants";
import { type TaskTimeLine } from "../timeline/TimeLineColumn";
import { header } from "../../../styles/typography";

export const generateBBoxOfTasks = (taskList: TaskTimeLine[]) => {
    let mapTimePositionStatus : Map<number, Array<number>> = new Map(); //contains list status of position at moment

    const listStartEndMinuteTasks = taskList.map( task => {
        const start = task.start.hour() * 60 + task.start.minute();
        const end = task.end.hour() * 60 + task.end.minute();      

        mapTimePositionStatus.set(start, Array( MAX_NUMBER_OF_TASKS_SHOW_EACH_MOMENT ).fill(0));
        mapTimePositionStatus.set(end,   Array( MAX_NUMBER_OF_TASKS_SHOW_EACH_MOMENT ).fill(0));

        return {start, end};
    });

    //update list of positions
    const posOfTasks = listStartEndMinuteTasks.map( ({start, end}) => {
        const avaiPos = mapTimePositionStatus.get(start)?.findIndex( (position) => position === 0) as number;
        mapTimePositionStatus.forEach( (_, time) => {
            if ( ! (start <= time && time < end) ) return;
            let newPosStatus = mapTimePositionStatus.get(time) as Array<number>;
            newPosStatus[avaiPos] = 1;
            mapTimePositionStatus.set(time, newPosStatus);
        });
        return avaiPos;
    });

    //get width of each task
    const widthOfTasks = listStartEndMinuteTasks.map( ({start, end}) => {
        let maxNumberOfTasksInThisDuration = 1;
        mapTimePositionStatus.forEach( (posStatus, time) => {
            if ( ! (start <= time && time <= end) ) return;
            const numberOfTasksThisTime = posStatus.reduce((acc, status) => acc + status, 0);
            if (numberOfTasksThisTime > maxNumberOfTasksInThisDuration) {
                maxNumberOfTasksInThisDuration = numberOfTasksThisTime;
            }
        });
        return 100 * 1 / maxNumberOfTasksInThisDuration;
    });

    return widthOfTasks.map((width, index) => {
        const minWidth = 100 * 1 / MAX_NUMBER_OF_TASKS_SHOW_EACH_MOMENT;
        const leftCount = posOfTasks[index];
        const { start, end } = listStartEndMinuteTasks[index];
        return {
            top: start * TIMELINE_CELL_HEIGHT / 60,
            height: (end - start) * TIMELINE_CELL_HEIGHT / 60,
            width: `${ leftCount === -1 ? 0 : Math.max(width, minWidth) }%` as DimensionValue,
            left: `${leftCount * width}%` as DimensionValue,
        }
    }
    );
}