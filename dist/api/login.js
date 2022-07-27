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
const express_1 = __importDefault(require("express"));
const dbHandle_1 = require("../dbHandle");
const cryptoHandle_1 = require("../cryptoHandle");
const token_1 = require("../token");
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: false }));
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userID, userPW } = Object.assign(req.body, req.query);
    try {
        const rows = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.user WHERE userID = ?`, [cryptoHandle_1.cryptoHandle.AES_DEC(userID)]);
        if (Array.isArray(rows) && rows.length === 0) {
            return res.json({
                isError: true,
                message: '로그인에 실패했습니다.'
            });
        }
        if (cryptoHandle_1.cryptoHandle.SHA256(cryptoHandle_1.cryptoHandle.AES_DEC(userPW)) != ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.userPW)) {
            return res.json({
                isError: true,
                message: '로그인에 실패했습니다.'
            });
        }
        const token = yield token_1.jwtToken.generateToken(rows[0].userType, userID, cryptoHandle_1.cryptoHandle.AES_ENC(rows[0].userName));
        return res.json({
            isError: false,
            message: '로그인에 성공했습니다.',
            token,
        });
    }
    catch (err) {
        return res.json({
            isError: true,
            message: err
        });
    }
}));
module.exports = router;
//# sourceMappingURL=login.js.map