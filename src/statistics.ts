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
    const prev = await readCardInfo(teamId);
    await updateStatistics(teamId, stats);
    actualizationDate[teamId] = new Date();
    const current = await readCardInfo(teamId);

    if (prev.msgCount < current.msgCount) {
        current.msgCount += ` (+${Number.parseInt(current.msgCount) - Number.parseInt(prev.msgCount)})`;
    }
    else if (prev.msgCount > current.msgCount) {
        current.msgCount += ` (-${Number.parseInt(prev.msgCount) - Number.parseInt(current.msgCount)})`;
    }
    
    if (prev.userCount < current.userCount) {
        current.userCount += ` (+${Number.parseInt(current.userCount) - Number.parseInt(prev.userCount)})`;
    }
    else if (prev.userCount > current.userCount) {
        current.userCount += ` (-${Number.parseInt(prev.userCount) - Number.parseInt(current.userCount)})`;
    }

    return current;
}

async function readCardInfo(teamId: string) {
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