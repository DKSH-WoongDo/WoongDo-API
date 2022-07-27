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
const axios_1 = __importDefault(require("axios"));
const dbHandle_1 = require("../dbHandle");
const cryptoHandle_1 = require("../cryptoHandle");
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: false }));
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userID, userPW, userName, userBirthday } = Object.assign(req.body, req.query);
    try {
        const response = yield axios_1.default.post(process.env.AUTH_API, { userName, userBirthday });
        if (response.data.isError)
            return res.json({
                isError: true,
                message: '학생 인증에 실패했습니다.',
            });
        const query1 = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.user WHERE userName=? and userBirthday=?`, [cryptoHandle_1.cryptoHandle.AES_DEC(userName), cryptoHandle_1.cryptoHandle.AES_DEC(userBirthday)]);
        if (Array.isArray(query1) && query1.length !== 0) {
            return res.json({
                isError: true,
                message: '이미 인증 받은 학생입니다.'
            });
        }
        const query2 = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.user WHERE userID=?`, [cryptoHandle_1.cryptoHandle.AES_DEC(userID)]);
        if (Array.isArray(query2) && ((_a = query2[0]) === null || _a === void 0 ? void 0 : _a.userID) === cryptoHandle_1.cryptoHandle.AES_DEC(userID)) {
            return res.json({
                isError: true,
                message: '이미 있는 아이디입니다.'
            });
        }
        const query3 = yield (0, dbHandle_1.sql)(`INSERT INTO ${process.env.MYSQL_DB}.user VALUES('S', ?, ?, ?, ?)`, [cryptoHandle_1.cryptoHandle.AES_DEC(userName), cryptoHandle_1.cryptoHandle.AES_DEC(userID), cryptoHandle_1.cryptoHandle.SHA256(cryptoHandle_1.cryptoHandle.AES_DEC(userPW)), cryptoHandle_1.cryptoHandle.AES_DEC(userBirthday)]);
        if ((query3 === null || query3 === void 0 ? void 0 : query3.affectedRows) == 0) {
            return res.json({
                isError: true,
                message: '회원가입에 실패했습니다.'
            });
        }
        return res.json({
            isError: false,
            message: '회원가입에 성공했습니다.'
        });
    }
    catch (err) {
        return res.json({
            isError: true,
            message: '요청을 보냈지만, 인증 서버가 응답하지 않습니다.',
        });
    }
}));
module.exports = router;
//# sourceMappingURL=register.js.map