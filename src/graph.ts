import { configDotenv } from 'dotenv';
import axios from "axios";

console.log(process.env.DotenvPath);

configDotenv({
    path: process.env.DotenvPath
});

// to use local server for testing
const url = process.env.API_URL;

export async function getTeamData(teamId: string, token: string) {
    const options = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
}

export async function getMembers(teamId: string, token: string) {
    const options = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await fetch(`${url}${teamId}/members`, options);
    const data = await response.json();
    return data.value.length;
}


export async function getMessageCountByUser(teamId: string, token: string, since?: Date): Promise<Record<string, number>> {
    const headers = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const userMessages = {};
    const channels = await axios.get(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels`, headers);

    channels.data.value.forEach(async (channel: any) => {
        const filter =  since == null ? "" : `?$filter=lastModifiedDateTime ge ${since}`;
        let nextLink = `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channel.id}/messages${filter}`;
        try {
            while (nextLink) {
                const response = await axios.get(nextLink, headers);
                const messages = response.data.value;

                if (messages && messages.length > 0) {
                    for (const message of messages) {
                        const userId = message.from?.user?.id || "unknown";
                        if (userId in userMessages) {
                            userMessages[userId] += 1;
                        } else {
                            userMessages[userId] = 1;
                        }
                    }
                }

                nextLink = response.data["@odata.nextLink"] || null;
            }
        } catch (error) {
            console.error("error fetching messages:", error.response?.data || error.message);
            return 0;
        }
    });
    return userMessages;
}