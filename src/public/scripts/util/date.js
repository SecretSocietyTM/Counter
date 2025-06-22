function formatDate(date) {
    let str = date.toDateString();
    str = str.split(" ");
    return `${str[1]} ${str[2]}, ${str[3]}`;
}


function getWeekRange(date) {
    const dayOfWeek = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - dayOfWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
}

export {
    formatDate,
    getWeekRange
}