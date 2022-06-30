export const createCalendarLink = (
    title: string,
    description: string,
    startTime: number,
    endTime: number
): string => {
    const start = new Date(startTime)
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(endTime).toISOString().replace(/-|:|\.\d\d\d/g, "");

    return `http://www.google.com/calendar/render?action=TEMPLATE&text=${title
        .split(" ")
        .join("+")}&details=${description
        .split(" ")
        .join("+")}&dates=${start}/${end}`;
};
