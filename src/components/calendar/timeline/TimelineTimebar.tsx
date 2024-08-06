import * as React from 'react';
import { useTheme } from '@react-navigation/native';
import { View, StyleSheet, Text } from 'react-native';

//constants
import {
    TIMELINE_TIME_BAR_WIDTH,
    START_HOUR, END_HOUR, TIMELINE_CELL_HEIGHT, CALENDAR_BODY_HEIGHT, TIMELINE_HEIGHT
} from '../constants';

//components
import {Outlines, Typography} from '../../../styles';
import {type TimelineProps} from "./Timeline";
import {SyncedScrollView} from "../../atomic";

interface TimelineTimebarProps {
    height?: TimelineProps['height']
    headerHeight?: number,
}

const TimelineTimebar : React.FC<TimelineTimebarProps> = ({
    height = CALENDAR_BODY_HEIGHT,
    headerHeight = 20,
}) => {

    const { colors } = useTheme();
    const heightNumber = React.useMemo( () => {
        return typeof height === 'number' ? height : TIMELINE_HEIGHT[height];
    } , [height] );

    const renderTimeBar = React.useCallback<() => React.ReactNode>(() => {
        const cells : React.ReactNode[] = [];
        for (let i = START_HOUR + 1; i <= END_HOUR; i++) {
            cells.push(
                <Text   key={i}
                        style={[ styles.timeBarCell,
                                {...Typography.body.x10, color: colors.border, fontSize: 11}]}
                >{`${ i<10 ? '0'+i : i }:00`}</Text>
            )
        }
        return (
            <View style={{marginTop: TIMELINE_CELL_HEIGHT / 2 + 9}}
                    onStartShouldSetResponder={() => true}>
                {cells.map( cell => cell )}
            </View>
        )
    }, [colors.border]);

    return (
        <View style={[styles.timeBarContainer, {borderColor: colors.border}]}>
            <View style={[{height: headerHeight, borderColor: colors.border}, styles.timeBarHeader]} />
            <SyncedScrollView
                _id={0}
                style={[{maxHeight: heightNumber } ]}
                showsVerticalScrollIndicator={false}
            >
                {renderTimeBar()}
            </SyncedScrollView>
        </View>
    )
};

export default React.memo(TimelineTimebar);

const styles = StyleSheet.create({
    timeBarContainer: {
        width: TIMELINE_TIME_BAR_WIDTH,
        borderRightWidth: Outlines.borderWidth.thin,
    },
    timeBarCell : {
        height: TIMELINE_CELL_HEIGHT,
        backgroundColor: 'transparent',
        marginRight: 7,
    },
    timeBarHeader: {
        borderBottomWidth: Outlines.borderWidth.thin,
    }
});