"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const gamosa_routes_1 = __importDefault(require("./routes/gamosa.routes"));
const nft_routes_1 = __importDefault(require("./routes/nft.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const userProfile_routes_1 = __importDefault(require("./routes/userProfile.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Database Connection
(0, db_1.connectDB)();
// Middleware
// Allow requests from your frontend URL
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Backend API is running' });
});
app.use('/api/gamosas', gamosa_routes_1.default);
app.use('/api/nft', nft_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/users', userProfile_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
