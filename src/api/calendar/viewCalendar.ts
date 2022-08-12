import express, { Request, Response, NextFunction } from 'express';
import { sql } from '../../dbHandle';

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post('/', async (req: Request, res: Response) => {

    const { targetDate }: { targetDate: string } = Object.assign(req.body, req.query);

    if (!targetDate) {
        return res.json({
            isError: true,
            message: '입력하지 않은 값들이 있습니다.',
        });
    }

    try {
        const rows = await sql(`SELECT * FROM ${process.env.MYSQL_DB}.calendar WHERE DATE_FORMAT(sDate, '%Y-%m') = '?'`, [targetDate]);
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