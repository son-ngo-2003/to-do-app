import {Platform} from "react-native";

export const SWITCH_MODAL_GAP_TIME = Platform.OS === 'ios' ? 20 : 0;

export const UNLABELED_KEY = "__unlabeled__";