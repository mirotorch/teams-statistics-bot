import { configDotenv } from 'dotenv';
import axios from "axios";

console.log(process.env.DotenvPath);

configDotenv({
    path: process.env.DotenvPath
});

// to use local server for testing
const url = process.env.API_URL;

export interface Statistics {
    users: Array<[string, string]>, // id, name 
    userMessages: Record<string, number>, // id: count
    channels: Array<[string, string, number]> // id, name, message count
}

export async function getStatistics(teamId: string, token: string, since?: Date): Promise<Statistics> {
    const headers = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const userMessages = {};
    const channels = await axios.get(`${url}/${teamId}/channels`, headers);
    const channelMessages = {};

    const users = await axios.get(`${url}/${teamId}/members`);
    for (const user of users.data.value) {
        userMessages[user.id] = 0;
    }

    channels.data.value.forEach(async (channel: any) => {
        channelMessages[channel.id] = 0;
        const filter =  since == null ? "" : `?$filter=lastModifiedDateTime ge ${since}`;
        let nextLink = `${url}/${teamId}/channels/${channel.id}/messages${filter}`;
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
                        channelMessages[channel.id]++;
                   }
                }

                nextLink = response.data["@odata.nextLink"] || null;
            }
        } catch (error) {
            console.error("error fetching messages:", error.response?.data || error.message);
            return 0;
        }
    });

    return {
        users: users.data.value.map((user) => [user.id, user.displayName, userMessages[user.id]]),
        userMessages: userMessages,
        channels: channels.data.value.map((channel) => [channel.id, channel.displayName, channelMessages[channel.id]])
    };
}

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