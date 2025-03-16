import { sql } from "mssql";
import { Statistics } from "./graph";

const config = {
    user: "username",
    password: "password",
    server: "localhost",
    database: "mydb",
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

async function getMostActiveUser(teamId: string): Promise<{ UserId: string, DisplayName: string, MessageCount: number }> {
    await sql.connect(config);
    const result = await sql.query`
    SELECT TOP 1 UserId, DisplayName, MessageCount
    FROM Users
    WHERE TeamId = ${teamId} AND IsInTeam = 1 ORDER BY MessageCount DESC`;
    return result.recordset[0];
}

async function getLeastActiveUser(teamId: string): Promise<{ UserId: string, DisplayName: string, MessageCount: number }> {
    await sql.connect(config);
    const result = await sql.query`
    SELECT TOP 1 UserId, DisplayName, MessageCount
    FROM Users
    WHERE TeamId = ${teamId} AND IsInTeam = 1 ORDER BY MessageCount ASC`;
    return result.recordset[0];
}

async function getMostActiveChannel(teamId: string): Promise<{ ChannelId: string, Name: string }> {
    await sql.connect(config);
    const result = await sql.query`
    SELECT TOP 1 ChannelId, Name
    FROM Channels
    WHERE TeamId = ${teamId} ORDER BY MessageCount DESC`;
    return result.recordset[0];
}

async function getMembers(teamId: string): Promise<Array<string>> {
    await sql.connect(config);
    const result = await sql.query`
    SELECT UserId
    FROM Users
    WHERE TeamId = ${teamId} And IsInTeam = 1`;
    return result.recordset.map((row: { UserId: any; }) => row.UserId);
}

async function getMessageCount(teamId: string): Promise<number> {
    await sql.connect(config);  
    const result = await sql.query`
    SELECT SUM(MessageCount) as MessageCount
    FROM Users
    WHERE TeamId = ${teamId} AND IsInTeam = 1`;
    return result.recordset[0].MessageCount;
}

async function getUserCount(teamId: string): Promise<number> {
    await sql.connect(config);
    const result = await sql.query`
    SELECT COUNT(UserId) as UserCount
    FROM Users
    WHERE TeamId = ${teamId} AND IsInTeam = 1`;
    return result.recordset[0].UserCount;
}

async function updateStatistics(teamId: string, statistics: Statistics) {
    await sql.connect(config);
    await sql.query`UPDATE Users SET IsInTeam = 0 WHERE TeamId = ${teamId};`;
    const userValues = statistics.users.map((user) => `(${teamId}, ${user[0]}, ${user[1]}, ${statistics.userMessages[user[0]]} , 1)`).join(',');
    await sql.query`
    WITH data AS VALUES (${userValues})
    MERGE INTO Users AS target
    USING data AS source
    ON target.TeamId = source.column1 AND target.UserId = source.column2
    WHEN MATCHED THEN
        UPDATE SET MessageCount = source.column4, IsInTeam = 1
    WHEN NOT MATCHED THEN
        INSERT (TeamId, UserId, DisplayName, MessageCount, IsInTeam)
        VALUES (source.column1, source.column2, source.column3, source.column4, source.column5);`;

    const channelValues = statistics.channels.map((channel) => `(${teamId}, ${channel[0]}, ${channel[1]}, ${channel[2]})`).join(',');
    await sql.query`
    WITH data AS VALUES (${channelValues})
    MERGE INTO Channels AS target
    USING data AS source
    ON target.TeamId = source.column1 AND target.ChannelId = source.column2
    WHEN MATCHED THEN
        UPDATE SET Name = source.column3, MessageCount = source.column4
    WHEN NOT MATCHED THEN
        INSERT (TeamId, ChannelId, Name, MessageCount)
        VALUES (source.column1, source.column2, source.column3, source.column4);`;
}

async function createTables() {
    await sql.connect(config);
    await sql.query`
    IF OBJECT_ID('Users', 'TABLE') IS NULL 
    BEGIN
        CREATE TABLE Users
        (
            TeamId INT,
            UserId INT,
            DisplayName NVARCHAR(50),
            MessageCount INT,
            IsInTeam BIT,
			PRIMARY KEY (TeamId, UserId)
        );
    END;

    IF OBJECT_ID('Channels', 'TABLE') IS NULL
    BEGIN
        CREATE TABLE Channels
        (
            TeamId INT,
            ChannelId INT,
            Name NVARCHAR(50),
            MessageCount INT,
			PRIMARY KEY (ChannelId, TeamId)
        );
    END;`;
}

createTables();

export { getMostActiveUser, getMostActiveChannel, getUserCount, getMessageCount, getLeastActiveUser, updateStatistics };