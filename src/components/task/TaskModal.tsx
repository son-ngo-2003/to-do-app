import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import {
    Pressable, View, TextInput, StyleSheet, Text,
    Switch, TouchableOpacity
} from 'react-native';
import dayjs from "dayjs";
import Animated, {
    interpolateColor, LayoutAnimationConfig,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

//components
import {
    BaseModal,
    ColumnsWheelPicker,
    Icon,
    KeyboardDismissableView, ModalButton,
    Overlay,
    TimeWheelPicker
} from '../atomic';
import { LabelsList } from '../label';
import { NoteInTaskItem } from "../note";
import formReducer, {FormAction, FormActionKind} from "../../reducers/formReducer";
import { TaskFormState } from "../../types/formStateType";
import { LightCalendar } from "../lightCalendar";


import { CALENDAR_BODY_HEIGHT } from "../lightCalendar/constants";
import { Typography, Outlines, Colors, Animations as Anim} from '../../styles';
import {paddedNumber, toPrintAsPlural} from "../../utils/baseUtil";
import {AnimatedPressable} from "../../helpers/animated";
import {
    createInitialTask,
    fromStateToTask,
    isStateOfTask
} from "../../helpers/formState";
import {type AlertFunctionType, useAlertProvider} from "../../hooks";
import AlertModal from "../atomic/AlertModal";
import {debounce} from "lodash";
import useTasksData from "../../hooks/dataHooks/useTasksData";

type TaskModalProps = {
    mode: 'add' | 'edit', //TODO: add a noti text in case of create a new task but start time in the past
    task?: Task,
    visible?: boolean,
    onPressNote?: (note: Note) => void,

    onAddTask?: (task: Partial<Task>) => void, //only Partial<Task> cause id, createdAt, updatedAt, completedAt will be added by service, not by user
    onUpdateTask?: (task: Partial<Task>) => void,
    onCancel?: (draftTask: Partial<Task>, isEdited: boolean, alert: AlertFunctionType) => Promise<any>,
        //when press turn off modal or when press outside of modal, draft task is what user has changed but not yet press add or update
        //alert is a function to show alert modal, it will be used to ask user if they want to save changes or not
    onChangeTask?: (task: Partial<Task>) => void, //this will call every time there is a change in at least one field of the task, avoid this, only use final value when user press update (onPressUpdate)

    onModalHide?: () => void,
    onModalWillHide?: () => void,
    onModalShow?: () => void,
    onModalWillShow?: () => void,
}

export type TaskModalRef = {
    close: () => Promise<any>,
}

type ButtonMode = 'add' | 'edit' | 'loading' | 'added' | 'edited';

const sizeButton = 25;
const wheelPickerHeight = 90;

const TaskModal = React.forwardRef<TaskModalRef, TaskModalProps> (({
    mode,
    task,
    visible = true,
    onPressNote,

    onAddTask,
    onUpdateTask,
    onCancel,
    onChangeTask,

    onModalHide,
    onModalWillHide,
    onModalShow,
    onModalWillShow,
}, ref) => {
    const { addTask, updateTask } = useTasksData(false);
    const [ originTask, setOriginalTask ] = React.useState<Task | undefined>(task);
    const [ taskFormState, dispatch ] = React.useReducer(formReducer<TaskFormState>, task, createInitialTask);
    const [ taskRepeat, setTaskRepeat ] = React.useState<RepeatAttributeType>( task?.repeat || {value: 1, unit: 'day'} );
    const [ isEdited, setIsEdited ] = React.useState<boolean>(false);
    const [ buttonMode, setButtonMode ] = React.useState<ButtonMode>(mode);
    const [ showWheelPicker, setShowWheelPicker ] = React.useState<'none' | 'pick-start' | 'pick-end' | 'lightCalendar-start' | 'lightCalendar-end' | 'restart'>('none');
    const repeatOpacity = useSharedValue<number>( taskFormState.repeat ? 1 : 0.3 );

    const {
        alert,
        modalVisible, alertProps,
    } = useAlertProvider();

    const dispatchTaskForm = React.useCallback( (action: FormAction<TaskFormState>) => {
        dispatch(action);
        const newTaskFromState = formReducer<TaskFormState>(taskFormState, action);
        onChangeTask?.(fromStateToTask(newTaskFromState));
    },[dispatch, taskFormState, onChangeTask]);

    const onPressAdd = React.useCallback( async () => {
        try {
            setButtonMode('loading');

            const task = fromStateToTask(taskFormState);
            onAddTask?.(task);
            const newTask = await addTask(task);
            dispatchTaskForm({type: FormActionKind.UPDATE_ALL, payload: createInitialTask(newTask)});
            setOriginalTask(newTask);

            setButtonMode('added');
        } catch (e) {
            console.error(e);
            await alert({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while adding task',
            });

            setButtonMode('add');
        }
    }, [setButtonMode, taskFormState, onAddTask, addTask, dispatchTaskForm, setOriginalTask, alert]);

    const onPressUpdate = React.useCallback(async () => {
        try {
            setButtonMode('loading');

            const task = fromStateToTask(taskFormState);
            onUpdateTask?.(task);
            const newTask = await updateTask?.(task);
            dispatchTaskForm({ type: FormActionKind.UPDATE_ALL, payload: createInitialTask(newTask) });
            setOriginalTask(newTask);

            setButtonMode('edited');
        } catch (e) {
            console.error(e);
            await alert({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while updating task!',
            });

            setButtonMode('edit');
        }
    }, [taskFormState, setButtonMode, updateTask, alert, setOriginalTask, dispatchTaskForm, onUpdateTask]);

    const onPressCancel = React.useCallback(async () => {
        console.log(isEdited);
        return onCancel?.(fromStateToTask(taskFormState), isEdited, alert);
    }, [onCancel, alert, taskFormState, isEdited]);

    const onChangeLabels = React.useCallback((newListLabels: Label[]) => {
        dispatchTaskForm({type: FormActionKind.UPDATE_LIST, payload: {field: 'labels', value: newListLabels}});
    }, [dispatchTaskForm]);

    const onChangeTime = React.useCallback((time: {hour: number, minute: number, second?: number}) => {
        const isFor = showWheelPicker === 'pick-start' || showWheelPicker === 'lightCalendar-start' ? 'start' : 'end';
        const date = new Date(isFor === 'start' ? taskFormState.startDate : taskFormState.endDate);
        date.setHours(time.hour, time.minute, time.second || 0);
        dispatchTaskForm({type: FormActionKind.UPDATE_DATE, payload: {field: isFor === 'start' ? 'startDate' : 'endDate', value: date}});
    }, [taskFormState.startDate, taskFormState.endDate, showWheelPicker, dispatchTaskForm]);

    const onChangeDate = React.useCallback((date: Date) => {
        const isFor = showWheelPicker === 'pick-start' || showWheelPicker === 'lightCalendar-start' ? 'start' : 'end';
        const newDate = new Date(date);
        const oldDate = isFor === 'start' ? taskFormState.startDate : taskFormState.endDate;
        newDate.setHours(oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds());
        dispatchTaskForm({type: FormActionKind.UPDATE_DATE, payload: {field: isFor === 'start' ? 'startDate' : 'endDate', value: newDate}});
    }, [taskFormState.startDate, taskFormState.endDate, showWheelPicker, dispatchTaskForm]);

    const onToggleSwitch = React.useCallback((field: 'isAllDay' | 'isAnnouncement') => {
        dispatchTaskForm({type: FormActionKind.TOGGLE_CHECKBOX, payload: {field}});
        setShowWheelPicker('none');
    }, [setShowWheelPicker, dispatchTaskForm]);

    const onChangeRepeat = React.useCallback((isOn?: boolean, value?: RepeatAttributeType["value"], unit?: RepeatAttributeType["unit"]) => {
        if (isOn !== undefined) {
            repeatOpacity.value = Anim.timing<number>(isOn ? 1 : 0.3).easeIn.fast
            if (isOn) {
                dispatchTaskForm({type: FormActionKind.UPDATE_ELEMENT, payload: {field: 'repeat', value: taskRepeat}});
                setShowWheelPicker('restart');
            } else {
                dispatchTaskForm({type: FormActionKind.DELETE_ELEMENT, payload: {field: 'repeat'}});
                setShowWheelPicker('none');
            }
        }

        if (!isOn && !value && !unit) return;

        const newTaskRepeat = value ? {...taskRepeat, value} : unit ? {...taskRepeat, unit} : taskRepeat;
        setTaskRepeat(newTaskRepeat);
        dispatchTaskForm({type: FormActionKind.UPDATE_ELEMENT, payload: {field: 'repeat', value: newTaskRepeat}});
    }, [taskRepeat, setTaskRepeat, repeatOpacity.value, dispatchTaskForm, setShowWheelPicker]);

    const onPressDeleteNote = React.useCallback((_note: Note) => {
        dispatchTaskForm({type: FormActionKind.DELETE_ELEMENT, payload: {field: 'note'}});
    }, [dispatchTaskForm])

    React.useImperativeHandle(ref, () => ({
        close: onPressCancel,
    }), [onPressCancel]);

    React.useEffect(() => {
        setOriginalTask(task);
        if (task) {
            dispatchTaskForm({type: FormActionKind.UPDATE_ALL, payload: createInitialTask(task)});
        }
    }, [task]);

    const checkIsEdited = debounce(() => {
        const _isEdited = !originTask || !isStateOfTask(taskFormState, originTask);
        setIsEdited(_isEdited);
        if (_isEdited && (buttonMode === 'added' || buttonMode === 'edited')) {
            setButtonMode('edit');
        }
    }, 300);

    React.useEffect(() => {
        if (mode === 'edit' && !originTask) { return }
        checkIsEdited();
    }, [taskFormState]);

    // ================================= UI PARTS =================================
    const { colors } = useTheme();
    const colorProgress = useSharedValue<number>(  taskFormState.isCompleted ? 1 : 0);
    const rightSectionWidth = React.useRef(0);
    const heightPickerStart = useSharedValue<number>(0);
    const heightPickerEnd = useSharedValue<number>(0);
    const heightPickerRepeat = useSharedValue<number>(0);

    const onPressCompletedCheckbox = () => {
        dispatchTaskForm({type: FormActionKind.TOGGLE_CHECKBOX, payload: {field: 'isCompleted'}});
        colorProgress.value = Anim.timing<number>(1-(taskFormState.isCompleted ? 0 : 1)).easeIn.fast;
    }

    const checkboxAnimatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor( colorProgress.value, [ 0, 1 ],
                [ colors.card, Colors.primary.yellow ], 'RGB',
            ),
        };
    });

    React.useEffect(() => {
        switch (showWheelPicker) {
            case 'pick-start':
                heightPickerStart.value = Anim.spring<number>(wheelPickerHeight).base.glacial;
                heightPickerEnd.value = Anim.timing<number>(0).easeOut.fast;
                heightPickerRepeat.value = Anim.timing<number>(0).easeOut.fast;
                break;
            case 'pick-end':
                heightPickerStart.value = Anim.timing<number>(0).easeOut.fast;
                heightPickerEnd.value = Anim.spring<number>(wheelPickerHeight).base.glacial;
                heightPickerRepeat.value = Anim.timing<number>(0).easeOut.fast;
                break;
            case "lightCalendar-start":
                heightPickerStart.value = Anim.spring<number>(CALENDAR_BODY_HEIGHT).base.glacial;
                heightPickerEnd.value = Anim.timing<number>(0).easeOut.fast;
                heightPickerRepeat.value = Anim.timing<number>(0).easeOut.fast;
                break;
            case "lightCalendar-end":
                heightPickerStart.value = Anim.timing<number>(0).easeOut.fast;
                heightPickerEnd.value = Anim.spring<number>(CALENDAR_BODY_HEIGHT).base.glacial;
                heightPickerRepeat.value = Anim.timing<number>(0).easeOut.fast;
                break;
            case 'restart':
                heightPickerStart.value = Anim.timing<number>(0).easeOut.fast;
                heightPickerEnd.value = Anim.timing<number>(0).easeOut.fast;
                heightPickerRepeat.value = Anim.spring<number>(wheelPickerHeight).base.glacial;
                break;
            case 'none':
                heightPickerStart.value = Anim.timing<number>(0).easeOut.fast;
                heightPickerEnd.value = Anim.timing<number>(0).easeOut.fast;
                heightPickerRepeat.value = Anim.timing<number>(0).easeOut.fast;
        }
    }, [showWheelPicker]);

    return (

        <BaseModal isVisible={visible} hasBackdrop={true} avoidKeyboard={false}
               animationIn={'fadeInUpBig'} animationInTiming={500} animationOut={'fadeOutDownBig'} animationOutTiming={500}
               onModalHide={onModalHide} onModalWillHide={onModalWillHide} onModalShow={onModalShow} onModalWillShow={onModalWillShow}

               customBackdrop={<Overlay onPress={onPressCancel} background={'highOpacity'}/>}
        >
            <KeyboardDismissableView>
                <View style={[styles.modalContainer, {backgroundColor: colors.card}]}>
                    {/* Add/Edit and Close Buttons */}
                    <View style={[styles.twoItemsRow]}>
                        <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                            <AnimatedPressable style={[styles.checkbox, checkboxAnimatedStyles]}
                                               hitSlop={15}
                                               onPress={onPressCompletedCheckbox}
                            />
                            <Text style={[Typography.body.x30, {color: colors.text, opacity: 0.6}]}>Marked as completed</Text>
                        </View>

                        <View style={[styles.buttonsContainer]}>
                            <ModalButton mode={buttonMode}
                                         isDisabled={!isEdited} size={sizeButton}
                                         onPress={{add: onPressAdd, edit: onPressUpdate}}
                            />

                            <Pressable  onPress={onPressCancel} hitSlop={6}>
                                <Icon name="window-close" size={sizeButton} color={colors.text} library='MaterialCommunityIcons'/>
                            </Pressable>
                        </View>
                    </View>

                    {/* Title  */}

                    <TextInput style={[styles.title, {color: colors.text}]} multiline={true}
                                onChangeText={(text) => dispatchTaskForm({type: FormActionKind.UPDATE_TEXT, payload: {field: 'title', value: text}})}
                                value={taskFormState.title}
                                placeholder='Press here to add title to your note'/>

                    {/* Labels */}
                    <LabelsList
                        withAddButton={true}
                        withDeleteButton={true}
                        setListLabels={(newLabels) => onChangeLabels(newLabels)}
                        chosenLabelsList={taskFormState.labels}
                    />

                    <View style={[styles.decorationLine, {backgroundColor: colors.border}]}/>

                    {/* Config */}
                    <View style={[styles.configContainer]}>

                        {/*Time setting*/}
                        <View style={[styles.sectionConfigContainer]}>
                            <View style={[styles.leftSectionPart]}><Icon name={'calendar-outline'} library={'Ionicons'} color={colors.text} size={25}/></View>
                            <View style={[styles.rightSectionPart]}
                                onLayout={(event) => {
                                    rightSectionWidth.current = event.nativeEvent.layout.width;
                                }}
                            >
                                <View style={[styles.twoItemsRow, styles.rowHeightConfig]}>
                                    <Text style={[Typography.body.x40, {color: colors.text}]}>All day:</Text>
                                    <Switch style={[styles.switchConfig]} trackColor={{true: Colors.primary.teal}} value={taskFormState.isAllDay}
                                        onValueChange={()=>onToggleSwitch('isAllDay')}/>
                                </View>

                                <View style={[styles.twoItemsRow, styles.rowHeightConfig]}>
                                    <Text style={[Typography.body.x40, {color: colors.text}]}>Start:</Text>
                                    <View style={{gap: 10, flexDirection: 'row'}}>
                                        <TouchableOpacity onPress={() => setShowWheelPicker('pick-start')}>
                                            <Text style={[Typography.body.x40, {color: colors.text, textDecorationLine: 'underline'}]}>{dayjs(taskFormState.startDate).format('HH:mm')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setShowWheelPicker('lightCalendar-start')}>
                                            <Text style={[Typography.body.x40, {color: colors.text, textDecorationLine: 'underline'}]}>{dayjs(taskFormState.startDate).format('DD/MM/YYYY')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Animated.View style={{height: heightPickerStart, overflow: 'hidden',
                                                      display: ['pick-start', 'none'].includes(showWheelPicker) ? 'flex' : 'none' }}>
                                    <TimeWheelPicker
                                        initialTime={{hour: taskFormState.startDate.getHours(), minute: taskFormState.startDate.getMinutes()}}
                                        timeMode={'12h'}
                                        onChangeTime={onChangeTime}

                                        itemTextStyle={{...Typography.body.x40, color: colors.text}}
                                        wrapperHeight={ wheelPickerHeight }
                                        itemHeight={ 40 }
                                        selectedIndicatorStyle={{backgroundColor: colors.border, opacity: 0.5}}
                                    />
                                </Animated.View>

                                <Animated.View style={{height: heightPickerStart, overflow: 'hidden',
                                                       display: ['lightCalendar-start', 'none'].includes(showWheelPicker) ? 'flex' : 'none' }}>
                                    <LightCalendar
                                        initialDate={taskFormState.startDate}
                                        minMonth={'2024-10-01'}
                                        maxMonth={'2025-01-31'}

                                        onPressDate={onChangeDate}
                                        dateNameType={'1 letter'}
                                        width={rightSectionWidth.current}
                                        styleNumber={2}
                                    />
                                </Animated.View>

                                <View style={[styles.twoItemsRow, styles.rowHeightConfig]}>
                                    <Text style={[Typography.body.x40, {color: colors.text}]}>End:</Text>
                                    <View style={{gap: 10, flexDirection: 'row'}}>
                                        <TouchableOpacity onPress={() => setShowWheelPicker('pick-end')}>
                                            <Text style={[Typography.body.x40, {color: colors.text, textDecorationLine: 'underline'}]}>{dayjs(taskFormState.endDate).format('HH:mm')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setShowWheelPicker('lightCalendar-end')}>
                                            <Text style={[Typography.body.x40, {color: colors.text, textDecorationLine: 'underline'}]}>{dayjs(taskFormState.endDate).format('DD/MM/YYYY')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Animated.View style={{height: heightPickerEnd, overflow: 'hidden',
                                                    display: ['pick-end', 'none'].includes(showWheelPicker) ? 'flex' : 'none' }}>
                                    <TimeWheelPicker
                                        initialTime={{hour: taskFormState.endDate.getHours(), minute: taskFormState.endDate.getMinutes()}}
                                        timeMode={'12h'}
                                        onChangeTime={onChangeTime}

                                        itemTextStyle={{...Typography.body.x40, color: colors.text}}
                                        wrapperHeight={ wheelPickerHeight }
                                        itemHeight={ 40 }
                                        selectedIndicatorStyle={{backgroundColor: colors.border, opacity: 0.5}}
                                    />
                                </Animated.View>

                                <Animated.View style={{height: heightPickerEnd, overflow: 'hidden',
                                                        display: ['lightCalendar-end', 'none'].includes(showWheelPicker) ? 'flex' : 'none' }}>
                                    <LightCalendar
                                        initialDate={taskFormState.startDate}
                                        minMonth={'2024-10-01'}
                                        maxMonth={'2025-01-31'}

                                        onPressDate={onChangeDate}
                                        dateNameType={'1 letter'}
                                        width={rightSectionWidth.current}
                                        styleNumber={2}
                                    />
                                </Animated.View>
                            </View>
                        </View>


                        {/*Repeat setting*/}
                        <View style={[styles.sectionConfigContainer]}>

                            <View style={[styles.leftSectionPart]}><Icon name={'repeat'} library={'Feather'} color={colors.text} size={22}/></View>
                            <View style={[styles.rightSectionPart]}>

                                <View style={[styles.twoItemsRow, styles.rowHeightConfig]}>
                                    <Text style={[Typography.body.x40, {color: colors.text}]}>Repeat:</Text>
                                    <Switch style={[styles.switchConfig]} trackColor={{true: Colors.primary.teal}} value={!!taskFormState.repeat}
                                            onValueChange={(value)=> onChangeRepeat(value)}/>
                                </View>

                                <Animated.View style={[{gap: 10, flexDirection: 'row', justifyContent: 'flex-end'}, styles.rowHeightConfig,
                                            {opacity: repeatOpacity}
                                ]}>
                                    <TouchableOpacity onPress={() => setShowWheelPicker('restart')} disabled={!taskFormState.repeat}>
                                        <Text style={[Typography.body.x40, {color: colors.text, textDecorationLine: 'underline'}]}>{paddedNumber(taskRepeat.value)}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => setShowWheelPicker('restart')} disabled={!taskFormState.repeat}>
                                        <Text style={[Typography.body.x40, {color: colors.text, textDecorationLine: 'underline'}]}
                                        >{ toPrintAsPlural(taskRepeat.value, taskRepeat.unit )}</Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                <Animated.View style={{height: heightPickerRepeat, overflow: 'hidden'}}>
                                    <ColumnsWheelPicker
                                        columnsData={[
                                            [...Array(100).keys()].map((_, i) => paddedNumber(i+1)), //TODO: move 100 to constants
                                            ['day', 'week', 'month', 'year'],
                                        ]}
                                        selectedIndexes={[taskRepeat.value - 1, ['day', 'week', 'month', 'year'].indexOf(taskRepeat.unit)]}
                                        onChange={(_, changedColumn, newColumnValue) =>
                                            changedColumn == 0
                                                ? onChangeRepeat(undefined, parseInt(newColumnValue))
                                                : onChangeRepeat(undefined, undefined, newColumnValue as RepeatAttributeType["unit"])
                                        }

                                        separator={''}
                                        gapSize={10}
                                        itemTextStyle={{...Typography.body.x40, color: colors.text}}
                                        wrapperHeight={ wheelPickerHeight }
                                        itemHeight={ 40 }
                                        selectedIndicatorStyle={{backgroundColor: colors.border, opacity: 0.5}}
                                    />
                                </Animated.View>

                            </View>
                        </View>

                        {/*Notification setting*/}
                        <View style={[styles.sectionConfigContainer]}>
                            <View style={[styles.leftSectionPart]}><Icon name={'notifications-outline'} library={'Ionicons'} color={colors.text} size={25}/></View>
                            <View style={[styles.rightSectionPart]}>
                                <View style={[styles.twoItemsRow, styles.rowHeightConfig]}>
                                    <Text style={[Typography.body.x40, {color: colors.text}]}>Notification:</Text>
                                    <Switch style={[styles.switchConfig]} trackColor={{true: Colors.primary.teal}} value={taskFormState.isAnnouncement}
                                            onValueChange={()=>onToggleSwitch('isAnnouncement')}/>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.decorationLine, {backgroundColor: colors.border, marginBottom: 15}]}/>

                    {/* Note */}
                    <LayoutAnimationConfig skipEntering skipExiting>
                        <NoteInTaskItem
                            note={taskFormState.note}
                            onPressItemWithNote={ onPressNote } //TODO
                            onPressDelete={onPressDeleteNote}
                            // onPressAddNote={} //TODO: navigate to search screen
                        />
                    </LayoutAnimationConfig>

                    {
                        alertProps &&
                        <AlertModal
                            {...alertProps}
                            visible={ modalVisible}
                        />
                    }
                </View>
            </KeyboardDismissableView>
        </BaseModal>
    )
});

export default React.memo(TaskModal);

const styles = StyleSheet.create({
    modalContainer: {
        width: '90%',
        alignSelf: 'center',
        paddingVertical: 20,
        paddingHorizontal: 25,
        borderRadius: Outlines.borderRadius.large,
        overflow: 'hidden',
    },

    twoItemsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    buttonsContainer: {
        flexDirection: 'row',
        justifyContent:'flex-end',
        gap: 20,
    },

    checkbox: {
        width: 17,
        height: 17,
        borderRadius: Outlines.borderRadius.small,
        borderWidth: 1,
        borderColor: Colors.primary.yellow,
    },


    title: {
        ...Typography.subheader.x50,
    },

    decorationLine: {
        width: '100%',
        height: 1,
        marginTop: 10,
    },

    configContainer: {
        flexDirection: 'column',
        paddingTop: 10,
    },

    sectionConfigContainer: {
        flexDirection: 'row',
    },

    leftSectionPart: {
        width: 35,
        height: '100%',
        paddingTop: 3,
    },

    rightSectionPart: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },

    rowHeightConfig: {
        height: 40,
    },

    switchConfig: {
        transform: [{scaleX: 0.8}, {scaleY: 0.8}, {translateX: 6}]
    }
});