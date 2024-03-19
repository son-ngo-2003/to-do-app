import { checkIfConfigIsValid } from 'react-native-reanimated/lib/typescript/reanimated2/animation/springUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import FontAwesome5 from'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from'react-native-vector-icons/FontAwesome6';

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
        case 'Octicons':
            return <Octicons name={name} size={size} color={color} />;
        case 'FontAwesome5':
            return <FontAwesome5 name={name} size={size} color={color} />;
        case 'FontAwesome6':
            return <FontAwesome6 name={name} size={size} color={color} />;
        default:
            return <Ionicons name={name} size={size} color={color} />;
    }
}

export default Icon;