import { toMs } from "ms-typescript";
import { DateTime } from "luxon";

export const parseEventDate = (
    dateTime: string,
    duration: string,
    timestamp: boolean,
    timezone: string
): number => {
    /*
    5/22/22
    5/22/22 12
    5/22/22 12:00
    5/22/22 12:00:00
    5/22/22 12 PM
    5/22/22 12:00 PM
    5/22/22 12:00:00 PM
    Sunday 12
    Sunday 12:00
    Sunday 12:00:00
    Sunday 12 PM
    Sunday 12:00 PM
    Sunday 12:00:00 PM
    Sun 12
    Sun 12:00
    Sun 12:00:00
    Sun 12 PM
    Sun 12:00 PM
    Sun 12:00:00 PM
    */
    const formats = [
        "M/d/yy",
        "M/d/yy h",
        "M/d/yy h:m",
        "M/d/yy h:m:s",
        "M/d/yy h a",
        "M/d/yy h:m a",
        "M/d/yy h:m:s a",
        "cccc",
        "cccc h",
        "cccc h:m",
        "cccc h:m:s",
        "cccc h a",
        "cccc h:m a",
        "cccc h:m:s a",
        "ccc h",
        "ccc h:m",
        "ccc h:m:s",
        "ccc h a",
        "ccc h:m a",
        "ccc h:m:s a",
        "h",
        "h:m",
        "h:m:s",
        "h a",
        "h:m a",
        "h:m:s a",
    ];

    let dT: DateTime | number = DateTime.fromFormat(dateTime, formats[0], {
        zone: timezone,
    });
    for (let i = 1; i < formats.length; i++) {
        if (dT.isValid) {
            break;
        }
        dT = DateTime.fromFormat(dateTime, formats[i], { zone: timezone });
    }

    const now: DateTime = DateTime.fromObject({}, { zone: timezone });
    if (
        (toMs(dateTime) <= 0 && !dT.isValid) ||
        (dT.valueOf() <= now.valueOf() && toMs(duration) <= 0)
    ) {
        return -1;
    }
    if (isNaN(dT.valueOf())) {
        dT =
            DateTime.fromObject({}, { zone: timezone }).valueOf() +
            toMs(dateTime);
    }
    if (timestamp) {
        return Math.floor(dT.valueOf() / 1000) + toMs(duration) / 1000;
    }
    return dT.valueOf() + toMs(duration);
};

export const parseReminderDate = (
    dateTime: string,
    timestamp: boolean,
    timezone: string
): number => {
    let dT: DateTime = DateTime.fromFormat(dateTime, "M/d/yy h:m:s a", {
        zone: timezone,
    });
    const now: DateTime = DateTime.fromObject({}, { zone: timezone });
    if ((toMs(dateTime) <= 0 && !dT.isValid) || dT.valueOf() <= now.valueOf()) {
        return -1;
    } else if (toMs(dateTime) !== 0) {
        dT = now.plus(toMs(dateTime));
    }

    if (timestamp) {
        return Math.round(dT.valueOf() / 1000);
    }

    return dT.valueOf();
};

export const parseDuration = (dateTime: string, timezone: string): number => {
    // const offset = new IANAZone(timezone).offset(Date.now());
    const dT: DateTime = DateTime.fromFormat(dateTime, "M/d/yy h:m:s a", {
        zone: timezone,
    });
    const now: DateTime = DateTime.fromObject({}, { zone: timezone });
    if (toMs(dateTime) > 0) {
        return toMs(dateTime);
    } else if (dT.valueOf() - now.valueOf() > 0) {
        return dT.valueOf() - now.valueOf();
    }
    return -1;
};
