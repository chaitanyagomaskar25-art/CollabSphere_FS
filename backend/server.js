import express from 'express'
import "dotenv/config"
import { connectDb } from './src/config/db.js'
import { authRouter } from './src/routes/authRoute.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { projectRouter } from './src/routes/projectRoutes.js'

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.get("/", (req, res)=>{
    res.json({
        message: "congratulations!!"
    })
})

app.use("/api/auth", authRouter)

app.use("/api/projects", projectRouter)

connectDb()

app.listen(process.env.PORT, ()=>{
    console.log("Sever is running..!!")
})