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
router.put('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const userToken = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : null;
    if (!userToken) {
        return res.json({
            isError: true,
            message: '토큰이 비어있습니다.',
        });
    }
    const { bookID } = Object.assign(req.body, req.query);
    if (!bookID) {
        return res.json({
            isError: true,
            message: '입력하지 않은 값들이 있습니다.',
        });
    }
    const { isError, returnValue } = yield token_1.jwtToken.verifyToken(userToken);
    if (isError) {
        return res.json({
            isError: true,
            message: '데이터 접근 권한이 없습니다.',
        });
    }
    try {
        const query1 = yield (0, dbHandle_1.sql)(`SELECT count(case when status=1 then 1 end) as countOfLoanned FROM ${process.env.MYSQL_DB}.bookHistory WHERE userID=?`, [cryptoHandle_1.cryptoHandle.AES_DEC(returnValue.id)]);
        if (Array.isArray(query1) && query1.length === 0)
            return res.json({
                isError: true,
                message: '대출하신 자료가 없습니다.',
            });
        if (((_b = query1[0]) === null || _b === void 0 ? void 0 : _b.countOfLoanned) >= 3) {
            return res.json({
                isError: true,
                message: '최대 3번까지 빌릴 수 있습니다.',
            });
        }
    }
    catch (err) {
        return res.json({
            isError: true,
            message: err
        });
    }
    try {
        const query2 = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.bookData WHERE bookID LIKE '%${bookID}%'`, []);
        if (Array.isArray(query2) && query2.length === 0)
            return res.json({
                isError: true,
                message: '찾으시는 자료가 없습니다.'
            });
        if (((_c = query2[0]) === null || _c === void 0 ? void 0 : _c.status) !== 0)
            return res.json({
                isError: true,
                message: '대출 가능한 책이 아닙니다.',
            });
        let today = new Date();
        let endLine = new Date(new Date().setDate(today.getDate() + 14));
        let endYear = ('' + endLine.getFullYear()).slice(-4);
        let endMonth = ('0' + (endLine.getMonth() + 1)).slice(-2);
        let endDate = ('0' + endLine.getDate()).slice(-2);
        const query3 = yield (0, dbHandle_1.sql)(`INSERT INTO ${process.env.MYSQL_DB}.bookHistory VALUES(NULL, ?, ?, ?, ?, ?, ?, ?, ?, 1)`, [cryptoHandle_1.cryptoHandle.AES_DEC(returnValue.name),
            cryptoHandle_1.cryptoHandle.AES_DEC(returnValue.id), (_d = query2[0]) === null || _d === void 0 ? void 0 : _d.title, (_e = query2[0]) === null || _e === void 0 ? void 0 : _e.author, (_f = query2[0]) === null || _f === void 0 ? void 0 : _f.company, (_g = query2[0]) === null || _g === void 0 ? void 0 : _g.bookID, `${today.getFullYear()}-${('0' + (today.getMonth() + 1)).slice(-2)}-${today.getDate()}`,
            `${endYear}-${endMonth}-${endDate}`]);
        const query4 = yield (0, dbHandle_1.sql)(`UPDATE ${process.env.MYSQL_DB}.bookData SET status=1 WHERE bookID=?`, [bookID]);
        if ((query3 === null || query3 === void 0 ? void 0 : query3.affectedRows) == 0 || (query4 === null || query4 === void 0 ? void 0 : query4.affectedRows) == 0) {
            return res.json({
                isError: true,
                message: '선택한 책을 대출하지 못했습니다.'
            });
        }
        return res.json({
            isError: false,
            message: '책을 대출하는데 성공했습니다.'
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
//# sourceMappingURL=loanAction.js.map