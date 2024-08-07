import React from 'react';
import { ViewStyle } from 'react-native';
import {   
    type EditorBridge,
} from '@10play/tentap-editor';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

//components
import { ListModal, Icon,
        type ListModalDataType
} from '../atomic';

type InsertToolListProps = {
    editor: EditorBridge,
    style: ViewStyle,
    onPressOverlay: () => void,
}

const InsertToolList : React.FC<InsertToolListProps> = ({
    editor,
    style,
    onPressOverlay,
}) => {
    const { colors } = useTheme();
 
    const pickImage = async () => {
        const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!status.granted) {
            //TODO: show error message not permissions granted    
            return null;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            allowsMultipleSelection: false, //TODO: Maybe can update later so can upload multiple
            //aspect: [4, 3],
            quality: 1,
            base64: true,
        });
    
        if (!result.canceled) {
            return result.assets[0].base64;
        }
    };

    const takePhoto = async () => {
        const status = await ImagePicker.requestCameraPermissionsAsync();
        if (!status.granted) {
            //TODO: show error message not permissions granted    
            return null;
        }
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            allowsMultipleSelection: false, //TODO: Maybe can update later so can upload multiple
            //raspect: [4, 3],
            quality: 1,
            base64: true,
        });
    
        if (!result.canceled) {
            return result.assets[0].base64;
        }
      };



    const sizeIcon = 25;
    const colorIcon = colors.text;
    const dataList : ListModalDataType[] =[
        {
            label: 'From gallery',
            icon: <Icon name='image-outline' size={sizeIcon} library='Ionicons' color={colorIcon}/>,
            onPress: async () => {
                let image = await pickImage();
                image && editor.setImage(`data:image/jpeg;base64,` + image);
            },
        },
        {
            label: 'Take photo',
            icon: <Icon name='camera-outline' size={sizeIcon} library='Ionicons' color={colorIcon}/>,
            onPress: async () => {
                let image = await takePhoto();
                image && editor.setImage(`data:image/jpeg;base64,` + image);
            },
        },
        {
            label: 'Quote',
            icon: <Icon name='format-quote-close' size={sizeIcon} library='MaterialCommunityIcons' color={colorIcon}/>,
            onPress: () => {editor.toggleBlockquote()},
        },

    ]

    return (
        <>
            <ListModal
                dataList={dataList}
                containerStyle={style}
                typeOverlay='transparent'
                onPressOverlay={onPressOverlay}
            />
        </>
    )
}

export default InsertToolList;