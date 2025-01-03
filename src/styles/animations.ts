import {
    withTiming,
    Easing, ReduceMotion,
    type AnimatableValue,
    withSpring, EasingFunction
} from 'react-native-reanimated';

type DurationType = 'fast' | 'base' | 'slow' | 'glacial' | 'long' | 'veryLong';
export const duration: Record<DurationType, number> = {
    fast: 200,
    base: 300,
    slow: 500,
    glacial: 800,
    long: 1200,
    veryLong: 2000,
};

type EaseType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'back' | 'bounce';

export function timing<T extends AnimatableValue>(
    toValue: T
): Record<EaseType, Record<DurationType, T>> {
    const easingFunctions: Record<EaseType, (easingParam?: number) => EasingFunction> = {
        linear: () => Easing.linear,
        easeIn: () => Easing.in(Easing.poly(3)),
        easeOut: () => Easing.out(Easing.poly(3)),
        easeInOut: () => Easing.inOut(Easing.poly(3)),
        back: () => Easing.back(2),
        bounce: () => Easing.bounce,
    };

    const result: Record<EaseType, Record<DurationType, T>> = {} as any;

    Object.entries(easingFunctions).forEach(([easeType, easingFunction]) => {
        result[easeType as EaseType] = Object.keys(duration).reduce(
            (acc, durationKey) => {
                acc[durationKey as DurationType] =
                    withTiming<T>(toValue, {
                        duration: duration[durationKey as DurationType],
                        easing: easingFunction(),
                        reduceMotion: ReduceMotion.System,
                    });
                return acc;
            },
            {} as Record<DurationType, T>
        );
    });

    return result;
}


type SpringType = 'base';
export function spring<T extends AnimatableValue> (toValue: T) : Record<SpringType, Record<DurationType, T>> {
    return {         
        base: {
            fast: withSpring<T>(toValue, {duration: duration.fast + 100, dampingRatio: 0.3, reduceMotion: ReduceMotion.System,}),
            base: withSpring<T>(toValue, {duration: duration.base + 100, dampingRatio: 0.45, reduceMotion: ReduceMotion.System,}),
            slow: withSpring<T>(toValue, {duration: duration.slow + 100, dampingRatio: 0.55, reduceMotion: ReduceMotion.System,}),
            glacial: withSpring<T>(toValue, {duration: duration.glacial + 100, dampingRatio: 0.65, reduceMotion: ReduceMotion.System,}),
            long: withSpring<T>(toValue, {duration: duration.long + 100, dampingRatio: 0.75, reduceMotion: ReduceMotion.System,}),
            veryLong: withSpring<T>(toValue, {duration: duration.veryLong + 100, dampingRatio: 0.85, reduceMotion: ReduceMotion.System,}),
        },
    }
}