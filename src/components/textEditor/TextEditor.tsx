import React from 'react';
import { View, StyleSheet, LayoutChangeEvent, } from 'react-native';
import { CoreBridge, PlaceholderBridge, TenTapStartKit, 
        RichText, Toolbar, 
        useEditorBridge, defaultEditorTheme,
        ImageBridge,
        EditorBridge,
} from '@10play/tentap-editor';
import { useTheme } from '@react-navigation/native';

import { Layouts, Typography } from '../../styles';
import { ToolbarItems } from './toolbarActions';
import { toolbarTheme, darkToolbarTheme } from './toolbarTheme';

//components
import InsertToolList from './InsertToolList';
import ColorToolList from './ColorToolList';


type ListToolModalType = 'none' | 'insert' | 'color';

type TextEditorProps = {
    autofocus?: boolean;
    placeholder?: string;
    onChange?: (editor: EditorBridge) => void;
    showToolbar?: boolean;
    enableEdit?: boolean;
}

const TextEditor : React.FC<TextEditorProps> = ({
    autofocus = false, 
    placeholder='Write something ...', 
    onChange=()=>{}, 
    showToolbar=true,
    enableEdit=true,
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
    }
    img {
        width: 90%;
    }`;

    const editor = useEditorBridge({
        autofocus,
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
            toolbar: dark ? darkToolbarTheme : toolbarTheme,
        },
        onChange: () => {onChange(editor)},
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
        onPress: () => () => { setShowToolModal('color'); console.log(123)},
        active: ({}) => showToolModal === 'color',
    }

    return (
        <View style={ styles.textEditorContainer } pointerEvents={enableEdit ? 'auto' : 'none'}>
            <View style = { styles.editor}>
                <RichText editor={editor} 
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