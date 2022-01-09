const express = require("express");
const router = express.Router();
const fileupload = require("express-fileupload");
const cookieSession = require("cookie-session");
const fs = require("fs");
const path = require("path");
const db = require("../user_modules/db.cjs");

