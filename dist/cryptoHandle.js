"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptoHandle = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const dotenv = __importStar(require("dotenv"));
const jsencrypt = new (require('node-jsencrypt-fix'))();
jsencrypt.setKey(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA81dCnCKt0NVH7j5Oh2+S
GgEU0aqi5u6sYXemouJWXOlZO3jqDsHYM1qfEjVvCOmeoMNFXYSXdNhflU7mjWP8
jWUmkYIQ8o3FGqMzsMTNxr+bAp0cULWu9eYmycjJwWIxxB7vUwvpEUNicgW7v5nC
wmF5HS33Hmn7yDzcfjfBs99K5xJEppHG0qc+q3YXxxPpwZNIRFn0Wtxt0Muh1U8a
vvWyw03uQ/wMBnzhwUC8T4G5NclLEWzOQExbQ4oDlZBv8BM/WxxuOyu0I8bDUDdu
tJOfREYRZBlazFHvRKNNQQD2qDfjRz484uFs7b5nykjaMB9k/EJAuHjJzGs9MMMW
tQIDAQAB
-----END PUBLIC KEY-----`);
dotenv.config();
exports.cryptoHandle = {
    SHA256: (item) => {
        if (typeof item === 'string')
            return crypto_js_1.default.SHA256(item).toString(crypto_js_1.default.enc.Hex);
        return null;
    },
    AES_ENC: (item) => {
        if (typeof item === 'string')
            return crypto_js_1.default.AES.encrypt(item, process.env.ENCRYPT_KEY).toString();
        return null;
    },
    AES_DEC: (item) => {
        if (typeof item === 'string')
            return crypto_js_1.default.AES.decrypt(item, process.env.ENCRYPT_KEY).toString(crypto_js_1.default.enc.Utf8);
        return null;
    },
    RSA_ENC: (item) => {
        if (typeof item === 'string')
            return jsencrypt.encrypt(item, 'base64', 'utf8');
        return null;
    }
};
//# sourceMappingURL=cryptoHandle.js.map