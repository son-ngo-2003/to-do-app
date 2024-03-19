import { ViewStyle, DimensionValue } from "react-native";
import { borderRadius } from "./outlines";

type Direction = "horizontal" | "vertical" | "all"
export const centerItem : Record<Direction, ViewStyle> = {
    horizontal: {
        alignItems: "center",
    },
    vertical: {
        justifyContent: "center",
    },
    all: {
        alignItems: "center",
        justifyContent: "center",
    }    
}

export const centerSelf : Record<Direction, ViewStyle> = {
    horizontal: {
        alignSelf: "center",
    },
    vertical: {
        alignSelf: "center",
    },
    all: {
        alignSelf: "center",
    }
}

export const circle : (size: DimensionValue) => ViewStyle = (size = '100%') => ({
    width: size,
    height: size,
    borderRadius: borderRadius.max,
})