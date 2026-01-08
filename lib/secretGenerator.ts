import axios from 'axios';
import { TOTP } from "totp-generator"

export async function generateTokenUrl() {
    const secretAPI = await axios.get(
        "https://raw.githubusercontent.com/xyloflake/spot-secrets-go/refs/heads/main/secrets/secretBase32.json"
    );
    const { version, secret } = secretAPI.data;


    if (!version) return;
    const { otp } = await TOTP.generate(secret);
    const tokenURL = `https://open.spotify.com/api/token?reason=init&productType=web-player&totp=${otp}&totpVer=${version}`;
    return tokenURL;
}


export async function getToken(sp_dc?: string) {
    const tokenURL = await generateTokenUrl()
    if (!tokenURL) return { err: "cant get token key" }
    try {
        const tokenReq = await axios.get(tokenURL, sp_dc ? { headers: { Cookie: `sp_dc=${sp_dc};` } } : undefined)
        return tokenReq.data
    } catch (err: unknown) { return { err } }
}