import * as React from 'react';
import {useTheme} from '@react-navigation/native';
import {Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Bases, Colors, Layouts, Outlines, Typography} from '../../styles';

//components
import {
    BaseModal,
    ButtonMode,
    Icon,
    KeyboardDismissableView,
    ModalButton,
    Overlay
} from '../atomic';
import {ColorSelect} from './atomic/';
import {AlertFunctionType, useAlertProvider} from "../../hooks";
import AlertModal from "../atomic/AlertModal";
import formReducer, {FormAction, FormActionKind} from "../../reducers/formReducer";
import {LabelFormState} from "../../types/formStateType";
import {
    createInitialLabel, fromStateToLabel, isLabelStateEmpty, isStateOfLabel,
} from "../../helpers/formState";
import { useLabelsData } from "../../controllers";
import {debounce} from "lodash";

type LabelModalProps = {
    mode: 'add' | 'edit',
    labelId?: Label['_id'],
    visible?: boolean,

    onAddLabel?: (label: Label) => void,
    onUpdateLabel?: (newLabel: Label) => void,
    onCancel?: (draftLabel: Partial<Label>, isEdited: boolean, alert: AlertFunctionType) => Promise<any>,
    onChangeLabel?: (label: Partial<Label>) => void,

    onModalHide?: () => void,
    onModalWillHide?: () => void,
    onModalShow?: () => void,
    onModalWillShow?: () => void,
}

export type LabelModalRef = {
    close: () => void,
}

const sizeButton : number = 23;

