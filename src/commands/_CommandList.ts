import { CommandInt } from "../interfaces/CommandInt";
import { help } from "./help";
import { info } from "./info";
import { evaluate } from "./eval";
import { remind } from "./remind";
import { reminders } from "./reminders";
import { event } from "./event";
import { events } from "./events";
import { del } from "./delete";
import { feedback } from "./feedback";
import { invite } from "./invite";
import { remindParticipants } from "./remindParticipants";
import { settings } from "./settings";

export const CommandList: CommandInt[] = [
    help,
    info,
    evaluate,
    remind,
    reminders,
    event,
    events,
    del,
    feedback,
    invite,
    remindParticipants,
    settings,
];
