import { getMembers, getMessageCountByUser } from './graph';

export async function InitStatistics(teamId: string) {
    const members = await getMembers(teamId, "todo");
    const messages = await getMessageCountByUser(teamId,"todo");
}

