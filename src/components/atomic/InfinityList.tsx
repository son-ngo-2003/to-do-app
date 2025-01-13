import {
    RecyclerListView, DataProvider, LayoutProvider,
    type RecyclerListViewProps
} from "recyclerlistview";
import * as React from "react";
import {useMemo, useRef} from "react";
import {NativeScrollEvent, NativeSyntheticEvent} from "react-native";
import {Dimension} from "recyclerlistview/src/core/dependencies/LayoutProvider";
import _, {debounce} from "lodash";
import {Layouts} from "../../styles";

export interface InfinityListProps
    extends Omit<RecyclerListViewProps, 'dataProvider' | 'layoutProvider' | 'rowRenderer' | 'initialRenderIndex' | 'onScroll' > {
    data: any[]
    reloadData: ( currentIndex: number ) => void;

    rowRenderer: RecyclerListViewProps['rowRenderer'];
    pageSize: { width: number, height: number };
    rowHasChangedFunc?: (r1: any, r2: any) => boolean;
    getStableId?: (index: number) => string;

    onFrontReached?: () => void;
    onFrontReachedThreshold?: number;

    onScroll?: (event: ScrollEvent, offsetX: number, offsetY: number, isScrolledByUser: boolean) => void;
    onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onMomentumScrollBegin?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    onChangePage?: (index: number) => void;

    pagingEnabled?: boolean;
    initialRenderIndex?: number | 'center';
    showIndicator?: boolean;
}

export interface ScrollEvent {
    nativeEvent: {
        contentOffset: {
            x: number,
            y: number,
        },
        layoutMeasurement?: Dimension,
        contentSize?: Dimension,
    };
}

const InfinityList = React.forwardRef<any, InfinityListProps>( (
    props,
    ref,
) => {
    const {
        data,
        reloadData,

        pageSize = Layouts.screen,
        rowHasChangedFunc,
        getStableId,
        rowRenderer,

        isHorizontal,
        pagingEnabled= false,

        onScroll,
        onFrontReached,
        onFrontReachedThreshold,
        onEndReached,
        onEndReachedThreshold,
        onChangePage,

        onMomentumScrollEnd,
        onMomentumScrollBegin,

        initialRenderIndex = 'center',
        showIndicator = true,
        ...rest
    } = props;

    const listRef = React.useRef(null)
    React.useImperativeHandle( ref, () => listRef.current, [listRef.current] )
    const debounceReloadData = useMemo(() => debounce(reloadData, 100, {leading: false, trailing: true}), [reloadData]);

    // Layout parts
    const _initialIndex = React.useMemo( () =>
            initialRenderIndex !== 'center' ? initialRenderIndex : Math.floor(data.length / 2)
    ,[initialRenderIndex, data.length])
    const currentIndex = useRef(_initialIndex);

    const layoutProvider = React.useMemo( () => new LayoutProvider(
        _index => 0,
        (_, dim) => {
            dim.width = pageSize.width;
            dim.height = pageSize.height;
        }
    ), [pageSize.width, pageSize.height]);

    // Data parts
    const dataProviderMaker = React.useMemo( () => new DataProvider(
        rowHasChangedFunc || ( (r1, r2) => r1 != r2 ),
        getStableId
    ), [rowHasChangedFunc, getStableId]);
    const lastData = useRef<any[]>([]);
    const dataProvider = React.useMemo( () => dataProviderMaker.cloneWithRows(data), [data] );

    React.useEffect( () => {
        let frontAdded = data.findIndex( (d) =>
            getStableId
                ? getStableId(d) === getStableId(lastData.current[0])
                : _.eq(d, lastData.current[0])
        );
        let indexToScroll = frontAdded !== -1 ? frontAdded + currentIndex.current : Math.floor(data.length / 2);
        const x = isHorizontal ? indexToScroll * pageSize.width : 0;
        const y = isHorizontal ? 0 : indexToScroll * pageSize.height;
        // @ts-ignore
        setTimeout(() => listRef.current?.scrollToOffset(x, y, false), 0);
        lastData.current = data;
    }, [data]);

    // Events parts
    const _onFrontReachedThreshold = useMemo( () => onFrontReachedThreshold || 0, [onFrontReachedThreshold] )
    // const _onEndReachedThreshold = useMemo( () => onEndReachedThreshold || 0, [onEndReachedThreshold] )
    // const isNearFrontEdge = useRef(false);
    // const isNearEndEdge = useRef(false);
    const isScrolledByUser = useRef(false);

    const _onScroll = React.useCallback( (event: ScrollEvent, offsetX: number, offsetY: number) => {
        debounceReloadData.cancel();

        const contentOffset = event.nativeEvent.contentOffset;
        const {x, y} = contentOffset;
        const newCurrentIndex = Math.floor( isHorizontal ? x / pageSize.width : y / pageSize.height );
        if (currentIndex.current !== newCurrentIndex) {
            currentIndex.current = newCurrentIndex;
            onChangePage?.(newCurrentIndex);
        }

        if ( (isHorizontal && x < _onFrontReachedThreshold) || (!isHorizontal && y < _onFrontReachedThreshold)) {
            onFrontReached?.();
        }

        onScroll?.(event, offsetX, offsetY, isScrolledByUser.current);
    }, [debounceReloadData, isHorizontal, pageSize.width, pageSize.height, onChangePage, _onFrontReachedThreshold, onFrontReached, onScroll] );

    const _onEndReached = React.useCallback( () => {
        onEndReached?.();
    }, [onEndReached] )

    const _onMomentumScrollEnd = React.useCallback( (event : NativeSyntheticEvent<NativeScrollEvent>) => {
        onMomentumScrollEnd?.(event);
        if (currentIndex.current < 2 || currentIndex.current >= data.length - 2) {
            reloadData(currentIndex.current);
        }
    }, [onMomentumScrollEnd, reloadData, data.length] )

    const onScrollBeginDrag = React.useCallback( () => {
        isScrolledByUser.current = true;
    }, [] );

    const onScrollEndDrag = React.useCallback( () => {
        isScrolledByUser.current = false
    }, [] );

    const scrollViewProps = React.useMemo( () => ({
        ...rest.scrollViewProps,
        pagingEnabled,
        onMomentumScrollBegin,
        onMomentumScrollEnd: _onMomentumScrollEnd,
        showsHorizontalScrollIndicator: showIndicator,
        showsVerticalScrollIndicator: showIndicator,
        onScrollBeginDrag,
        onScrollEndDrag,
    }), [pagingEnabled, rest.scrollViewProps, onMomentumScrollBegin, _onMomentumScrollEnd, showIndicator, onScrollBeginDrag, onScrollEndDrag])

    return (
        <RecyclerListView
            { ...rest }

            ref = { listRef }

            dataProvider={ dataProvider }
            layoutProvider={ layoutProvider }
            rowRenderer={ rowRenderer }

            initialRenderIndex={ _initialIndex }

            onScroll={_onScroll}
            onEndReached={ _onEndReached }
            onEndReachedThreshold={ onFrontReachedThreshold }

            isHorizontal={ isHorizontal }
            scrollViewProps={ scrollViewProps }
        />
    );
});

export default InfinityList;