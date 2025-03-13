import {configDotenv} from 'dotenv';
console.log(process.env.DotenvPath);
configDotenv({
    path: process.env.DotenvPath
})

const bearer = process.env.SECRET_DEV_BEARER // This is a placeholder for the bearer token.
const debugTeamId = process.env.SECRET_DEV_TEAMID // This is a placeholder for the team id.
const url = "https://graph.microsoft.com/v1.0/teams/" + debugTeamId;


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