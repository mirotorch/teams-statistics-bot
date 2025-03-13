import { configDotenv } from 'dotenv';
console.log(process.env.DotenvPath);

configDotenv({
    path: process.env.DotenvPath
});

const bearer = process.env.SECRET_DEV_BEARER; // This is a placeholder for the bearer token.
const debugTeamId = process.env.SECRET_DEV_TEAMID; // This is a placeholder for the team id.
const url = process.env.API_URL;


export async function getAllData() {
    const options = {
        headers: {
            Authorization: `Bearer ${bearer}`
        }
    };
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
}

export async function getMembersCount() {
    const options = {
        headers: {
            Authorization: `Bearer ${bearer}`
        }
    };
    const response = await fetch(`${url}${debugTeamId}/members`, options);
    const data = await response.json();
    return data.value.length;
}

export async function getFileCount() {
    const options = {
        headers: {
            Authorization: `Bearer ${bearer}`
        }
    };
    const response = await fetch(`${url}${debugTeamId}`, options);
    const data = await response.json();
    const webUrl = data.webUrl;

}

export async function getMessageByUserCount() {
    const options = {
        headers: {
            Authorization: `Bearer ${bearer}`
        }
    };
    const members = await (await fetch(`${url}${debugTeamId}/members`, options)).json();
    let dict = {};
    members.array.forEach(element => {
        dict[element.id] = 0;
    });
    const channels = await (await fetch(`${url}${debugTeamId}/channels`, options)).json();
    channels.array.forEach(async (element) => {
        let messages = await (await fetch(`${url}${debugTeamId}/channels/${element.id}/messages`, options)).json();
        messages.array.forEach(element => {
            dict[element.from.user.id] += 1;
        });
    });
    return dict;
}