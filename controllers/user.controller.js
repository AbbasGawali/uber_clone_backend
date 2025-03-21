import UserModel from "../models/user.model.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password } = req.body;
    if (!fullName.firstName || !email || !password) {
        throw new Error("All fields are required!")
    }

    const userMatch = await UserModel.findOne({ email: email });
    if (userMatch) {
        return res.status(400).json({ success: false, message: "user already exists " });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
        fullName: {
            firstName: fullName.firstName,
            lastName: fullName.lastName,
        },
        email,
        password: hashedPassword
    })
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)

    res.status(201).json({ token, user });
}

export const loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    if (!email || !password) {
        throw new Error("All fields are required!")
    }

    const userMatch = await UserModel.findOne({ email: email }).select("+password");
    if (!userMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const comparePass = await bcrypt.compare(password, userMatch.password);
    if (!comparePass) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ _id: userMatch._id }, process.env.JWT_SECRET)

    res.status(200).json({
        token, userMatch: {
            fullName: userMatch.fullName,
            _id: userMatch._id,
            email: userMatch.email,
            __v: userMatch.__v
        }
    });
}