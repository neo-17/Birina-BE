"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/userProfile.routes.ts
const express_1 = require("express");
const userProfile_controller_1 = require("../controllers/userProfile.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// GET /api/users/profile/:username
router.get('/profile/:username', auth_middleware_1.authenticateUser, userProfile_controller_1.getUserProfile);
// PUT /api/users/:username/pin
// router.put('/:username/pin', updateUserPin);
// POST /api/users/reveal-key
router.post('/reveal-key', auth_middleware_1.authenticateUser, userProfile_controller_1.revealUserPrivateKey);
exports.default = router;
