import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import {
    CoreBridge, TenTapStartKit,
    RichText,
    useEditorBridge, defaultEditorTheme,
    ImageBridge,
    editorHtml,
} from '@10play/tentap-editor';
import { useTheme } from '@react-navigation/native';
import { Typography } from '../../styles';
// Components
import { convertReactNativeStyleToCSS } from "../../utils/baseUtil";

type TextareaProps = {
    value: string;
    containerStyle?: ViewStyle;
    textEditorStyle?: TextStyle;
    numberOfLines?: number; // New prop
};

const Textarea: React.FC<TextareaProps> = ({
                                               value,
                                               containerStyle,
                                               textEditorStyle,
                                               numberOfLines = 3, // Default number of lines
                                           }) => {
    const { colors } = useTheme();

    const customCss = `
    ${Typography.fontStyleSheets.AleoFont}
    * {
        background-color: ${colors.card};
        color: ${colors.text};
        font-family: 'Aleo';
        text-align: justify;
        text-justify: inter-word;
        ${convertReactNativeStyleToCSS(textEditorStyle)[1]}
    }
    }
    img {
        width: 90%;
    }`;

    const editor = useEditorBridge({
        customSource: editorHtml,
        initialContent: value,
        avoidIosKeyboard: false,
        bridgeExtensions: [
            ...TenTapStartKit,
            CoreBridge.configureCSS(customCss),
            ImageBridge.configureExtension({
                inline: true,
                allowBase64: true,
            }),
        ],
        theme: {
            ...defaultEditorTheme,
            webview: {
                backgroundColor: colors.card,
            },
        },
    });

    const _containerStyle = {
        maxHeight: numberOfLines * ( textEditorStyle?.lineHeight ? textEditorStyle?.lineHeight * 1.2 : 20 ),
    }

    React.useEffect(() => {
        editor.setContent(value);
    }, [value]);

    return (
        <View style={[styles.textEditorContainer, _containerStyle, containerStyle]} pointerEvents={'none'}>
            <RichText
                editor={editor}
                allowFileAccess={true}
                allowFileAccessFromFileURLs={true}
                mixedContentMode='always'
            />
        </View>
    );
};

export default Textarea;

const styles = StyleSheet.create({
    textEditorContainer: {
        width: '100%',
        height: '100%',
    },
    editor: {
        paddingVertical: 10,
        width: '100%',
        height: '86%',
    },
    toolbar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
});
