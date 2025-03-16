import axios from "axios";

const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const debug = process.env.DEBUG;

export async function getToken(): Promise<string> {
    if (debug) {
        return "debug_token";
    }
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