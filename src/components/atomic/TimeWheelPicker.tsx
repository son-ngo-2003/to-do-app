import React from "react";
import {View, Text, TextStyle, ScrollView, FlatList, FlatListProps, StyleSheet, ViewStyle} from "react-native";
import * as Haptics from 'expo-haptics';
import WheelPicker from 'react-native-wheely';

type DateWheelPickerType = {
    initialTime?: {hour?: number, minute?: number, second?: number};
    timeMode?: '12h' | '24h';
    withSecond?: boolean;
    onChangeTime?: (time: {hour: number, minute: number, second?: number}) => void;

    wrapperHeight?: number;
    itemHeight?: number;
    itemTextStyle?: TextStyle;
    selectedIndicatorStyle?: ViewStyle;
}

const TimeWheelPicker: React.FC<DateWheelPickerType> = ({
    initialTime,
    timeMode = '24h',
    withSecond = false,
    onChangeTime,

    wrapperHeight = 70,
    itemHeight = 30,
    itemTextStyle,
    selectedIndicatorStyle,
}) => {
    const [time, setTime] = React.useState({
        hour: initialTime?.hour ?? (new Date()).getHours(),
        minute: initialTime?.minute ?? (new Date()).getMinutes(),
        ...(withSecond ? {second: initialTime?.second ?? (new Date()).getSeconds()} : {}),
    });

    const numberOfHours = React.useMemo(() => timeMode === '12h' ? 12 : 24, [timeMode]);
    const hoursData = React.useMemo(() => Array.from({length: numberOfHours}, (_, i) => (i < 10 ? '0' : '')+(i).toString()), [numberOfHours]);
    const minutesData = React.useMemo(() => Array.from({length: 60}, (_, i) => (i < 10 ? '0' : '')+(i).toString()), []);
    const secondsData = React.useMemo(() => Array.from({length: 60}, (_, i) => (i < 10 ? '0' : '')+(i).toString()), []);

    const viewableItemIndex = React.useRef<number | null>(null);

    const onViewableItemsChanged : FlatListProps<any>['onViewableItemsChanged'] = ({ viewableItems })  => {
        if (viewableItems.length > 0) {
            const newViewableIndex = viewableItems[0].index; // Get the index of the first visible item

            // Trigger vibration only if the viewable item has changed
            if (newViewableIndex !== viewableItemIndex.current) {
                viewableItemIndex.current = newViewableIndex;
                Haptics.selectionAsync();
            }
        }
    };

    return (
        <View style={[{height: wrapperHeight}, styles.container]}>
            <WheelPicker
                selectedIndex={time.hour % numberOfHours}
                options={hoursData}
                onChange={(index) => {
                    const newHour = timeMode === '12h' ? (time.hour >= 12 ? index + 12 : index) : index;
                    setTime({...time, hour: newHour});
                    onChangeTime?.({...time, hour: newHour});
                }}

                visibleRest={1}
                itemHeight={itemHeight}
                itemTextStyle={itemTextStyle}
                selectedIndicatorStyle={selectedIndicatorStyle}
                flatListProps={{
                    onViewableItemsChanged,
                }}
            />

            <Text style={[itemTextStyle, {textAlign: "center"}]}>:</Text>

            <WheelPicker
                selectedIndex={time.minute}
                options={minutesData}
                onChange={(index) => {
                    setTime({...time, minute: index});
                    onChangeTime?.({...time, minute: index});
                }}

                visibleRest={1}
                itemHeight={itemHeight}
                itemTextStyle={itemTextStyle}
                selectedIndicatorStyle={selectedIndicatorStyle}
                flatListProps={{
                    onViewableItemsChanged,
                }}
            />

            {
                withSecond && time.second &&
                <>
                    <Text style={[itemTextStyle, {textAlign: "center"}]}>:</Text>
                    <WheelPicker
                        selectedIndex={time.second}
                        options={secondsData}
                        onChange={(index) => {
                            setTime({...time, second: index});
                            onChangeTime?.({...time, second: index});
                        }}

                        visibleRest={1}
                        itemHeight={itemHeight}
                        itemTextStyle={itemTextStyle}
                        selectedIndicatorStyle={selectedIndicatorStyle}
                        flatListProps={{
                            onViewableItemsChanged,
                        }}
                    />
                </>
            }

            {
                timeMode === '12h' &&
                <WheelPicker
                    selectedIndex={time.hour >= 12 ? 1 : 0}
                    options={['AM', 'PM']}
                    onChange={(index) => {
                        if ((index === 0) && (time.hour >= 12)) {
                            const newHour = time.hour - 12;
                            setTime({...time, hour: newHour});
                            onChangeTime?.({...time, hour: newHour});
                        }
                        else if ((index === 1) && (time.hour < 12)) {
                            const newHour = time.hour + 12;
                            setTime({...time, hour: newHour});
                            onChangeTime?.({...time, hour: newHour});
                        }
                    }}

                    visibleRest={1}
                    itemHeight={itemHeight}
                    itemTextStyle={itemTextStyle}
                    selectedIndicatorStyle={selectedIndicatorStyle}
                    flatListProps={{
                        onViewableItemsChanged,
                    }}
                />
            }
        </View>
    )
}

export default TimeWheelPicker;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        alignItems: 'center',
    }
})