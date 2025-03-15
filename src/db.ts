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

async function getMostActiveUser(teamId: string): Promise<string> {
    return "";
}

async function getMostActiveChannel(teamId: string): Promise<string> {
    return "";
}

async function getMembers(teamId: string): Promise<Array<string>> {
    return [];
}

async function updateStatistics(teamId: string, members: Array<string>, messages: Record<string, number>) {
    
}

async function createTables() {

}

createTables();

export { getMostActiveUser, getMostActiveChannel, getMembers, updateStatistics };