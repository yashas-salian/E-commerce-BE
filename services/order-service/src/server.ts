import express, {type Express} from "express"
import orderRouter from './routes/orders.route.js'


const app: Express = express()

app.use('/orders', orderRouter)

export default app