export type RouteName = 'Home' | 'Notes' | 'Labels' | 'Calendar' | 'Tasks' | 'History' | 'Trash' | 'Search';

export const listRouteNames : RouteName[] = ['Home', 'Notes', 'Labels', 'Calendar', 'Tasks', 'History', 'Trash'];

type IconState = {
    library: string
    focused: string,
    normal: string,
}
export const listIcons : Record<RouteName, IconState> = {
    Home: {
        library: 'Ionicons',
        normal: 'home-outline',
        focused: 'home',
    },
    Notes: {
        library: 'MaterialCommunityIcons',
        normal: 'sticker-text-outline',
        focused: 'sticker-text',
    },
    Labels: {
        library: 'MaterialCommunityIcons',
        normal: 'tag-outline',
        focused: 'tag',
    },
    Calendar: {
        library: 'Ionicons',
        normal: 'calendar-outline',
        focused: 'calendar',
    },
    Tasks: {
        library: 'MaterialCommunityIcons',
        normal: 'checkbox-multiple-marked-outline',
        focused: 'checkbox-multiple-marked',
    },
    History: {
        library: 'MaterialCommunityIcons',
        normal: 'clock-check-outline',
        focused: 'clock-check',
    },
    Trash: {
        library: 'MaterialCommunityIcons',
        normal: 'trash-can-outline',
        focused: 'trash-can',
    },
    Search: {
        library: 'Octicons',
        normal: 'search',
        focused: 'search',
    }
}