import { ViewStyle } from "react-native"
import { Dimensions } from "react-native"

const { height: screenHeight, width: screenWidth } = Dimensions.get("screen")
type Screen = "width" | "height"
export const screen: Record<Screen, number> = {
  width: screenWidth,
  height: screenHeight,
}

export const MARGIN_HORIZONTAL = 20 //TODO: See if should move to constant file

export const mainContainer: ViewStyle = {
    marginHorizontal: MARGIN_HORIZONTAL,
    paddingTop: 5,
}

export const sectionContainer: ViewStyle = {
    marginTop: 10,
    marginBottom: 10,
    overflow: 'visible',
}

export const fullWidthContainer: ViewStyle = { //not affected by margin of main container
    transform: [{translateX: -MARGIN_HORIZONTAL}],
    width: screen.width,
    overflow: 'visible',
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