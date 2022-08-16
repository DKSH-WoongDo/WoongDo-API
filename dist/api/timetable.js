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
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: false }));
moment_timezone_1.default.tz.setDefault('Asia/Seoul');
const getWeekDateString = () => {
    let arr = [];
    for (let i = 0; i < 5; ++i) {
        arr.push((0, moment_timezone_1.default)().startOf('isoWeek').add(i, 'days').format('YYYY-MM-DD'));
    }
    return arr;
};
const getEncodeDayString = (date) => {
    switch (date) {
        case '월요일': return 0;
        case '화요일': return 1;
        case '수요일': return 2;
        case '목요일': return 3;
        case '금요일': return 4;
        default: return 5;
    }
};
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { setGrade, setClass, setDate } = Object.assign(req.body, req.query);
    if (!setGrade || !setClass || !setDate) {
        return res.json({
            isError: true,
            message: '필수 옵션이 비어있습니다.'
        });
    }
    const getAPIurl = (_glade, _class, _date) => ('https://open.neis.go.kr/hub/hisTimetable?' +
        'Type=json&' +
        `KEY=${process.env.neisToken}&` +
        'ATPT_OFCDC_SC_CODE=B10&' +
        'SD_SCHUL_CODE=7011489&' +
        `GRADE=${_glade}&` +
        `CLASS_NM=${_class}&` +
        `AY=2022&` +
        `TI_FROM_YMD=${_date.split('-').join('')}&` +
        `TI_TO_YMD=${_date.split('-').join('')}`);
    try {
        const requestDate = getWeekDateString()[getEncodeDayString(setDate)];
        const fetchTimeTable = yield axios_1.default.get(getAPIurl(setGrade, setClass, requestDate));
        let arr = [];
        for (let i = 0; i < fetchTimeTable.data['hisTimetable'][0]['head'][0]['list_total_count']; ++i)
            arr.push(fetchTimeTable.data['hisTimetable'][1]['row'][i]['ITRT_CNTNT']);
        return res.json({
            isError: false,
            message: '데이터를 로드하는데 성공했습니다.',
            requestDate,
            grade: setGrade,
            class: setClass,
            timeTable: arr
        });
    }
    catch (err) {
        return res.json({
            isError: true,
            message: 'Request를 보냈지만, 원하는 정보를 수신하지 못했습니다.',
        });
    }
}));
module.exports = router;
//# sourceMappingURL=timetable.js.map