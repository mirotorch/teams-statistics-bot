import { getStatistics } from './graph';
import { getToken } from './token';
import { getLeastActiveUser, getMessageCount, getMostActiveChannel, getMostActiveUser, getUserCount, updateStatistics } from './db';
import { get } from 'http';

export interface CardInfo {
    title: string;
    text: string;
    userMostActive: string;
    userLeastActive: string;
    channelMostActive: string;
    msgCount: string;
    userCount: string;
}

const actualizationDate: Record<string, Date> = {};
const lastStatistics: Record<string, CardInfo> = {};

export async function initStatistics(teamId: string) {
    const token = await getToken();
    const stats = await getStatistics(teamId, token);
    actualizationDate[teamId] = new Date();
    await updateStatistics(teamId, stats);
}

export async function getCardInfo(teamId: string): Promise<CardInfo> {
    const token = await getToken();
    const stats = await getStatistics(teamId, token);
    await updateStatistics(teamId, stats);
    const lastStat = lastStatistics[teamId];
    const lastDate = actualizationDate[teamId];
    actualizationDate[teamId] = new Date();
    return {
        title: "Team Statistics",
        text: `Last updated: ${actualizationDate[teamId].toLocaleString()}`,
        userMostActive: (await getMostActiveUser(teamId)).DisplayName,
        userLeastActive: (await getLeastActiveUser(teamId)).DisplayName,
        channelMostActive: (await getMostActiveChannel(teamId)).Name,
        msgCount: (await getMessageCount(teamId)).toString(),
        userCount: (await getUserCount(teamId)).toString(),
    };
}