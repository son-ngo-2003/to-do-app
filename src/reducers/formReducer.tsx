import {FormState} from "../types/formStateType";

enum FormActionKind {
    UPDATE_ALL,
    UPDATE_TEXT,
    TOGGLE_CHECKBOX,
    UPDATE_LIST,
    UPDATE_DATE,
    UPDATE_ELEMENT,
    DELETE_ELEMENT,
}

type FormAction<T> =
    | { type: FormActionKind.UPDATE_ALL, payload: T }
    | { type: FormActionKind.UPDATE_TEXT, payload: { field: keyof T; value: string } }
    | { type: FormActionKind.TOGGLE_CHECKBOX; payload: { field: keyof T } }
    | { type: FormActionKind.UPDATE_LIST; payload: { field: keyof T; value: any[]} }
    | { type: FormActionKind.UPDATE_DATE; payload: { field: keyof T; value: Date } }
    | { type: FormActionKind.UPDATE_ELEMENT; payload: { field: keyof T; value: Note | Label | Task | RepeatAttributeType } }
    | { type: FormActionKind.DELETE_ELEMENT; payload: { field: keyof T } };

function formReducer<T extends FormState> (state : T, action: FormAction<T>) : T {
    const { type, payload } = action;

    if ((payload as any)?.field === '_id') {
        throw new Error('Cannot update _id field');
    }

    switch(type) {
        case FormActionKind.UPDATE_ALL:
            return {
                ...state,
                ...payload,
            };

        case FormActionKind.UPDATE_TEXT:
        case FormActionKind.UPDATE_LIST:
        case FormActionKind.UPDATE_DATE:
        case FormActionKind.UPDATE_ELEMENT:
            return {
                ...state,
                [payload.field]: payload.value,
            };
        case FormActionKind.TOGGLE_CHECKBOX:
            return {
                ...state,
                [payload.field]: !state[payload.field],
            };
        case FormActionKind.DELETE_ELEMENT:
            return {
                ...state,
                [payload.field]: undefined,
            };

        default:
            return state;
    }
}

export default formReducer;
export { FormAction, FormActionKind };