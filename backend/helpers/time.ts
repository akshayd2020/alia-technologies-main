export function parseDatetime(datetime: string): Date {
    const localTime = new Date(datetime);
    return new Date(localTime.toUTCString());
}

export function formatDatetime(date: Date): string {
    return date.toISOString();
}

export function currentTime(): Date {
    const currentTime = new Date();
    return new Date(currentTime.toUTCString());
}
