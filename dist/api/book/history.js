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
const dbHandle_1 = require("../../dbHandle");
const cryptoHandle_1 = require("../../cryptoHandle");
const token_1 = require("../../token");
const router = express_1.default.Router();
router.use(express_1.default.json());
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userToken = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : null;
    if (!userToken) {
        return res.json({
            isError: true,
            message: '토큰이 비어있습니다.',
        });
    }
    const { isLoanned, userID } = Object.assign(req.body, req.query);
    const { isError, returnValue } = yield token_1.jwtToken.verifyToken(userToken);
    let option1 = (returnValue.type === 'A' ? (isLoanned === 'true' ? 'STATUS=1' : '') : '');
    let option2 = (userID ? `userID='${cryptoHandle_1.cryptoHandle.AES_DEC(userID)}'` : '');
    if (isError) {
        return res.json({
            isError: true,
            message: '데이터 접근 권한이 없습니다.',
        });
    }
    try {
        const and = option1.length !== 0 && option2.length !== 0 ? 'and' : '';
        const rows = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.bookHistory WHERE ${option1} ${and} ${option2} ORDER BY STATUS DESC`, []);
        if (Array.isArray(rows) && rows.length === 0)
            return res.json({
                isError: true,
                message: '대출하신 자료가 없습니다.',
            });
        return res.json({
            isError: false,
            message: '데이터를 로드하는데 성공했습니다.',
            rows
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
//# sourceMappingURL=history.js.map