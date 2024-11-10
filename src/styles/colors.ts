import { TextStyle, ViewStyle } from "react-native"

type Neutral =
    | "white"
    | "s100"
    | "s150"
    | "s200"
    | "s250"
    | "s300"
    | "s400"
    | "s500"
    | "s600"
    | "s700"
    | "s800"
    | "s900"
    | "black"
export const neutral: Record<Neutral, string> = {
    white: "#ffffff",
    s100: "#efeff6",
    s150: "#dfdfe6",
    s200: "#c7c7ce",
    s250: "#BCBAB8",
    s300: "#9D8F8F",
    s400: "#7c7c82",
    s500: "#515154",
    s600: "#38383a",
    s700: "#2d2c2e",
    s800: "#212123",
    s900: "#161617",
    black: "#000000",
}

export type Primary = "red" | "orange" | "yellow" | "teal" | "blue" | "purple" | "pink"
export const primary: Record<Primary, string> = {
    "red" : "#FF595E",
    "orange" : "#E07A5F",
    "yellow" : "#FFBC42",
    "teal" : "#2A9D8F",
    "blue" : "#00B4D8",
    "pink" : "#F49CBB",
    "purple" : "#6D597A",
}
export const mainPrimaryColor = "yellow"; 
export const listColor : Primary[] = Object.keys(primary).filter((key) => key != mainPrimaryColor) as Primary[];
export const listValueColor = Object.values(primary).filter((value) => value != primary[mainPrimaryColor]);

// type Secondary = "brand" | "s200" | "s600"
// export const secondary: Record<Secondary, string> = {
//   s200: "#b968e8",
//   brand: "#591282",
//   s600: "#3f0d5c",
// }


type Danger = "s400"
export const danger: Record<Danger, string> = {
    s400: primary.red,    
}

type Success = "s400"
export const success: Record<Success, string> = {
    s400: primary.teal,
}

type Warning = "s400"
export const warning: Record<Warning, string> = {
    s400: primary.yellow,
}

type Background = "dark" | "light";
export const background: Record<Background, string> = {
    dark: neutral.s900,
    light: neutral.white,
}

type Card = "dark" | "light";
export const card: Record<Card, string> = {
    dark: neutral.s700,
    light: neutral.white,
}

type Text = "dark" | "light";
export const text: Record<Text, string> = {
    dark: neutral.white,
    light: neutral.s900,
}

const applyOpacity = (hexColor: string, opacity: number): string => {
    const red = parseInt(hexColor.slice(1, 3), 16)
    const green = parseInt(hexColor.slice(3, 5), 16)
    const blue = parseInt(hexColor.slice(5, 7), 16)

    return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}

type Transparent = "clear" | "lightGray" | "darkGray"
export const transparent: Record<Transparent, string> = {
    clear: "rgba(255, 255, 255, 0)",
    lightGray: applyOpacity(neutral.s300, 0.4),
    darkGray: applyOpacity(neutral.s800, 0.8),
}

export const shadeColor = (hexColor: string, percent: number): string => {
    const redGamut: number = parseInt(hexColor.slice(1, 3), 16)
    const greenGamut: number = parseInt(hexColor.slice(3, 5), 16)
    const blueGamut: number = parseInt(hexColor.slice(5, 7), 16)

    const rgb: Array<number> = [redGamut, greenGamut, blueGamut]

    const toShadedGamut = (gamut: number): number => {
        return Math.floor(Math.min(gamut * (1 + percent / 100), 255))
    }

    const toHex = (gamut: number): string => {
        return gamut.toString(16).length === 1
        ? `0${gamut.toString(16)}`
        : gamut.toString(16)
    }

    const shadedRGB: Array<number> = rgb.map(toShadedGamut)
    const shadedHex: Array<string> = shadedRGB.map(toHex)

    const hexString: string = shadedHex.join("")

    return `#${hexString}`
}

export const getRandomColor : () => string = () => {
    const primaryColors = Object.values(primary);
    const randomIndex = Math.floor(Math.random() * primaryColors.length);
    return primaryColors[randomIndex];
}

type ColorsTheme = {
    primary: string,
    background: string,
    card: string,
    text: string,
    border: string,
    notification: string,
}
type Theme = {
    'dark' : boolean,
    'colors' : ColorsTheme,
}
export const DarkTheme : Theme = {
    'dark' : true,
    'colors' : {
        primary: primary.yellow,
        background: background.dark,
        card: card.dark,
        text: text.dark,
        border: neutral.s500,
        notification: primary.yellow,
    }
}
export const LightTheme : Theme = {
    'dark' : false,
    'colors' : {
        primary: primary.yellow,
        background: background.light,
        card: card.light,
        text: text.light,
        border: neutral.s200,
        notification: primary.yellow,
    }
}

type TypeComponent = "text" | "background" | "card"
export const setColorTheme : (colors: ColorsTheme) => Record<TypeComponent, ViewStyle | TextStyle> = (colors) => ({
    text: {
        color: colors.text,
    },
    background: {
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.card,
    },
})

