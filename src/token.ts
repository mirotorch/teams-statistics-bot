import axios from "axios";


async function getAccessToken(tenantId: string, clientId: string, clientSecret: string): Promise<string> {
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("scope", "https://graph.microsoft.com/.default");
    params.append("client_secret", clientSecret);
    params.append("grant_type", "client_credentials");

    try {
        const response = await axios.post(url, params);
        return response.data.access_token;
    } catch (error) {
        console.error("token error:", error.response?.data || error.message);
        throw new Error("Failed to get access token");
    }
}


export function getToken(): string {
    return "todo";
}