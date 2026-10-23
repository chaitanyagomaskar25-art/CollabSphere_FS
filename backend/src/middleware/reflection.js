import jwt from 'jsonwebtoken'
import { User } from '../model/userModel.js'

export const verifyAcessToken = async (req, res, next) => {
    try {
        const accessToken = req.cookies.access_token
        if(!accessToken){
            return res.json({
                message: "Token not found"
            })
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN)

        const user = await User.findById(decoded.userId)

        if(!user){
            return res.json({
                message: "User not found"
            })
        }

        req.user = user
        next()


    } catch (error) {
        res.json({
            message: error.message
        })
    }
}