import {Platform} from "react-native";
import {ManipulateType} from "dayjs";

export const RANGE_TASK_INSTANCES_GENERATE =  { value: 1, unit: 'week' as ManipulateType };

export const SWITCH_MODAL_GAP_TIME = Platform.OS === 'ios' ? 20 : 0;

export const UNLABELED_KEY = "__unlabeled__";

export const TITLE_MAX_LENGTH = 70; //add announcement for user
export const NOTE_CONTENT_MAX_LENGTH = 1000; //TODO: add this functionality to editor