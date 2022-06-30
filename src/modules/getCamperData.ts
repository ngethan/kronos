// import { errorHandler } from "../utils/errorHandler";
// import CamperModel, { CamperInt } from "../database/models/EventModel";

// export const getCamperData = async (
//     id: string
// ): Promise<CamperInt | undefined> => {
//     try {
//         const targetCamperData = await CamperModel.findOne({ discordId: id });

//         if (targetCamperData) {
//             return targetCamperData;
//         }

//         const newCamperData = await CamperModel.create({
//             discordId: id,
//             round: 1,
//             day: 0,
//             date: Date.now(),
//         });

//         return newCamperData;
//     } catch (err) {
//         errorHandler("getCamperData module", err);
//         return;
//     }
// };
