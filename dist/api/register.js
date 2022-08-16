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
const BASE_URL = 'https://o365.sen.go.kr';
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: false }));
function get_session_id() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let sessionId = undefined;
        let resp = yield axios_1.default.get(BASE_URL + '/Register/Step1/Student', {
            maxRedirects: 0,
            withCredentials: true,
        });
        let terms = resp === null || resp === void 0 ? void 0 : resp.data.split('<input id="TermsNames_0__TermsKey" name="TermsNames[0].TermsKey" type="hidden" value="')[1].split('" />')[0];
        try {
            yield axios_1.default.post(BASE_URL + '/Register/Step1/Student', JSON.stringify({
                'TermsNames[0].Agree': 'true',
                'TermsNames[0].Title': encodeURIComponent('개인정보 수집 및 이용 동의'),
                'TermsNames[0].TermsKey': terms,
                'TermsNames[0].Require': 'true',
                agetype: '1',
            }), {
                maxRedirects: 0,
                headers: {
                    Referer: 'https://o365.sen.go.kr/Register/Step1/Student',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Cookie: resp.headers['set-cookie'].toString().split(' ')[0],
                },
                withCredentials: true,
            });
            return false;
        }
        catch (err) {
            if (axios_1.default.isAxiosError(err) && (err === null || err === void 0 ? void 0 : err.response)) {
                if ((_a = err.response.headers) === null || _a === void 0 ? void 0 : _a.location)
                    sessionId = err.response.headers.location.split('/').at(-1);
            }
            else {
                return false;
            }
        }
        let return_val = {
            session_id: sessionId,
            NET_SessionId: resp.headers['set-cookie']
                .toString()
                .split(' ')[0]
                .split('=')[1]
                .split(';')[0],
        };
        return return_val;
    });
}
router.post('/getSessionId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield get_session_id();
    if (!data) {
        return res.json({
            isError: true,
            message: '세션 아이디를 얻는중 오류가 발생 하였습니다.',
        });
    }
    let { session_id, NET_SessionId } = data;
    return res.json({
        isError: true,
        message: '세션 아이디를 정상적으로 획득 하였습니다.',
        session_id: session_id,
        NET_SessionId: NET_SessionId,
    });
}));
router.post('/sendToken', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone_number, NET_SessionId } = Object.assign(req.body, req.query);
    try {
        yield axios_1.default.post(BASE_URL + '/Register/SendAuthToken', JSON.stringify({ PhoneNumber: phone_number }), {
            headers: {
                Cookie: 'ASP.NET_SessionId=' + NET_SessionId,
            }
        });
        return res.json({
            isError: true,
            message: '인증 번호를 정상적으로 수신 하였습니다.',
        });
    }
    catch (_a) {
        return res.json({
            isError: true,
            message: '인증 번호 수신을 실패하였습니다.',
        });
    }
}));
router.post('/verify', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone_number, key, NET_SessionId } = Object.assign(req.body, req.query);
    try {
        yield axios_1.default.post(BASE_URL + '/Register/ValidateAuthToken', JSON.stringify({
            PhoneNumber: phone_number,
            AuthNumber: key,
        }), {
            headers: {
                Cookie: 'ASP.NET_SessionId=' + NET_SessionId,
            },
        });
        return res.json({
            isError: true,
            message: '인증 번호를 인증 하였습니다.',
        });
    }
    catch (error) {
        return res.json({
            isError: true,
            message: '인증 번호 인증을 실패하였습니다.',
        });
    }
}));
router.post('/final', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, pw, name, phone_number, session_id, NET_SessionId, userToken } = Object.assign(req.body, req.query);
    const rows = yield (0, dbHandle_1.sql)(`SELECT * FROM ${process.env.MYSQL_DB}.user WHERE userToken = ?`, [userToken]);
    const userType = rows.length == 0 ? 'S' : 'A';
    try {
        let resp3 = yield axios_1.default.post(BASE_URL + '/Register/CheckAccountDuplication', JSON.stringify({
            O2EIndex: 1,
            SchoolIndex: 1089,
            userPrincipalName: id + '@dankook.sen.hs.kr',
        }), {
            headers: {
                Cookie: 'ASP.NET_SessionId=' + NET_SessionId,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        let result = JSON.parse(resp3.data);
        if (result['exists'] != undefined) {
            return res.json({
                isError: true,
                message: '중복된 아이디 입니다.',
            });
        }
        let resp4 = yield axios_1.default.post(BASE_URL + '/Register/Step3/Student/' + session_id, JSON.stringify({
            O2EIndex: '1',
            SchoolIndex: '1089',
            MobileNumber: phone_number,
            UserNickName: name,
            AdmissionYear: '2022',
            Account: id,
            CheckAccountDuplication: 'true',
            Password: pw,
            PasswordConfirm: pw,
        }), {
            headers: {
                Cookie: 'ASP.NET_SessionId=' + NET_SessionId,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        yield (0, dbHandle_1.sql)(`INSERT INTO ${process.env.MYSQL_DB}.user VALUES(?, ?, ?, ?, ?)`, [userType, name, id, pw, cryptoHandle_1.cryptoHandle.SHA256(id + '*37' + userType + '*#@^$' + pw + '$842&3')]);
        return res.json({
            isError: true,
            message: '아이디 생성을 성공 하였습니다.',
        });
    }
    catch (err) {
        return res.json({
            isError: true,
            message: '아이디 생성을 실패하였습니다.',
        });
    }
}));
module.exports = router;
//# sourceMappingURL=register.js.map