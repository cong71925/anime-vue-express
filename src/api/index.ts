import { Request, Response } from 'express'
export const index = (req: Request, res: Response): void => {
    
    res.json({
        state: 1,
        msg: "hello, world!"
    })
}
