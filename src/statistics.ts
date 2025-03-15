import { getMembers, getMessageCountByUser } from './graph';
import { getToken } from './token';

const lastStatistics: Record<string, Date> = {};

export async function InitStatistics(teamId: string) {
    const token = getToken();
    const members = await getMembers(teamId, token);
    const messages = await getMessageCountByUser(teamId, token);
    lastStatistics[teamId] = new Date();
}

export async function getStatistics(teamId: string) {
    const token = getToken();
    const members = await getMembers(teamId, token);
    const messages = await getMessageCountByUser(teamId, token, lastStatistics[teamId]);
    lastStatistics[teamId] = new Date();
    return { members, messages };
}
