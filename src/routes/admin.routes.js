"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/admin.routes.ts
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Initial registration route (for setup)
router.post('/register', admin_controller_1.registerAdmin);
// Admin login route
router.post('/login', admin_controller_1.loginAdmin);
// Admin management routes
router.post('/add', auth_middleware_1.authenticateAdmin, admin_controller_1.addAdmin);
router.delete('/remove/:adminId', auth_middleware_1.authenticateAdmin, admin_controller_1.removeAdmin);
router.get('/all', auth_middleware_1.authenticateAdmin, admin_controller_1.getAdmins);
exports.default = router;
