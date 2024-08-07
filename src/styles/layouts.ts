import { ViewStyle } from "react-native"
import { Dimensions } from "react-native"

const { height: screenHeight, width: screenWidth } = Dimensions.get("screen")
type Screen = "width" | "height"
export const screen: Record<Screen, number> = {
  width: screenWidth,
  height: screenHeight,
}

export const mainContainer: ViewStyle = {
    paddingLeft: 20,
    paddingRight: 20,
}

type SizeGap = 'narrow' | 'normal' | 'large'
export const gap: Record<SizeGap, ViewStyle> = {
    narrow: {
        gap: 10,
    },
    normal: {
        gap: 15,
    },
    large: {
        gap: 20,
    }
}