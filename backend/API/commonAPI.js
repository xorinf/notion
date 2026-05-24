/**
 * @file commonAPI.js
 * @module commonAPI
 * @description Express router endpoints for commonAPI. Handles CRUD operations and validation.
 */

import exp, { response } from 'express';
import { userModel } from '../models/mainModels.js';
import jwt from 'jsonwebtoken'
import { hash, compare } from 'bcryptjs'
// import { config } from 'dotenv';
import { verifyToken } from '../middleware/verifyToken.js';
// config({ override: false })

export const commonAPP = exp.Router()

commonAPP.post("/login", async (req, res, next) => {
    try {
        //get user cred obj
        const { email, password } = req.body;
        //find user by email
        const user = await userModel.findOne({ email: email });
        //if user not found
        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }
        //compare password

        const passwordMatch = await compare(password, user.password);
        //if passwords not matched
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }
        //create jwt
        const signedToken = jwt.sign(
            {
                id: user._id,
                email: email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatarUrl: user.avatarUrl,
            },
            process.env.SECRET_KEY,
            {
                expiresIn: "1h",
            },
        );
        const userObj = user.toObject()
        delete userObj.password;
        //send res
        res.cookie("token", signedToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });
        res.status(200).json({ message: "login success", payload: userObj });
    } catch (err) {
        next(err);
    }
});

commonAPP.get("/logout", (req, res, next) => {

    try {
        if (!req.cookies?.token) { return res.status(403).json({ message: "invalid request.." }) }
        //delete token from cookie storage
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
        });
        if (!req.cookies?.token) { return res.status(400).json({ message: "Logout failed!" }); }
        //send res
        return res.status(200).json({ message: "Logout success" });
    } catch (error) {
        next(error)
    }
});

commonAPP.post("/register", async (request, response, next) => {
    try {
        //get user data
        const newUser = request.body;
        newUser.password = await hash(newUser.password, Number(process.env.SALT));

        //create new user document
        const newUserDoc = new userModel(newUser);

        //save document
        await newUserDoc.save();
        response.status(201).json({ message: "user created!" });

    } catch (err) {
        next(err);
    }
});

commonAPP.get("/check-auth", verifyToken(), async (request, response) => {
    response.status(200).json({ message: "Authenticated", payload: request.user });
})

commonAPP.get("/you", (request, response, next) => { try { response.send("Alr Nigga")} catch(err){console.log(err)} })