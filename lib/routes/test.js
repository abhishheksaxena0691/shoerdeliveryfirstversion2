"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
router.get(["/", "/index"], function (req, res) {
    res.render("test/test", {
        title: "VCaption",
        relPath: "./"
    });
});
// router.get("/connect-with-agent", function(req, res) {
//   res.render("connect-with-agent", {
//     title: "VCaption"
//   });
// });
module.exports = router;
