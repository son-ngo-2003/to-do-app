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
import {ActivityIndicator} from "react-native";

type IconProps = {
    name: string,
    size: number,
    color: string,
    library: string,
}

const ActivityIndicatorWithSize = (size: number, color: string) => {
    if (size < 30) {
        return <ActivityIndicator size="small" color={color}
            style={{transform: [{scale: size / 20.0}]}} // 20 is the default size of small ActivityIndicator
        />;
    } else {
        return <ActivityIndicator size="large" color={color}
            style={{transform: [{scale: size / 36.0}]}} // 36 is the default size of large ActivityIndicator
        />;
    }
}

const Icon : React.FC<IconProps> = ({name, size, color, library}) => {
    if (name === 'ActivityIndicator') {
        return ActivityIndicatorWithSize(size, color);
    }

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