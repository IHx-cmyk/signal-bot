import axios from 'axios';
import { CONFIG } from './config';

const api = axios.create({
    baseURL: CONFIG.SIGNAL_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// UNIVERSAL CALLER
export async function signalApi(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data: any = null) {
    try {
        const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const response = await api({ method, url, data });
        return response.data;
    } catch (error: any) {
        console.error(`[API Error] ${method} ${endpoint}:`, error.response?.data || error.message);
        return null;
    }
}

// MESSAGING & CHAT FEATURES
export async function setTyping(recipient: string) {
    await signalApi('PUT', `/v1/typing-indicator/${CONFIG.BOT_NUMBER}`, { recipient });
}

export async function sendMessage(recipient: string, message: string, attachments: string[] = []) {
    const payload: any = {
        number: CONFIG.BOT_NUMBER,
        recipients: [recipient],
        message: message
    };
    if (attachments.length > 0) payload.base64_attachments = attachments;
    await signalApi('POST', '/v2/send', payload);
}

// Pesan otomatis hilang (Timer dalam detik)
export async function sendDisappearingMessage(recipient: string, message: string, timerSeconds: number) {
    await signalApi('POST', '/v2/send', {
        number: CONFIG.BOT_NUMBER,
        recipients: [recipient],
        message: message,
        expire_in: timerSeconds
    });
}

export async function sendReaction(recipient: string, author: string, timestamp: number, emoji: string) {
    await signalApi('POST', `/v1/reactions/${CONFIG.BOT_NUMBER}`, {
        recipient: recipient,
        target_author: author,
        timestamp: timestamp,
        emoji: emoji
    });
}

// PROFILE & ACCOUNT
export async function updateProfile(name: string, about?: string) {
    const payload: any = { name };
    if (about) payload.about = about;
    await signalApi('PUT', `/v1/profiles/${CONFIG.BOT_NUMBER}`, payload);
}

// PRIVACY (BLOCK/UNBLOCK)
export async function blockNumber(targetNumber: string) {
    await signalApi('POST', `/v1/blocks/${CONFIG.BOT_NUMBER}`, { numbers: [targetNumber] });
}

export async function unblockNumber(targetNumber: string) {
    await signalApi('DELETE', `/v1/blocks/${CONFIG.BOT_NUMBER}`, { numbers: [targetNumber] });
}


// GROUP MANAGEMENT
export async function createGroup(groupName: string, members: string[]) {
    return await signalApi('POST', `/v1/groups/${CONFIG.BOT_NUMBER}`, {
        name: groupName,
        members: members
    });
}
