import { withTiming,
         Easing, ReduceMotion,
         type AnimatableValue,
         withSpring
} from 'react-native-reanimated';

type DurationType = 'fast' | 'base' | 'slow' | 'glacial';
export const duration : Record<DurationType, number> = {
    fast: 200,
    base: 300,
    slow: 500,
    glacial: 800,
}

type EaseType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'back' | 'bounce';
export function timing<T extends AnimatableValue> (toValue: T) : Record<EaseType, Record<DurationType, T>> {
    return {
        linear: {
            fast: withTiming<T>(toValue, {duration: duration.fast, easing: Easing.linear, reduceMotion: ReduceMotion.System,}),
            base: withTiming<T>(toValue, {duration: duration.base, easing: Easing.linear, reduceMotion: ReduceMotion.System,}),
            slow: withTiming<T>(toValue, {duration: duration.slow, easing: Easing.linear, reduceMotion: ReduceMotion.System,}),
            glacial: withTiming<T>(toValue, {duration: duration.glacial, easing: Easing.linear, reduceMotion: ReduceMotion.System,}),
        },
        easeIn: {
            fast: withTiming<T>(toValue, {duration: duration.fast, easing: Easing.in(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
            base: withTiming<T>(toValue, {duration: duration.base, easing: Easing.in(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
            slow: withTiming<T>(toValue, {duration: duration.slow, easing: Easing.in(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
            glacial: withTiming<T>(toValue, {duration: duration.glacial, easing: Easing.in(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
        },
        easeOut: {
            fast: withTiming<T>(toValue, {duration: duration.fast, easing: Easing.out(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
            base: withTiming<T>(toValue, {duration: duration.base, easing: Easing.out(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
            slow: withTiming<T>(toValue, {duration: duration.slow, easing: Easing.out(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
            glacial: withTiming<T>(toValue, {duration: duration.glacial, easing: Easing.out(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
        },
        easeInOut: {
            fast: withTiming<T>(toValue, {duration: duration.fast, easing: Easing.inOut(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
            base: withTiming<T>(toValue, {duration: duration.base, easing: Easing.inOut(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
            slow: withTiming<T>(toValue, {duration: duration.slow, easing: Easing.inOut(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
            glacial: withTiming<T>(toValue, {duration: duration.glacial, easing: Easing.inOut(Easing.poly(3)), reduceMotion: ReduceMotion.System,}),
        },
        back: {
            fast: withTiming<T>(toValue, {duration: duration.fast, easing: Easing.back(2), reduceMotion: ReduceMotion.System,}),
            base: withTiming<T>(toValue, {duration: duration.base, easing: Easing.back(2), reduceMotion: ReduceMotion.System,}),
            slow: withTiming<T>(toValue, {duration: duration.slow, easing: Easing.back(2), reduceMotion: ReduceMotion.System,}),
            glacial: withTiming<T>(toValue, {duration: duration.glacial, easing: Easing.back(2), reduceMotion: ReduceMotion.System,}),
        },
        bounce: {
            fast: withTiming<T>(toValue, {duration: duration.fast, easing: Easing.bounce, reduceMotion: ReduceMotion.System,}),
            base: withTiming<T>(toValue, {duration: duration.base, easing: Easing.bounce, reduceMotion: ReduceMotion.System,}),
            slow: withTiming<T>(toValue, {duration: duration.slow, easing: Easing.bounce, reduceMotion: ReduceMotion.System,}),
            glacial: withTiming<T>(toValue, {duration: duration.glacial, easing: Easing.bounce, reduceMotion: ReduceMotion.System,}),
        },
    }
}

type SpringType = 'base';
export function spring<T extends AnimatableValue> (toValue: T) : Record<SpringType, Record<DurationType, T>> {
    return {         
        base: {
            fast: withSpring<T>(toValue, {duration: duration.fast, dampingRatio: 0.3, reduceMotion: ReduceMotion.System,}),
            base: withSpring<T>(toValue, {duration: duration.base, dampingRatio: 0.45, reduceMotion: ReduceMotion.System,}),
            slow: withSpring<T>(toValue, {duration: duration.slow, dampingRatio: 0.55, reduceMotion: ReduceMotion.System,}),
            glacial: withSpring<T>(toValue, {duration: duration.glacial, dampingRatio: 0.65, reduceMotion: ReduceMotion.System,}),
        },
    }
}