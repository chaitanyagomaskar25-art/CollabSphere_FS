import express from 'express'

const app = express()


app.get("/", (req, res)=>{
    res.json({
        message: "congratulations!!"
    })
})


app.listen(3000, ()=>{
    console.log("Sever is running..!!")
})