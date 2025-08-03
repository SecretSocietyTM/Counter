export const DAY = 86400000;

// formatters
export function formatDate(date) {
    let str = date.toDateString();
    str = str.split(" ");
    return `${str[0]}, ${str[1]} ${str[2]}, ${str[3]}`;
}

export function formatDateNoDow(date) {
    let str = date.toDateString();
    str = str.split(" ");
    return `${str[1]} ${str[2]}, ${str[3]}`;    
}

export function formatWeekRange(date) {
    let range = getWeekRange(date);
    let start = formatDate(range.start).split(",")[1];
    let end = formatDate(range.end).split(",")[1];
    return {start, end};
}

export function dowToString(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}



// getters
export function getWeekRange(date) {
    const dayOfWeek = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(0, 0, 0, 0);
    return { start, end };
}

export function getNewNowDate(date_value) {
    let [year, month, day] = date_value.split("-").map(Number);
    let date = new Date(year, month - 1, day); // Note: month is 0-indexed in JS Date
    date.setHours(0, 0, 0, 0);  
    return date;
}

export function getLabel(now, real_now) {
    let diff = now - real_now;
    if (diff === 0) return "today";
    else if (diff === DAY) return "tmrw";
    else if (diff === -DAY) return "yest";
    return;
}