import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {InfinityList} from "../../components";
import dayjs from "dayjs";
import {LayoutProvider} from "recyclerlistview";

const CalendarScreen : React.FC = () => {

    const defaultMonth = React.useMemo( () => dayjs().startOf('month'), [] );
    const refData = React.useRef<any[]>([]);

    const getData = (previousData: any[] | null, position: 'start' | 'end' = 'start') => {
        if (previousData === null) {
            const data = Array.from({length: 20}, (_, i) => ({month: defaultMonth.add(i + 1, 'month')}));
            refData.current = data;
            return data;
        }
        if (position === 'end') {
            const toConcat = Array.from({length: 5}, (_, i) => ({month: previousData[0].month.subtract(i + 1, 'month')}))
            const newData = toConcat.reverse().concat(previousData);
            refData.current = newData;
            return newData;
        }
        if (position === 'start') {
            const toConcat = Array.from({length: 5}, (_, i) => ({month: previousData[previousData.length - 1].month.add(i+1, 'month')}))
            const newData = previousData.concat(toConcat);
            refData.current = newData;
            return newData;
        }
        return [];
    }

    const layoutProvider = React.useMemo( () => new LayoutProvider(
        index => 0,
        (_, dim) => {
            dim.width = 200;
            dim.height = 200;
        }
    ), []);

    const rowRenderer = React.useCallback( (type: string | number, data: any) => {
        return (
            <View style={{width: 200, height: 200, backgroundColor: 'green'}}>
                <Text>{data.month.format('MMMM YYYY')}</Text>
            </View>
        )
    }, []);

    const getStableId = React.useCallback( (index: number) => {
        return refData.current[index].month.format('YYYY-MM');
    } , [refData.current]);

    return (
        <View style={styles.container}>
            <View style={{width: 200, height: 200}}>
                <InfinityList
                    getData={getData}
                    layoutProvider={layoutProvider}
                    rowRenderer={rowRenderer}
                    getStableId={getStableId}

                    isHorizontal={true}
                    pagingEnabled={true}

                    onFrontReachedThreshold={400}
                    onEndReachedThreshold={400}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});

export default CalendarScreen;