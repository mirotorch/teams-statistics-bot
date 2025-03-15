import sql from "mssql";

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

async function updateStatistics(teamId: string, members: Array<string>, messages: Record<string, number>) {
    
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
            ChannelId INT,
            TeamId INT,
            Name NVARCHAR(50),
            MessageCount INT,
			PRIMARY KEY (ChannelId, TeamId)
        );
    END;`;
}

createTables();

export { getMostActiveUser, getMostActiveChannel, getMembers, updateStatistics };