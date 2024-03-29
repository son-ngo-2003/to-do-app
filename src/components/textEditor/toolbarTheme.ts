import { StyleSheet } from "react-native";
import type { ToolbarTheme } from "@10play/tentap-editor";
import { transform } from "@babel/core";
import { Colors } from "../../styles";

export const toolbarTheme: ToolbarTheme = {
  toolbarBody: {
    flex: 1,
    borderTopWidth: 0.5,
    borderBottomWidth: 0,
    borderTopColor: Colors.LightTheme.colors.border,

    backgroundColor: 'transparent',
    minWidth: '100%',
    height: 38,
  },
  toolbarButton: {
    paddingHorizontal: 5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconDisabled: {
    tintColor: '#CACACA',
  },
  iconWrapperDisabled: {
    opacity: 0.3,
  },
  iconWrapperActive: {
    backgroundColor: '#E5E5E5',
  },
  hidden: {
    display: 'none',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
  iconWrapper: {
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  icon: {
    height: 30,
    width: 30,
    tintColor: Colors.LightTheme.colors.text,
  },
  iconActive: {},
  linkBarTheme: {
    addLinkContainer: {
      flex: 1,
      height: 38,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',

      borderTopWidth: 0.5,
      borderBottomWidth: 0,
      borderTopColor: Colors.LightTheme.colors.border,
      backgroundColor: 'transparent',
      //paddingHorizontal: 8,
    },
    linkInput: {
      paddingLeft: 12,
      paddingRight: 12,
      flex: 1,
    },
    doneButton: {
      backgroundColor: '#F5F5F5',
      justifyContent: 'center',
      height: 32,
      padding: 8,
      borderRadius: 4,
    },
    doneButtonText: {
      color: '#0085FF',
    },
    linkToolbarButton: {
      paddingHorizontal: 0,
    },
  },
};

export const darkToolbarTheme: ToolbarTheme = {
    ...toolbarTheme,
    toolbarBody: {
        ...StyleSheet.flatten(toolbarTheme.toolbarBody),
        borderTopColor: Colors.DarkTheme.colors.border,
    },
    iconDisabled: {
        tintColor: '#CACACA',
    },
    iconWrapperActive: {
        backgroundColor: '#8E8E93',
    },
    hidden: {
        display: 'none',
    },
    icon: {
        ...StyleSheet.flatten(toolbarTheme.icon),
        tintColor: Colors.DarkTheme.colors.text,
    },
    linkBarTheme: {
        addLinkContainer: {
        backgroundColor: '#474747',
        borderTopColor: '#939394',
        borderBottomColor: '#939394',
    },
    linkInput: {
        backgroundColor: '#474747',
        color: 'white',
    },
    placeholderTextColor: '#B2B2B8',
    doneButton: {
        backgroundColor: '#0085FF',
    },
    doneButtonText: {
        color: 'white',
    },
        linkToolbarButton: {},
    },
};