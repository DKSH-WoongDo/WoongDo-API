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
router.use(express_1.default.urlencoded({ extended: false }));
router.put('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userToken = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : null;
    if (!userToken) {
        return res.json({
            isError: true,
            message: '토큰이 비어있습니다.',
        });
    }
    const { returnItemString } = Object.assign(req.body, req.query);
    if (!returnItemString || returnItemString === '[]') {
        return res.json({
            isError: true,
            message: '책을 선택하지 않으셨습니다.',
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
        let returnItem = JSON.parse(returnItemString);
        for (let i = 0; i < returnItem.length; ++i) {
            let { userID, bookID } = returnItem[i];
            if (!userID || !bookID) {
                return res.json({
                    isError: true,
                    message: '잘못된 인자 값을 넘겼습니다.'
                });
            }
            const query1 = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.bookData WHERE bookID=?`, [bookID]);
            if (Array.isArray(query1) && query1.length === 0)
                return res.json({
                    isError: true,
                    message: '반납하려는 책의 아이디가 잘못되었습니다.',
                });
            const query2 = yield (0, dbHandle_1.sql)(`UPDATE ${process.env.MYSQL_DB}.bookHistory SET status=0 WHERE userID=? and bookID=?`, [cryptoHandle_1.cryptoHandle.AES_DEC(userID), bookID]);
            if ((query2 === null || query2 === void 0 ? void 0 : query2.affectedRows) != 0) {
                (0, dbHandle_1.sql)(`UPDATE ${process.env.MYSQL_DB}.bookData SET status=0 WHERE bookID=?`, [bookID]);
            }
            else {
                return res.json({
                    isError: true,
                    message: '선택한 책을 반납하지 못했습니다.'
                });
            }
        }
        return res.json({
            isError: false,
            message: '선택한 책을 반납했습니다.'
        });
    }
    catch (err) {
        return res.json({
            isError: true,
            message: '잘못된 인자 값을 넘겼습니다.'
        });
    }
}));
module.exports = router;
//# sourceMappingURL=returnAction.js.map