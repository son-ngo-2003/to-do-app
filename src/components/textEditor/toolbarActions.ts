import { ToolbarItem, DEFAULT_TOOLBAR_ITEMS } from '@10play/tentap-editor';
import { Images } from '../../assets/images'

// According to git-hub-code of 10tap-editor:
// We get the ToolbarItem from DEFAULT_TOOLBAR_ITEMS:
const DefaultToolbarItems : Record< string, ToolbarItem > = {
    bold:           DEFAULT_TOOLBAR_ITEMS[0],
    italic:         DEFAULT_TOOLBAR_ITEMS[1],
    setLink:        DEFAULT_TOOLBAR_ITEMS[2],
    taskList:       DEFAULT_TOOLBAR_ITEMS[3],
    openHeading:    DEFAULT_TOOLBAR_ITEMS[4],
    code:           DEFAULT_TOOLBAR_ITEMS[5],
    underline:      DEFAULT_TOOLBAR_ITEMS[6],
    strike:         DEFAULT_TOOLBAR_ITEMS[7],
    blockquote:     DEFAULT_TOOLBAR_ITEMS[8],
    orderedList:    DEFAULT_TOOLBAR_ITEMS[9],
    bulletList:     DEFAULT_TOOLBAR_ITEMS[10],
    indent:         DEFAULT_TOOLBAR_ITEMS[11],
    outdent:        DEFAULT_TOOLBAR_ITEMS[12],
    undo:           DEFAULT_TOOLBAR_ITEMS[13],
    redo:           DEFAULT_TOOLBAR_ITEMS[14],
}

export const ToolbarItems : ToolbarItem[] = [


    DefaultToolbarItems.undo,
    DefaultToolbarItems.redo,

    // Insert: Image, setLink, code,
    {   //insert tool, will overide after in TextEditor component
        onPress: ({}) => () => {},
        active: ({}) => false,
        disabled: ({}) => false,
        image: () => Images.plusTool,
    }, 

    {   //color tool, will overide after in TextEditor component
        onPress: ({}) => () => {},
        active: ({}) => false,
        disabled: ({}) => false,
        image: () => Images.colorTool,
    },
    DefaultToolbarItems.openHeading,

    DefaultToolbarItems.bold,
    DefaultToolbarItems.italic,
    DefaultToolbarItems.underline,
    DefaultToolbarItems.strike,
    DefaultToolbarItems.setLink,

    DefaultToolbarItems.taskList,
    DefaultToolbarItems.orderedList,
    DefaultToolbarItems.bulletList,
    DefaultToolbarItems.indent,
]

