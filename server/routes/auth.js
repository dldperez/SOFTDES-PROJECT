const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// SIGN UP
router.post("/signup", async (req, res) => {
  try {
    const {
      surname,
      firstName,
      middleInitial,
      email,
      mobileNumber,
      accountNumber,
      username,
      password,
    } = req.body;

    if (
      !surname ||
      !firstName ||
      !email ||
      !mobileNumber ||
      !accountNumber ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        message: "All required fields must be filled.",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        message: "Username is already taken.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      surname,
      firstName,
      middleInitial,
      email,
      mobileNumber,
      accountNumber,
      username,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: user._id,
        surname: user.surname,
        firstName: user.firstName,
        middleInitial: user.middleInitial,
        email: user.email,
        mobileNumber: user.mobileNumber,
        accountNumber: user.accountNumber,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Server error during signup.",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        surname: user.surname,
        firstName: user.firstName,
        middleInitial: user.middleInitial,
        email: user.email,
        mobileNumber: user.mobileNumber,
        accountNumber: user.accountNumber,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});

module.exports = router;