import { Icon } from 'react-native-vector-icons/Icon';

type RouteName = 'Home' | 'Notes' | 'Labels';
export {
    type RouteName,
}

export const listRouteNames : RouteName[] = ['Home', 'Notes', 'Labels'];

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
}

export {default as HomeScreen} from './Home';
export {default as NotesScreen} from './Notes';
export {default as LabelsScreen} from './Labels';