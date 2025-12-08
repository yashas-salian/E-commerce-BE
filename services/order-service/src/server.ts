import express, {type Express} from "express"
import orderRouter from './routes/orders.route.js'
import { autoLogger, errorLogger } from "@yashas40/log"

const app: Express = express()
app.use(express.json())
app.use(autoLogger("order-service"))

app.get('/health', (_req, res)=>{
    res.json({
        message: "Order service is healthy"
    })
})
app.use('app/v1/orders', orderRouter)

app.use(errorLogger('order-service'))
app.listen(3000)
export default app  