import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';

//components
import { Layouts, Outlines, Typography } from '../../../styles';
import { MONTH_NAME_FULL } from '../constants';
import { Icon, ListModal, type ListModalDataType } from '../../atomic';
import { type ScrollType } from '../type';
import {type CalendarMode, type MixCalendarListProps} from "./MixCalendarList";


type CalendarListProps = {
    selectDateString: string,
    currentMonth: number,
    currentYear: number,

    onPressLeft: () => void,
    onPressRight: () => void,

    calendarModes : CalendarMode[]
    initialModeIndex: number,
    setCalendarMode?: (mode: CalendarMode) => void,
    setNumberOfDays?: (num: number) => void,

    canScroll?: ScrollType
}

const CalendarListHeader: React.FC<CalendarListProps> = ({
    selectDateString,
    currentMonth,
    // currentYear,

    onPressLeft = () => {},
    onPressRight = () => {},

    calendarModes,
    initialModeIndex,
    setCalendarMode,

    canScroll = {left: true, right: true},
}) => {
    const { colors } = useTheme();

    const [ modalPosition, setModalPosition ] = React.useState({top: 0, right: 0});
    const [ currentIndex, setCurrentIndex ] = React.useState( initialModeIndex );
    const [ isShowModal, setIsShowModal ] = React.useState(false);

    const getModalDataByMode = React.useCallback((mode: CalendarMode, index: number) : ListModalDataType => {
        const onPress = () => {
            setCalendarMode && setCalendarMode(mode);
            setCurrentIndex(index)
        }
        if (mode === 'day' || mode === 1)
            return ({
                label: 'View By Day',
                icon: <Icon name="view-day-outline" size={20} color={colors.text} library='MaterialCommunityIcons'/>,
                showIfFocused: true,
                onPress,
            })

        if (mode === 'weekdays')
            return  ({
                label: 'View By Weekdays',
                icon: <Icon name="numeric-5-box-outline" size={20} color={colors.text} library='MaterialCommunityIcons'/>,
                showIfFocused: true,
                onPress,
            })

        if (mode === 'week' || mode === 7)
            return  ({
                label: 'View By Week',
                icon: <Icon name="numeric-7-box-outline" size={20} color={colors.text} library='MaterialCommunityIcons'/>,
                showIfFocused: true,
                onPress,
            })

        if (mode === 'calendar' || mode === 'month')
            return  ({
                label: 'View By Month',
                icon: <Icon name="calendar-view-month" size={20} color={colors.text} library='MaterialIcons'/>,
                showIfFocused: true,
                onPress,
            })

        return  ({
            label: `View By ${mode} Days`,
            icon: <Icon name="text-box-outline" size={20} color={colors.text} library='MaterialCommunityIcons'/>,
            showIfFocused: true,
            onPress,
        })

    }, [colors.text, setCalendarMode, setCurrentIndex]);

    return (
        <View style={[styles.customHeader ]}>
            <Animated.View style={[styles.info]} entering={FadeIn}>
                <Text style={[Typography.header.x50,
                    {color: colors.text}]}
                >{MONTH_NAME_FULL[currentMonth]}</Text>

                <Text style={[Typography.subheader.x40,
                        {color: colors.text, opacity: 0.5}]}
                >{selectDateString}</Text>
            </Animated.View>

            <View style={[styles.buttonsContainer]}>
                <TouchableOpacity onPress={onPressLeft}
                    disabled={!canScroll.left}
                    style={{opacity: canScroll.left ? 1 : 0.3}}
                >
                    <Icon name="chevron-left" size={20} color={colors.text} library='FontAwesome5'/>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={onPressRight}
                    disabled={!canScroll.right}
                    style={{opacity: canScroll.right ? 1 : 0.3}}
                >
                    <Icon name="chevron-right" size={20} color={colors.text} library='FontAwesome5'/>
                </TouchableOpacity>
                {
                    calendarModes.length > 1 && (
                        <TouchableOpacity onPress={() => setIsShowModal(!isShowModal)}
                            onLayout={(event) => {
                                event.target.measure((x, y, width, height, pageX, pageY) => {
                                    setModalPosition({top: pageY, right: Layouts.screen.width - pageX - width});
                                });
                            }}
                        >
                            <Icon name="list" size={28} color={colors.text} library='Entypo'/>
                        </TouchableOpacity>
                    )
                }
            </View>

            <ListModal
                dataList={calendarModes.map( (mode, index) => getModalDataByMode(mode, index))}
                currentIndex={currentIndex}
                onPressItem={(index) => setCurrentIndex(index)}
                onPressOverlay={() => setIsShowModal(false)}
                visible={isShowModal}
                typeOverlay={"lowOpacity"}
                containerStyle={ {...modalPosition, borderRadius: Outlines.borderRadius.large} }
            />
        </View>
    )
}

export default CalendarListHeader;

const styles = StyleSheet.create({
    customHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 4,
        width: '100%',
    },
    info: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    modalContainer: {

    }
});