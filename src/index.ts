import WebSocket from 'ws';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { CONFIG } from './config';
import { 
    sendMessage, sendReaction, setTyping, updateProfile, 
    sendDisappearingMessage, blockNumber, unblockNumber, createGroup 
} from './api';

const execPromise = promisify(exec);

async function handleMessage(sender: string, text: string, timestamp: number, groupId?: string, destination?: string) {
    const replyTarget = groupId ? groupId : (destination ? destination : sender);
    if (!text) return;

    const args = text.trim().split(/ +/);
    const command = args.shift()?.toLowerCase();
    const q = args.join(' ');
    
    const isOwner = CONFIG.OWNERS.includes(sender) || sender === CONFIG.BOT_NUMBER;

    switch (command) {
        case '$': {
            if (!isOwner) return await sendMessage(replyTarget, '⛔ Akses Ditolak!');
            try {
                await sendMessage(replyTarget, '⏳ _Executing..._');
                const { stdout, stderr } = await execPromise(q);
                const output = stdout || stderr || '✅ Success';
                await sendMessage(replyTarget, `💻 *Terminal:*\n\n${output.trim()}`);
            } catch (error: any) {
                await sendMessage(replyTarget, `❌ *Error:*\n\n${error.message}`);
            }
            break;
        }

        case 'menu':
        case 'help': {
            await setTyping(replyTarget);
            const menu = `🤖 *Simple SIGNAL BOT* 🤖\n\n`
                + `*General:*\n`
                + `• ping\n`
                + `• echo <teks>\n`
                + `• react\n`
                + `• bomb <teks> (Pesan hilang 10 detik)\n`
                + `• sysinfo\n\n`
                + `*Owner Only:*\n`
                + `• setname <nama>\n`
                + `• block <nomor>\n`
                + `• unblock <nomor>\n`
                + `• creategroup <nama>\n`
                + `• $ <command>`;
            await sendMessage(replyTarget, menu);
            break;
        }

        case 'ping':
            await setTyping(replyTarget);
            await sendMessage(replyTarget, 'Pong! 🏓');
            break;

        case 'bomb':
            if (!q) return await sendMessage(replyTarget, 'Apa pesan rahasianya?');
            await sendDisappearingMessage(replyTarget, `💣 [RAHASIA]: ${q}\n\n_Pesan ini akan hilang dalam 10 detik._`, 10);
            break;

        case 'react':
            await sendReaction(replyTarget, sender, timestamp, '🔥');
            break;

        case 'setname':
            if (!isOwner) return await sendMessage(replyTarget, '⛔ Akses Ditolak!');
            if (!q) return await sendMessage(replyTarget, 'Masukkan nama!');
            await updateProfile(q);
            await sendMessage(replyTarget, `✅ Profil diubah menjadi: ${q}`);
            break;

        case 'block':
            if (!isOwner) return await sendMessage(replyTarget, '⛔ Akses Ditolak!');
            if (!q) return await sendMessage(replyTarget, 'Nomornya mana? (Pakai +62...)');
            await blockNumber(q);
            await sendMessage(replyTarget, `🚫 ${q} telah diblokir dari bot.`);
            break;

        case 'unblock':
            if (!isOwner) return await sendMessage(replyTarget, '⛔ Akses Ditolak!');
            if (!q) return await sendMessage(replyTarget, 'Nomornya mana?');
            await unblockNumber(q);
            await sendMessage(replyTarget, `✅ ${q} telah di-unblock.`);
            break;

        case 'creategroup':
            if (!isOwner) return await sendMessage(replyTarget, '⛔ Akses Ditolak!');
            if (!q) return await sendMessage(replyTarget, 'Nama grupnya apa?');
            await createGroup(q, [sender]); 
            await sendMessage(replyTarget, `✅ Grup "${q}" berhasil dibuat! Cek beranda Signal kamu.`);
            break;

        case 'sysinfo':
            await setTyping(replyTarget);
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
            const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
            await sendMessage(replyTarget, `🖥️ OS: ${os.type()}\n💾 RAM Free: ${freeMem} / ${totalMem} MB`);
            break;
    }
}

function listenToMessages() {
    const encodedNumber = encodeURIComponent(CONFIG.BOT_NUMBER);
    const wsUrl = `${CONFIG.SIGNAL_WS_URL}/v1/receive/${encodedNumber}`;
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => console.log(`[Connected] Bot is listening...`));

    ws.on('message', async (data: string) => {
        try {
            const rawEvent = JSON.parse(data);
            const envelope = rawEvent.envelope || (Array.isArray(rawEvent) && rawEvent.length > 0 && rawEvent[0].envelope);
            if (!envelope) return;

            let sender = '', messageText = '', groupId = undefined, destination = undefined, timestamp = 0;

            if (envelope.dataMessage && envelope.dataMessage.message) {
                sender = envelope.source || envelope.sourceNumber;
                messageText = envelope.dataMessage.message;
                groupId = envelope.dataMessage.groupInfo?.groupId;
                timestamp = envelope.dataMessage.timestamp;
            } else if (envelope.syncMessage && envelope.syncMessage.sentMessage && envelope.syncMessage.sentMessage.message) {
                sender = CONFIG.BOT_NUMBER; 
                messageText = envelope.syncMessage.sentMessage.message;
                groupId = envelope.syncMessage.sentMessage.groupInfo?.groupId;
                destination = envelope.syncMessage.sentMessage.destination || envelope.syncMessage.sentMessage.destinationNumber || CONFIG.BOT_NUMBER;
                timestamp = envelope.syncMessage.sentMessage.timestamp;
            }

            if (!messageText) return;
            console.log(`[Processed] From ${sender}: ${messageText}`);
            await handleMessage(sender, messageText, timestamp, groupId, destination);
        } catch (err) {}
    });

    ws.on('close', () => {
        setTimeout(listenToMessages, 5000);
    });
}

listenToMessages();
