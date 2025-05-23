import React from 'react';
import {View, StyleSheet, LayoutChangeEvent, ViewStyle, TextStyle} from 'react-native';
import {
    CoreBridge, PlaceholderBridge, TenTapStartKit,
    RichText, Toolbar,
    useEditorBridge, defaultEditorTheme,
    ImageBridge,
    EditorBridge, editorHtml,
} from '@10play/tentap-editor';
import { useTheme } from '@react-navigation/native';

import { Layouts, Typography } from '../../styles';
import { ToolbarItems } from './toolbarActions';
import { toolbarTheme, darkToolbarTheme } from './toolbarTheme';

//components
import InsertToolList from './InsertToolList';
import ColorToolList from './ColorToolList';
import {eventEmitter, EventNames} from "../../utils/eventUtil";
import {convertReactNativeStyleToCSS} from "../../utils/baseUtil";


type ListToolModalType = 'none' | 'insert' | 'color';

type TextEditorProps = {
    autofocus?: boolean;
    placeholder?: string;
    onChange?: (editor: EditorBridge) => void;
    showToolbar?: boolean;
    enableEdit?: boolean;
    initialContentHtml?: string;
    containerStyle?: ViewStyle;
    textEditorStyle?: TextStyle;
}

const TextEditor : React.FC<TextEditorProps> = ({
    autofocus = false, 
    placeholder= 'Write something ...',
    onChange,
    showToolbar= true,
    enableEdit= true,
    initialContentHtml,

    containerStyle,
    textEditorStyle,
}) => {
    const [ showToolModal, setShowToolModal ] = React.useState<ListToolModalType>('none');
    const { dark, colors } = useTheme();
    
    const [ toolbarPos, setToolBarPos ] = React.useState<{x: number, y: number}>({x: 0, y: 0})
    const toolbarRef = React.useRef<View>(null);

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
    img {
        width: 90%;
    }`;

    const editor = useEditorBridge({
        customSource: editorHtml,
        autofocus,
        initialContent: initialContentHtml,
        avoidIosKeyboard: false,
        bridgeExtensions: [
            ...TenTapStartKit,
            CoreBridge.configureCSS(customCss),
            ImageBridge.configureExtension({
                inline: true,
                allowBase64: true,
            }),
            PlaceholderBridge.configureExtension({
                placeholder,
            }),
        ],
        theme: {
            ...defaultEditorTheme,
            webview: {
                backgroundColor: colors.card,
            },
            toolbar: dark ? darkToolbarTheme : toolbarTheme,
        },
        onChange: () => {onChange?.(editor)},
    });

    const getLayoutToolbar = (_event: LayoutChangeEvent) => {
        //const {width, height} = event.nativeEvent.layout;
        setTimeout(() => { //wait until finish transition of modal
            toolbarRef.current?.measureInWindow((pagex, pagey) => {
                setToolBarPos({x: pagex, y: pagey});
            });
        }, 300);
    }

    //change tool in toolbar
    ToolbarItems[2] = { //plus tool
        ...ToolbarItems[2],
        onPress: () => () => { setShowToolModal('insert');},
        active: ({}) => showToolModal === 'insert',
    }
    ToolbarItems[3] = { //color tool
        ...ToolbarItems[3],
        onPress: () => () => { setShowToolModal('color');},
        active: ({}) => showToolModal === 'color',
    }

    React.useEffect(() => {
        const eventListener = eventEmitter.on(EventNames.DismissKeyboard, () => {
            editor.blur();
        });
        return () => {
            eventEmitter.remove(EventNames.DismissKeyboard, eventListener);
        }
    }, []);

    return (
        <View style={ [styles.textEditorContainer, containerStyle] } pointerEvents={enableEdit ? 'auto' : 'none'}>
            <View style = { styles.editor}>
                <RichText
                    editor={editor}
                    allowFileAccess={true}
                    allowFileAccessFromFileURLs={true}
                    mixedContentMode='always'
                />
            </View>

            <View style={[styles.toolbar]}>
                <View ref={toolbarRef} onLayout={getLayoutToolbar}>
                    <Toolbar editor={editor} hidden={!showToolbar}
                            items={ToolbarItems}/>
                </View>

                {   showToolModal === 'insert' &&
                    <InsertToolList
                        editor={editor}
                        style={{ bottom: Layouts.screen.height - toolbarPos.y - 1,
                                    left: toolbarPos.x + 50}}
                        onPressOverlay={() => setShowToolModal('none')}
                    />  }

                {   showToolModal === 'color' &&
                    <ColorToolList
                        editor={editor}
                        style={{ bottom: Layouts.screen.height - toolbarPos.y - 1,
                                    left: toolbarPos.x + 100}}
                        onPressOverlay={() => setShowToolModal('none')}
                    />
                }
            </View>
        </View>
    )
}

export default TextEditor;

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