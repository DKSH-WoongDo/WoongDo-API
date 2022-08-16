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
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: false }));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { targetDate, userID } = Object.assign(req.body, req.query);
    try {
        const WHERE_CONDITION = targetDate || userID ? 'WHERE' : '';
        const WHERE_CONDITION_TARGET_DATE = targetDate ? `DATE_FORMAT(sDate, "%Y-%m")='${targetDate}'` : '';
        const WHERE_CONDITION_USER_ID = userID ? `userID='${userID}'` : '';
        const AND_CONDITION = targetDate && userID ? 'AND' : '';
        const rows = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.calendar ${WHERE_CONDITION} ${WHERE_CONDITION_TARGET_DATE} ${AND_CONDITION} ${WHERE_CONDITION_USER_ID}`, []);
        return res.json({
            isError: false,
            message: '일정을 로드하는데 성공했습니다.',
            rows
        });
    }
    catch (err) {
        return res.json({ isError: true, message: err });
    }
}));
module.exports = router;
//# sourceMappingURL=viewCalendar.js.map