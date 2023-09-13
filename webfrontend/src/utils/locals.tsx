export function getJSONItemFrom(key: string, defaultValue: Object, storage: Storage): Object {
    if (storage.getItem(key)) {
        try {
            return JSON.parse(storage.getItem(key)!);
        } catch {
            return defaultValue;
        }
    } else {
        return defaultValue;
    }
}

export function getStringFrom(key: string, defaultValue: string, storage: Storage): string {
    return storage.getItem(key) ? storage.getItem(key)! : defaultValue;
}

export function triggerErrorMessage() {
    alert("An error has occurred, please try again later.");
}