import { getStatistics } from './graph';
import { getToken } from './token';

const lastStatistics: Record<string, Date> = {};

export async function InitStatistics(teamId: string) {
    const token = getToken();
    const stats = await getStatistics(teamId, token);
    lastStatistics[teamId] = new Date();
}