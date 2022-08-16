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
const token_1 = require("../../token");
const dbHandle_1 = require("../../dbHandle");
const cryptoHandle_1 = require("../../cryptoHandle");
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: false }));
router.put('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userToken = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : null;
    if (!userToken) {
        return res.json({
            isError: true,
            message: '토큰이 비어있습니다.',
        });
    }
    const { calendarID, title, s_date, e_date, content } = Object.assign(req.body, req.query);
    if (!calendarID || !title || !s_date || !e_date) {
        return res.json({
            isError: true,
            message: '입력하지 않은 값들이 있습니다.',
        });
    }
    const { isError, returnValue } = yield token_1.jwtToken.verifyToken(userToken);
    if (isError || returnValue.type !== 'A') {
        return res.json({
            isError: true,
            message: '데이터 접근 권한이 없습니다.',
        });
    }
    try {
        const query1 = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.calendar WHERE calendarID=?`, [calendarID]);
        if (Array.isArray(query1) && query1.length === 0)
            return res.json({
                isError: true,
                message: '일정이 존재하지 않습니다.'
            });
        const query2 = yield (0, dbHandle_1.sql)(`UPDATE ${process.env.MYSQL_DB}.calendar SET title=?, sDate=?, eDate=?, content=? WHERE calendarID=? AND userID=?`, [title, s_date, e_date, content, calendarID, cryptoHandle_1.cryptoHandle.AES_DEC(returnValue.id)]);
        if ((query2 === null || query2 === void 0 ? void 0 : query2.affectedRows) == 0) {
            return res.json({
                isError: true,
                message: '다른 사람이 등록한 일정은 수정할 수 없습니다.'
            });
        }
        return res.json({
            isError: false,
            message: '성공적으로 일정을 수정했습니다.'
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
//# sourceMappingURL=modifyCalendar.js.map