function paddedNumber( num: number, pad: number = 2 ): string {
    return num.toString().padStart( pad, '0' );
}

function toPrintAsPlural( num: number, word: string ): string {
    return num > 1 ? `${word}s` : word;
}

export {
    paddedNumber,
    toPrintAsPlural,
}