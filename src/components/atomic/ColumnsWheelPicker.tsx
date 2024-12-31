import React, {Fragment} from "react";
import {View, Text, TextStyle, FlatListProps, StyleSheet, ViewStyle} from "react-native";
import * as Haptics from 'expo-haptics';
import WheelPicker from 'react-native-wheely';

type OneColumnData = string[];

type ColumnsWheelPickerType = {
    columnsData: OneColumnData[]; // Array of column data (Column Data is an array of string)
    selectedIndexes?: number[]; // Array of selected index of each column, if each column has no selected index, set to default value 0
    onChange?: (newIndexes: number[], changedColumn: number, newColumnValue: string) => void;
    separator?: string; // Seperator between columns

    gapSize?: number;
    wrapperHeight?: number;
    itemHeight?: number;
    itemTextStyle?: TextStyle;
    selectedIndicatorStyle?: ViewStyle;
}

const ColumnsWheelPicker: React.FC<ColumnsWheelPickerType> = ({
    columnsData,
    selectedIndexes,
    onChange,
    separator = ':',

    gapSize,
    wrapperHeight = 70,
    itemHeight = 30,
    itemTextStyle,
    selectedIndicatorStyle,
}) => {

    const indexesSelected = React.useRef<number[]>(selectedIndexes ?? columnsData.map(() => 0));
    const viewableItemIndex = React.useRef<number | null>(null);

    const onChangeValue = React.useCallback((columnIndex: number, newIndex: number) => {
        indexesSelected.current[columnIndex] = newIndex;
        onChange?.(indexesSelected.current, columnIndex, columnsData[columnIndex][newIndex]);
    }, [onChange, indexesSelected.current, columnsData]);

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

    React.useEffect(() => {

    });

    return (
        <View style={[{height: wrapperHeight, gap: gapSize}, styles.container]}>
            {columnsData.map((columnData, columnIndex) => (
                <Fragment key={columnIndex}>
                    <WheelPicker
                        selectedIndex={indexesSelected.current[columnIndex] ?? 0}
                        options={columnData}
                        onChange={(index) => onChangeValue?.(columnIndex, index)}

                        visibleRest={Math.floor(wrapperHeight / itemHeight / 2)}
                        itemHeight={itemHeight}
                        itemTextStyle={itemTextStyle}
                        selectedIndicatorStyle={selectedIndicatorStyle}
                        flatListProps={{
                            onViewableItemsChanged,
                        }}
                    />
                    {columnIndex < columnsData.length - 1 && <Text style={[itemTextStyle, {textAlign: "center"}]}>{separator}</Text>}
                </Fragment>
            ))}
        </View>
    )
}

export default ColumnsWheelPicker;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
})