import { ViewStyle, StyleSheet } from "react-native"

import * as Colors from "./colors"

type BorderRadius = "small" | "base" | "large" | "extraLarge" | "max"; 
export const borderRadius: Record<BorderRadius, number> = {
    small: 5,
    base: 10,
    large: 15,
    extraLarge: 20,
    max: 9999,
}

type BorderWidth = "hairline" | "thin" | "base" | "thick"
export const borderWidth: Record<BorderWidth, number> = {
    hairline: StyleSheet.hairlineWidth,
    thin: 1,
    base: 2,
    thick: 3,
}

type Shadow = "small" | "base"
export const shadow: Record<Shadow, ViewStyle> = {
    base: {
        shadowColor: Colors.neutral.s900,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4.65,
        elevation: 6,
    },

    small: {
        shadowColor: Colors.neutral.s900,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 2.32,
        elevation: 4,
    }
}

type LineWidth = "hairline" | "thin" | "base" | "thick"
export const lineWidth: Record<LineWidth, number> = {
    hairline: StyleSheet.hairlineWidth,
    thin: 2,
    base: 3,
    thick: 5,
}