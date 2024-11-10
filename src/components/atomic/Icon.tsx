import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import FontAwesome from'react-native-vector-icons/FontAwesome';
import FontAwesome5 from'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from'react-native-vector-icons/FontAwesome6';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Feather from 'react-native-vector-icons/Feather'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import React from "react";

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
        case 'MaterialIcons':
            return <MaterialIcons name={name} size={size} color={color} />;
        case 'MaterialCommunityIcons':
            return <MaterialCommunityIcons name={name} size={size} color={color} />;
        case 'Octicons':
            return <Octicons name={name} size={size} color={color} />;
        case 'FontAwesome':
            return <FontAwesome name={name} size={size} color={color} />;
        case 'FontAwesome5':
            return <FontAwesome5 name={name} size={size} color={color} />;
        case 'FontAwesome6':
            return <FontAwesome6 name={name} size={size} color={color} />;
        case 'SimpleLineIcons':
            return <SimpleLineIcons name={name} size={size} color={color} />;
        case 'Feather':
            return <Feather name={name} size={size} color={color} />;
        default:
            return <Ionicons name={name} size={size} color={color} />;
    }
}

export default Icon;