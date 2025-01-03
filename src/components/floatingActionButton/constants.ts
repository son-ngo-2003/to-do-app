import {Layouts} from "../../styles";
import {HEADER_HEIGHT} from "../../constant/navigation";

export const SIZE_ACTION_BUTTON = 50;
export const SIZE_SUB_ACTION_BUTTON = 45;
export const ICON_SIZE_PERCENT = 0.6;

export const BUTTON_MARGIN = 20;
export const BUTTON_CLAMP_X: [number, number] = [BUTTON_MARGIN, Layouts.screen.width - SIZE_ACTION_BUTTON - BUTTON_MARGIN]
export const BUTTON_CLAMP_Y: [number, number] = [HEADER_HEIGHT, Layouts.screen.height - SIZE_ACTION_BUTTON - BUTTON_MARGIN]

export const FAB_ROTATION_OPEN = 135;
export const FAB_ROTATION_CLOSE = 0;
export const FAB_CHILDREN_OPACITY_OPEN = 1;
export const FAB_CHILDREN_POSITION_Y_OPEN = 0;

export const BUTTONS_GAP = 5;