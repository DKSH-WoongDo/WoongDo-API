"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.jwtToken = {
    generateToken: (userType, userID, userName) => __awaiter(void 0, void 0, void 0, function* () {
        const token = jsonwebtoken_1.default.sign({ type: userType, id: userID, name: userName }, process.env.ENCRYPT_KEY, { algorithm: 'HS256', issuer: 'woongdo' });
        return token;
    }),
    verifyToken: (userToken) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const decoded = jsonwebtoken_1.default.verify(userToken, process.env.ENCRYPT_KEY);
            return {
                isError: false,
                returnValue: decoded
            };
        }
        catch (err) {
            return {
                isError: true,
                returnValue: { type: null, id: null, name: null, iat: null, iss: null }
            };
        }
    })
};
//# sourceMappingURL=token.js.map