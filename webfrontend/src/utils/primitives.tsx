export function formatNumber(num: number, numOfDigits: number): string {
    const str = num.toString();
    if (numOfDigits >= str.length) {
        return '0'.repeat(numOfDigits - str.length) + str;
    } else {
        return str.slice(str.length - numOfDigits, str.length);
    }
}

export function isAlphaNumeric(str: string): boolean {
    return /^[A-Za-z0-9]*$/.test(str);
}