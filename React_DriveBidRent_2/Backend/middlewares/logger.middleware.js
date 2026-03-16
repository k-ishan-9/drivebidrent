import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDirectory = path.join(__dirname, "..", "logs");

if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true });
}

function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getAccessLogPath() {
    return path.join(logsDirectory, `access-${getTodayString()}.log`);
}

function getErrorLogPath() {
    return path.join(logsDirectory, `error.log`);
}


morgan.token("username", (req) => {
    return req.user
        ? req.user.firstName || req.user.email || "anonymous"
        : "guest";
});

morgan.token("usertype", (req) => {
    return req.user ? req.user.role || req.user.userType || "none" : "none";
});

morgan.token("userid", (req) => {
    return req.user ? req.user._id?.toString() || req.user.id?.toString() || "-" : "-";
});

morgan.token("body", (req) => {
    if (
        req.originalUrl.includes("login") ||
        req.originalUrl.includes("register") ||
        req.originalUrl.includes("password") ||
        req.originalUrl.includes("forgot") ||
        req.originalUrl.includes("reset")
    ) {
        return "[REDACTED]";
    }

    try {
        return req.body && Object.keys(req.body).length > 0
            ? JSON.stringify(req.body)
            : "-";
    } catch {
        return "-";
    }
});

morgan.token("ip", (req) => {
    return (
        req.ip ||
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        "-"
    );
});

morgan.format(
    "detailed",
    ":date[iso]  :method  :url  :status  :response-time ms │ " +
    "user=:username  type=:usertype  id=:userid  ip=:ip  │  body=:body"
);

function createWriteStream(logPath) {
    return {
        write: (message) => {
            fs.appendFile(logPath, message, (err) => {
                if (err) {
                    console.error("Failed to write to log file:", err);
                }
            });
        }
    };
}

const accessFileStream = createWriteStream(getAccessLogPath());
const errorFileStream = createWriteStream(getErrorLogPath());

export const accessLogger = morgan("detailed", {
    immediate: true,
    stream: accessFileStream
});

export const errorLogger = morgan("detailed", {
    skip: (req, res) => res.statusCode < 400,
    stream: errorFileStream
});

export const devLogger = morgan("dev", {
    skip: (req) =>
        req.url.includes("/notifications") ||
        req.url.includes("/auction/") ||
        req.url.includes("/buyer/dashboard") ||
        req.url.includes("/wishlist") ||
        req.url.includes("/socket.io"),
});

export const logger = (req, res, next) => {
    accessLogger(req, res, (err) => {
        if (err) return next(err);
        errorLogger(req, res, next);
    });
};