const LabelModal = React.forwardRef<LabelModalRef, LabelModalProps> (({
    mode, 
    labelId,
    visible = true,

    onAddLabel,
    onUpdateLabel,
    onCancel,
    onChangeLabel,

    onModalHide,
    onModalWillHide,
    onModalShow,
    onModalWillShow,
}, ref) => {
    const { getLabelById, addLabel, updateLabel } = useLabelsData(false);
    const [ originalLabel, setOriginalLabel ] = React.useState<Label | undefined>(undefined);
    const [ isEdited, setIsEdited ] = React.useState<boolean>(false);
    const [ labelFormState, dispatch ] = React.useReducer(formReducer<LabelFormState>, undefined, createInitialLabel);
    const [ buttonMode, setButtonMode ] = React.useState<ButtonMode>(mode);
    const { colors } = useTheme();

    const {
        alert, alertProps,
        modalVisible
    } = useAlertProvider();

    const dispatchLabelForm = React.useCallback( (action: FormAction<LabelFormState>) => {
        dispatch(action);
        const newLabelFromState = formReducer<LabelFormState>(labelFormState, action);
        onChangeLabel?.(fromStateToLabel(newLabelFromState));
    },[dispatch, labelFormState, onChangeLabel]);

    const onPressAdd = React.useCallback( async () => {
        try {
            setButtonMode('loading');

            const label = fromStateToLabel(labelFormState);
            const newLabel = await addLabel(label);
            dispatchLabelForm({type: FormActionKind.UPDATE_ALL, payload: createInitialLabel(newLabel)});
            setOriginalLabel(newLabel);
            onAddLabel?.(newLabel);

            setButtonMode('added');
        } catch (e) {
            console.error(e);
            await alert({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while adding label!',
            });

            setButtonMode('add');
        }
    }, [setButtonMode, labelFormState, onAddLabel, addLabel, dispatchLabelForm, setOriginalLabel, alert]);

    const onPressUpdate = React.useCallback( async () => {
        try {
            setButtonMode('loading');

            const label = fromStateToLabel(labelFormState);
            // const oldLabel = await getLabelById(label._id);
            const newLabel = await updateLabel(label);
            dispatchLabelForm({type: FormActionKind.UPDATE_ALL, payload: createInitialLabel(newLabel)});
            setOriginalLabel(newLabel);
            onUpdateLabel?.(newLabel);

            setButtonMode('edited');
        } catch (e) {
            console.error(e);
            await alert({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while updating label!',
            });
            setButtonMode('edit');
        }
    }, [setButtonMode, labelFormState, onUpdateLabel, updateLabel, dispatchLabelForm, setOriginalLabel, alert]);

    const onPressCancel = React.useCallback(async () => {
        return onCancel?.(fromStateToLabel(labelFormState), isEdited, alert);
    }, [onCancel, alert, labelFormState, isEdited]);

    const onChangeName = React.useCallback( async (name: string) => {
        dispatchLabelForm({type: FormActionKind.UPDATE_TEXT, payload: {field: 'name', value: name}});
    }, [dispatchLabelForm]);

    const onChangeColor = React.useCallback( async (color?: string) => {
        if (!color) {
            dispatchLabelForm({type: FormActionKind.DELETE_ELEMENT, payload: {field: 'color'}});
            return;
        }
        dispatchLabelForm({type: FormActionKind.UPDATE_TEXT, payload: {field: 'color', value: color}});
    }, [dispatchLabelForm]);

    React.useImperativeHandle(ref, () => ({
        close: onPressCancel,
    }), [onPressCancel]);

    React.useEffect(() => {
        if (!visible) {return }
        setButtonMode(mode);
        if (labelId) {
            getLabelById(labelId).then(label => {
                setOriginalLabel(label);
                dispatchLabelForm({type: FormActionKind.UPDATE_ALL, payload: createInitialLabel(label)});
            });
        } else {
            dispatchLabelForm({type: FormActionKind.UPDATE_ALL, payload: createInitialLabel()});
        }
    }, [labelId, mode, visible]);

    const checkIsEdited = debounce(() => {
        const _isEdited = buttonMode == 'add'
            ? !isLabelStateEmpty(labelFormState)
            : !!originalLabel && !isStateOfLabel(labelFormState, originalLabel) ;
        setIsEdited(_isEdited);
        if (_isEdited && (buttonMode === 'added' || buttonMode === 'edited')) {
            setButtonMode('edit');
        }
    }, 300);

    React.useEffect(() => {
        if (mode === 'edit' && !originalLabel) { return }
        checkIsEdited();
    }, [labelFormState]);

    return (
        <BaseModal isVisible={visible} hasBackdrop={true} avoidKeyboard={true}
                   animationIn={'fadeInUpBig'} animationInTiming={500} animationOut={'fadeOutDownBig'} animationOutTiming={500}
                   onModalHide={onModalHide} onModalWillHide={onModalWillHide} onModalShow={onModalShow} onModalWillShow={onModalWillShow}

                   customBackdrop={<Overlay onPress={onPressCancel} background={'highOpacity'}/>}
        >
            <KeyboardDismissableView>
                {/* Modal parts */}
                <View style={[styles.modalContainer, {backgroundColor: colors.card}]}>
                        
                    {/* Add/Edit and Close Buttons */}
                    <View style={[styles.buttonsContainer]}>
                        <ModalButton mode={buttonMode}
                                     isDisabled={!isEdited} size={sizeButton}
                                     onPress={{add: onPressAdd, edit: onPressUpdate}}
                        />

                        <Pressable  onPress={onPressCancel} hitSlop={6}>
                            <Icon name="window-close" size={sizeButton} color={colors.text} library='MaterialCommunityIcons'/>
                        </Pressable>
                    </View>

                    {/* Labels Parts  */}
                    <TextInput style={[styles.label, {color: colors.text}]} multiline={true}
                                onChangeText={onChangeName} value={labelFormState.name}/>
                    <View style={[styles.decorationLine, {backgroundColor: colors.border}]}></View>

                    {/* List of colors */}
                    <View style={[styles.colorsContainer]}>
                        {Colors.listColor.map((color, index) => (
                            <ColorSelect key={index} color={color}
                                        selectedColor={labelFormState.color}
                                        onPress={() => onChangeColor(color)}/>
                        ))}
                        <ColorSelect key={-1} color={colors.background}
                                     selectedColor={labelFormState.color}
                                    onPress={() => onChangeColor(undefined)}/>
                    </View>
                </View>

                {
                    alertProps &&
                    <AlertModal
                        {...alertProps}
                        visible={modalVisible}
                    />
                }

            </KeyboardDismissableView>
        </BaseModal>
    )
});

export default LabelModal;

const styles = StyleSheet.create({
    container: {
        ...Bases.centerItem.all,
        ...Layouts.screen,
    },
    modalContainer: {
        width: '90%',
        alignSelf: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: Outlines.borderRadius.large,
        overflow: 'hidden',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent:'flex-end',
        gap: 20,
    },
    label: {
        ...Typography.subheader.x40,
    },
    decorationLine: {
        width: '100%',
        height: 1,
        marginTop: 8,
    },
    colorsContainer: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems: 'center',
    }
});