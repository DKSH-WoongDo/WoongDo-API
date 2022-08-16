import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import qs from 'qs';

import { sql } from '../dbHandle';
import { cryptoHandle } from '../cryptoHandle';

const BASE_URL = 'https://o365.sen.go.kr';

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

async function getSessionId() {
    let sessionId: string | undefined = undefined;

    const response = await axios.get(BASE_URL + '/Register/Step1/Student', {
        maxRedirects: 0,
        withCredentials: true,
    });

    const terms = response.data.split('<input id="TermsNames_0__TermsKey" name="TermsNames[0].TermsKey" type="hidden" value="')[1].split('" />')[0];

    try {
        await axios.post(
            BASE_URL + '/Register/Step1/Student',
            qs.stringify({
                'TermsNames[0].Agree': 'true',
                'TermsNames[0].Title':
                    encodeURIComponent('개인정보 수집 및 이용 동의'),
                'TermsNames[0].TermsKey': terms,
                'TermsNames[0].Require': 'true',
                agetype: '1',
            }),
            {
                maxRedirects: 0,
                headers: {
                    Referer: 'https://o365.sen.go.kr/Register/Step1/Student',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Cookie: response.headers['set-cookie'].toString().split(' ')[0],
                },
                withCredentials: true,
            }
        );
        return false;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            let x: string = err.response.headers.location as string;
            sessionId = x.split('/').at(-1);
        } else {
            return false;
        }
    }

    const return_val: { sessionId: string | boolean; NET_SessionId: string } = {
        sessionId,
        NET_SessionId: response.headers['set-cookie']
            .toString()
            .split(' ')[0]
            .split('=')[1]
            .split(';')[0],
    };

    return return_val;
}

router.post('/getSessionId', async (req: Request, res: Response, next: NextFunction) => {
    const data = await getSessionId();

    if (!data) {
        return res.json({
            isError: true,
            message: '세션 아이디를 얻는중 오류가 발생했습니다.',
        });
    }

    const { sessionId, NET_SessionId } = data;

    return res.json({
        isError: false,
        message: '세션 아이디를 정상적으로 획득했습니다.',
        sessionId,
        NET_SessionId,
    });
});

router.post('/sendToken', async (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber, NET_SessionId } = Object.assign(req.body, req.query);

    try {
        const response = await axios.post(
            BASE_URL + '/Register/SendAuthToken',
            qs.stringify({
                PhoneNumber: phoneNumber
            }),
            {
                headers: {
                    Cookie: 'ASP.NET_SessionId=' + NET_SessionId,
                },
            }
        );
        const message: string =
            response?.data?.errors ?
                response?.data?.errorMessage :
                '인증 번호를 정상적으로 발송했습니다.'
        return res.json({
            isError: response?.data?.errors,
            message,
        });
    } catch (err) {
        return res.json({
            isError: true,
            message: '인증 번호를 발송하지 못했습니다.',
        });
    }
});

router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber, authToken, NET_SessionId } = Object.assign(req.body, req.query);

    try {
        await axios.post(
            BASE_URL + '/Register/ValidateAuthToken',
            qs.stringify({
                PhoneNumber: phoneNumber,
                AuthNumber: authToken,
            }),
            {
                headers: {
                    Cookie: 'ASP.NET_SessionId=' + NET_SessionId,
                },
            }
        );
        return res.json({
            isError: true,
            message: '인증 번호를 인증 하였습니다.',
        });
    } catch (err) {
        return res.json({
            isError: true,
            message: '인증 번호 인증을 실패하였습니다.',
        });
    }
});

router.post('/final', async (req: Request, res: Response, next: NextFunction) => {
    const { userID, userPW, userName, phoneNumber, sessionId, NET_SessionId } = Object.assign(req.body, req.query);

    try {
        const response = await axios.post(
            BASE_URL + '/Register/CheckAccountDuplication',
            qs.stringify({
                O2EIndex: 1,
                SchoolIndex: 1089,
                userPrincipalName: cryptoHandle.AES_DEC(userID) + '@dankook.sen.hs.kr',
            }),
            {
                headers: {
                    Cookie: 'ASP.NET_SessionId=' + NET_SessionId,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        const result = qs.parse(response.data);

        if (result['exists']) {
            return res.json({
                isError: true,
                message: '중복된 아이디입니다.',
            });
        }

        await axios.post(
            BASE_URL + '/Register/Step3/Student/' + sessionId,
            qs.stringify({
                O2EIndex: '1',
                SchoolIndex: '1089',
                MobileNumber: cryptoHandle.AES_DEC(phoneNumber),
                UserNickName: cryptoHandle.AES_DEC(userName),
                AdmissionYear: new Date().getFullYear(),
                Account: cryptoHandle.AES_DEC(userID),
                CheckAccountDuplication: 'true',
                Password: cryptoHandle.AES_DEC(userPW),
                PasswordConfirm: cryptoHandle.AES_DEC(userPW),
            }),
            {
                headers: {
                    Cookie: 'ASP.NET_SessionId=' + NET_SessionId,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        await sql(`INSERT INTO ${process.env.MYSQL_DB}.user VALUES(?, ?, ?, ?, ?, ?)`,
            [
                'S',
                cryptoHandle.AES_DEC(userName),
                cryptoHandle.AES_DEC(userID),
                cryptoHandle.SHA256(cryptoHandle.AES_DEC(userPW)),
                cryptoHandle.SHA256(cryptoHandle.AES_DEC(phoneNumber)),
                cryptoHandle.SHA256(userID + '*#@^$' + userPW + '$842&3')
            ]
        );

        return res.json({
            isError: false,
            message: '아이디 생성을 성공했습니다.'
        });
    } catch (err) {
        console.log(err)
        return res.json({
            isError: true,
            message: '아이디 생성을 실패했습니다.',
        });
    }
}
);

export = router;
