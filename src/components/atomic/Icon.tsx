import { checkIfConfigIsValid } from 'react-native-reanimated/lib/typescript/reanimated2/animation/springUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type IconProps = {
    name: string,
    size: number,
    color: string,
    library: string,
}
const Icon : React.FC<IconProps> = ({name, size, color, library}) => {
    switch (library) {
        case 'Ionicons':
            return <Ionicons name={name} size={size} color={color} />;
        case 'MaterialCommunityIcons':
            return <MaterialCommunityIcons name={name} size={size} color={color} />;
        default:
            return <Ionicons name={name} size={size} color={color} />;
    }
}

export default Icon;