"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const admin_routes_1 = require("./routes/admin.routes");
const judge_routes_1 = require("./routes/judge.routes");
const node_cron_1 = __importDefault(require("node-cron"));
const request_1 = __importDefault(require("request"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Express Configuration
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.set('PORT', process.env.PORT || 3000);
app.set("BASE_URL", process.env.BASE_URL || "localhost");
if (process.env.NODE_ENV === 'dev') {
    app.use("/dev/api/admin", admin_routes_1.adminRoutes);
    app.use("/dev/api/judge", judge_routes_1.JudgeRouter);
}
else {
    app.get('/api/admin', admin_routes_1.adminRoutes);
    app.use("/dev/api/judge", judge_routes_1.JudgeRouter);
}
app.get('/ping', (req, res) => {
    res.send('pong');
});
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("Db connected");
        const port = app.get('PORT');
        const baseURL = app.get("BASE_URL");
        server.listen(port, () => {
            console.log("Server is listening", port);
        });
    }
    catch (error) {
        console.error('Error starting server:', error);
    }
});
node_cron_1.default.schedule("*/5 * * * *", () => {
    console.log("Sending scheduled request at", new Date().toLocaleDateString(), "at", `${new Date().getHours()}:${new Date().getMinutes()}`);
    (0, request_1.default)('https://judging-be.onrender.com/ping', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("im okay");
            // console.log(body) // Optionally, log the response body
        }
    });
});
startServer();
exports.default = server;
//# sourceMappingURL=index.js.map