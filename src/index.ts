import App from './app';

// HTTPS CONFIGURE
import fs from 'fs';
import https from 'https';
import http from 'http';

const app = new App().application;
const logPath = './log/log.log';

function ensureLog() {
    const exist = fs.existsSync(logPath);
    if (!exist) {
        fs.writeFileSync(logPath, '');
    }
}

function readLog() {
    ensureLog();
    return fs.readFileSync(logPath).toString('utf-8');
}

function writeLog(remoteAddress:any) {
    const beforeLog = readLog();
    const now = new Date().toUTCString();
    const newLog = `${now}: ${remoteAddress} 접속`;
    fs.writeFileSync(logPath, `${beforeLog}\n${newLog}`);
}

const httpServer = http.createServer((req, res) => {
    writeLog(req.connection.remoteAddress);
    res.writeHead(301, { Location: 'https://' + req.headers['host'] + req.url });
    res.end();
});

const httpsServer = https.createServer(
    {
        key: fs.readFileSync('/root/.acme.sh/woongdo.kro.kr/woongdo.kro.kr.key', 'utf-8'),
        cert: fs.readFileSync('/root/.acme.sh/woongdo.kro.kr/woongdo.kro.kr.cer', 'utf-8'),
        ca: fs.readFileSync('/root/.acme.sh/woongdo.kro.kr/ca.cer', 'utf-8'),
    },
    app
);

httpServer.listen(80, () => {
    console.log('HTTP Server Start');
});

httpsServer.listen(443, () => {
    console.log('HTTPS Server Start');
});