import { getStatistics } from './graph';
import { getToken } from './token';
import { updateStatistics } from './db';

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

// todo use database
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
        userMostActive: stats.users.reduce((a, b) => a[1] > b[1] ? a : b)[0],
        userLeastActive: stats.users.reduce((a, b) => a[1] < b[1] ? a : b)[0],
        channelMostActive: stats.channels.reduce((a, b) => a[2] > b[2] ? a : b)[1],
        msgCount: stats.channels.reduce((a, b) => a[2] + b[2]).toString(),
        userCount: stats.users.length.toString(),
    };
}