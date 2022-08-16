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
const token_1 = require("../token");
const dbHandle_1 = require("../dbHandle");
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: false }));
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userToken = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : null;
    if (!userToken) {
        return res.json({
            isError: true,
            message: '토큰이 비어있습니다.',
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
        const query1 = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.user`, []);
        const query2 = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.bookData`, []);
        const query3 = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.bookHistory`, []);
        return res.json({
            isError: false,
            message: '데이터를 로드하는데 성공했습니다.',
            cnt: [
                Array.isArray(query1) && query1.length,
                Array.isArray(query2) && query2.length,
                Array.isArray(query3) && query3.length
            ],
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
//# sourceMappingURL=info.js.map