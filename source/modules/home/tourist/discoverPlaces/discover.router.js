import { Router } from "express"
import historicRouter from './historic/routes.js'
import entertainmentRouter from './entertainment/routes.js'

const router = Router()

router.use('/historic', historicRouter)
router.use('/entertainment', entertainmentRouter)

export default router