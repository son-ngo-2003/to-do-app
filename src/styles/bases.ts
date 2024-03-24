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

export const flip : Record<Direction, ViewStyle> = {
    horizontal: {
        transform: [
            {
                rotateY: "180deg",
            },
        ],
    },
    vertical: {
        transform: [
            {
                rotateX: "180deg",
            },
        ],
    },
    all: {
        transform: [
            {
                rotateX: "180deg",
            },
            {
                rotateY: "180deg",
            },
        ],
    }
}

export const circle : (size: DimensionValue) => ViewStyle = (size = '100%') => ({
    width: size,
    height: size,
    borderRadius: borderRadius.max,
})