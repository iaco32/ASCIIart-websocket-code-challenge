import express from 'express';
import { WebSocketServer as WSWebSocketServer } from 'ws';

const app = express();
const server = app.listen(3000);
const wss = new WSWebSocketServer({ server: server });

wss.on('connection', ws => {
    ws.on('message', message => {
        const data = JSON.parse(message);
        const lines = data.data.split('\n');
        console.log("data: ", data, " - lines: ", lines);
        let i = 0;
        const intervalId = setInterval(() => {
            if (i === lines.length) {
                clearInterval(intervalId);
                return;
            }
            ws.send(JSON.stringify({ data: lines[i++], totallines: lines.length }));
        }, data.interval);
    });
});
