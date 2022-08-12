import express, { Request, Response, NextFunction } from 'express';
import { sql } from '../../dbHandle';

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.get('/', async (req: Request, res: Response) => {

    const { targetDate, userID }: { targetDate: string, userID: string | null } = Object.assign(req.body, req.query);

    try {
        const WHERE_CONDITION = targetDate || userID ? 'WHERE' : '';
        const WHERE_CONDITION_TARGET_DATE = targetDate ? `DATE_FORMAT(sDate, "%Y-%m")='${targetDate}'` : '';
        const WHERE_CONDITION_USER_ID = userID ? `userID='${userID}'` : '';
        const AND_CONDITION = targetDate && userID ? 'AND' : '';

        const rows = await sql(`SELECT * FROM ${process.env.MYSQL_DB}.calendar ${WHERE_CONDITION} ${WHERE_CONDITION_TARGET_DATE} ${AND_CONDITION} ${WHERE_CONDITION_USER_ID}`, []);

        return res.json({
            isError: false,
            message: '일정을 로드하는데 성공했습니다.',
            rows
        });
    } catch (err: any) {
        return res.json({ isError: true, message: err });
    }

});

export = router;