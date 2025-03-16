import { getStatistics, Statistics } from './graph';
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

const lastActualization: Record<string, Date> = {};
const lastStatistics: Record<string, CardInfo> = {};

export async function initStatistics(teamId: string) {
    const token = getToken();
    const stats = await getStatistics(teamId, token);
    lastActualization[teamId] = new Date();
    await updateStatistics(teamId, stats);
}

export async function getCardInfo(teamId: string): Promise<CardInfo> {
    const token = getToken();
    const stats = await getStatistics(teamId, token);
    await updateStatistics(teamId, stats);
    lastActualization[teamId] = new Date();
    return {

    };
}