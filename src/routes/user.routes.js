"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// Register or retrieve user
router.post('/register', user_controller_1.registerUser);
router.post('/login', user_controller_1.loginUser);
exports.default = router;
