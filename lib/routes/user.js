"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
var multer_1 = __importDefault(require("multer"));
var fullUrl = require("full-url");
var url_1 = __importDefault(require("url"));
var models_1 = require("../models/models");
var winston_1 = require("../config/winston");
var User = __importStar(require("../models/user"));
var Token = __importStar(require("../models/token"));
var Brochure = __importStar(require("../models/brochure"));
var Help = __importStar(require("../models/help"));
var qr_image_1 = __importDefault(require("qr-image"));
var randomstring_1 = __importDefault(require("randomstring"));
var index_1 = require("../index");
var PDFParser = require("pdf2json");
var pdfParse = require("pdf-parse");
var path_1 = __importDefault(require("path"));
var html_pdf_1 = __importDefault(require("html-pdf"));
var fs_1 = __importDefault(require("fs"));
var pdfMerge = require("easy-pdf-merge");
var util = require("util");
exports.brochureToUserIdMap = {};
// {
//   let dataBuffer = fs.readFileSync("public\\uploads\\Brochure.pdf");
//   pdfParse(dataBuffer).then(function(data: any) {
//     //console.log(data.text);
//     const splitText = data.text.split(/\r?\n/);
//     let pdfData: any = {};
//     pdfData.reports = [];
//     for (let itr = 0; itr < splitText.length; itr++) {
//       let lineData = splitText[itr].trim();
//       const dateFormat = /^(((0)[0-9])|((1)[0-2]))(\-)([0-2][0-9]|(3)[0-1])(\-)\d{4}$/;
//       if (!pdfData.title && lineData.length > 0) {
//         pdfData.title = lineData;
//       } else if (!pdfData.customer && lineData.indexOf("Customer:") >= 0) {
//         pdfData.customer = lineData
//           .substring(lineData.indexOf("Customer:") + "Customer:".length)
//           .trim();
//         continue;
//       } else if (!pdfData.seller && lineData.indexOf("Seller:") >= 0) {
//         pdfData.seller = lineData
//           .substring(lineData.indexOf("Seller:") + "Seller:".length)
//           .trim();
//         continue;
//       } else if (!pdfData.transaction && lineData.indexOf("Transaction") >= 0) {
//         pdfData.transaction = lineData
//           .substring(lineData.indexOf("Transaction") + "Transaction".length)
//           .trim();
//         continue;
//       } else if (!pdfData.date && lineData.match(dateFormat)) {
//         pdfData.date = lineData;
//         itr++;
//         pdfData.time = splitText[itr].trim();
//         continue;
//         // 8377 is ascii code of rupee symbol
//       } else if (
//         lineData.length > 0 &&
//         lineData[0] === String.fromCharCode(8377) &&
//         splitText[itr + 1] &&
//         splitText[itr + 1].indexOf(" X") > 0
//       ) {
//         let amount = lineData.substring(1).trim();
//         //amount = amount.replace(/\,/g, "");
//         itr++;
//         lineData = splitText[itr].trim();
//         let description = lineData.substring(lineData.indexOf(" ") + 2).trim();
//         let qty = lineData.substring(0, lineData.indexOf(" ")).trim();
//         pdfData.reports.push({
//           description: description,
//           qty: qty,
//           amount: amount
//         });
//         continue;
//       } else if (!pdfData.total && lineData.indexOf("Total:") >= 0) {
//         let total = lineData
//           .substring(lineData.indexOf("Total:") + "Total:".length + 1)
//           .trim();
//         //total = total.replace(/\,/g, "");
//         pdfData.total = total;
//         continue;
//       }
//     }
//     console.log(pdfData);
//   });
//   // let pdfParser = new PDFParser(null, 1);
//   // pdfParser.on("pdfParser_dataError", (errData:  any) => console.error(errData.parserError) );
//   // pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
//   //        console.log(pdfParser.getRawTextContent());
//   //     });
//   //     pdfParser.loadPDF("public\\uploads\\Brochure.pdf");
//   // const { TesseractWorker } = Tesseract;
//   // const worker = new TesseractWorker();
//   // worker
//   //   .recognize('public\\uploads\\WhatsApp Image 2019-07-30 at 1.24.45 PM.jpeg')
//   //   .progress((p:any) => {
//   //     console.log('progress', p);
//   //   })
//   //   .then(({text}:any) => {
//   //     console.log(text);
//   //     worker.terminate();
//   //   });
// }
// Profile Image multer settings
var profileImageStorage = multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/images/uploads");
    },
    filename: function (req, file, callback) {
        var filename = file.fieldname + "_" + Date.now() + "_" + file.originalname;
        winston_1.logger.silly("File upload: " + filename);
        callback(null, filename);
    }
});
var profileImageUpload = multer_1.default({
    storage: profileImageStorage
}).single("file");
// Brochure multer settings
var brochureStorage = multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/uploads");
    },
    filename: function (req, file, callback) {
        var filename = file.originalname;
        winston_1.logger.silly("Brochure upload: " + filename);
        callback(null, filename);
    }
});
var brochureUpload = multer_1.default({
    storage: brochureStorage
}).single("file");
router.post("/help", function (req, res) {
    localAuthenticate(req, res, function (isValid, message, user) {
        if (isValid) {
            if (!req.body.question) {
                var responseObj = new models_1.ResponseObj(400, "Missing parameter 'question'", null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            var question = req.body.question;
            var help = new Help.HelpModel({
                question: question,
                userId: user.id
            });
            Help.createHelp(help, function (err, helpObj) {
                if (err || !helpObj) {
                    var responseObj_1 = new models_1.ResponseObj(400, "Failed to add new question", null);
                    res.status(responseObj_1.status).json(responseObj_1);
                    return;
                }
                var responseObj = new models_1.ResponseObj(200, "Success", null);
                res.status(responseObj.status).json(responseObj);
            });
        }
        else {
            var responseObj = new models_1.ResponseObj(403, "You are not authorized to perform this action!", null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
    });
});
router.post("/update-profile", function (req, res) {
    localAuthenticate(req, res, function (isValid, message, user) {
        if (isValid) {
            if (!req.body.fullname) {
                var responseObj = new models_1.ResponseObj(400, "Missing parameter 'fullname'", null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            if (!req.body.email) {
                var responseObj = new models_1.ResponseObj(400, "Missing parameter 'email'", null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            var oldEmail = user.email;
            var fullname = req.body.fullname;
            var email = req.body.email;
            user.email = email;
            user.fullname = fullname;
            User.updateUserByEmail(oldEmail, user, function (err, userObj) {
                if (err || !userObj) {
                    var responseObj_2 = new models_1.ResponseObj(400, "Failed to update user!", null);
                    res.status(responseObj_2.status).json(responseObj_2);
                    return;
                }
                var responseObj = new models_1.ResponseObj(200, "Success", null);
                res.status(responseObj.status).json(responseObj);
            });
        }
        else {
            var responseObj = new models_1.ResponseObj(403, "You are not authorized to perform this action!", null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
    });
});
router.post("/change-password", function (req, res) {
    localAuthenticate(req, res, function (isValid, message, user) {
        if (isValid) {
            if (!req.body.newpassword) {
                var responseObj = new models_1.ResponseObj(400, "Missing parameter 'new password'", null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            if (!req.body.newpasswordre) {
                var responseObj = new models_1.ResponseObj(400, "Missing parameter 'confirm password'", null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            var oldPassword = user.password;
            var newpassword = req.body.newpassword;
            var newpasswordre = req.body.newpasswordre;
            if (newpassword !== newpasswordre) {
                var responseObj = new models_1.ResponseObj(400, "new password and confirm password do not match", null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            User.createSaltedPassword(newpassword, function (err, hashedPassword) {
                if (err) {
                    var responseObj = new models_1.ResponseObj(500, "Failed to encrypt password!", null);
                    res.status(responseObj.status).json(responseObj);
                    return;
                }
                user.password = hashedPassword;
                User.updateUserByEmail(user.email, user, function (err, userObj) {
                    if (err || !userObj) {
                        var responseObj_3 = new models_1.ResponseObj(400, "Failed to update password!", null);
                        res.status(responseObj_3.status).json(responseObj_3);
                        return;
                    }
                    var responseObj = new models_1.ResponseObj(200, "Success", null);
                    res.status(responseObj.status).json(responseObj);
                });
            });
        }
        else {
            var responseObj = new models_1.ResponseObj(403, "You are not authorized to perform this action!", null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
    });
});
router.post("/update-profile-image", function (req, res) {
    localAuthenticate(req, res, function (isValid, message, user) {
        if (isValid) {
            profileImageUpload(req, res, function (err) {
                if (err) {
                    winston_1.logger.error(err);
                    var responseObj = new models_1.ResponseObj(400, "Failed to upload image!", null);
                    res.status(responseObj.status).json(responseObj);
                    return;
                }
                var image = req.file.path;
                if (image.length > 7 && image.indexOf("public") === 0) {
                    image = image.substring(7);
                }
                user.image = image;
                User.updateUserByEmail(user.email, user, function (err, userObj) {
                    if (err || !userObj) {
                        var responseObj_4 = new models_1.ResponseObj(400, "Failed to update user!", null);
                        res.status(responseObj_4.status).json(responseObj_4);
                        return;
                    }
                    var responseObj = new models_1.ResponseObj(200, "Success", null);
                    res.status(responseObj.status).json(responseObj);
                });
            });
        }
        else {
            var responseObj = new models_1.ResponseObj(403, "You are not authorized to perform this action!", null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
    });
});
router.get("/qr-code-image", function (req, res) {
    localAuthenticate(req, res, function (isValid, message, user) {
        if (isValid) {
            var filename = user.mobile + "_" + new Date().getTime();
            var qrImage = qr_image_1.default.imageSync(filename, { type: "svg" });
            exports.brochureToUserIdMap[filename] = user.id;
            var responseObj = new models_1.ResponseObj(200, "Success", qrImage);
            res.status(responseObj.status).json(responseObj);
        }
        else {
            var responseObj = new models_1.ResponseObj(404, "Resource not found in user", null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
    });
});
router.post("/get-reports", function (req, res) {
    localAuthenticate(req, res, function (isValid, message, user) {
        if (isValid) {
            if (!req.body.startDate) {
                var responseObj = new models_1.ResponseObj(400, "Missing parameter 'startDate'", null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            if (!req.body.endDate) {
                var responseObj = new models_1.ResponseObj(400, "Missing parameter 'endDate'", null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            var startDate = new Date(req.body.startDate);
            var endDate = new Date(req.body.endDate);
            endDate.setDate(endDate.getDate() + 1);
            Brochure.findByDateRange(startDate, endDate, function (err, brochureArr) {
                if (err || !brochureArr) {
                    var responseObj_5 = new models_1.ResponseObj(400, "Error finding brochures!", null);
                    res.status(responseObj_5.status).json(responseObj_5);
                    return;
                }
                winston_1.logger.debug(JSON.stringify(brochureArr));
                var responseObj = new models_1.ResponseObj(200, "Success", brochureArr);
                res.status(responseObj.status).json(responseObj);
            });
        }
        else {
            var responseObj = new models_1.ResponseObj(403, "You are not authorized to perform this action!", null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
    });
});
router.post("/make-payment", function (req, res) {
    if (!req.body.id) {
        var responseObj = new models_1.ResponseObj(400, "Missing parameter 'id'", null);
        res.status(responseObj.status).json(responseObj);
        return;
    }
    var brochureId = req.body.id;
    Brochure.findByBrochureId(brochureId, function (err, brochure) {
        if (err || !brochure) {
            var responseObj = new models_1.ResponseObj(400, "Error finding brochure!", null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
        brochure.paymentStatus = Brochure.PaymentStatus.PAID_ONLINE;
        brochure.receiptId = generateReceiptId();
        brochure.transactionId = generateTransactionId();
        brochure.paymentDate = new Date();
        Brochure.updateBrochureById(brochureId, brochure, function (err, result) {
            if (err || !result) {
                var responseObj = new models_1.ResponseObj(400, "Failed to update payment status!", null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            createReceiptAndMerge(brochure, function (err, brochureUpdated) {
                if (err || !brochureUpdated) {
                    var responseObj_6 = new models_1.ResponseObj(400, "Failed to merge receipt!", null);
                    res.status(responseObj_6.status).json(responseObj_6);
                    return;
                }
                var responseObj = new models_1.ResponseObj(200, "Success", brochure);
                res.status(responseObj.status).json(responseObj);
            });
        });
    });
});
/********************* BOT ******************************/
router.post("/bot/upload-file", function (req, res) {
    localAuthenticate(req, res, function (isValid, message, user) {
        if (isValid) {
            brochureUpload(req, res, function (err) {
                if (err) {
                    winston_1.logger.error(err);
                    var responseObj = new models_1.ResponseObj(400, "Failed to upload brochure!", null);
                    res.status(responseObj.status).json(responseObj);
                    return;
                }
                var brochure = req.file.path;
                if (brochure.length > 7 && brochure.indexOf("public") === 0) {
                    brochure = brochure.substring(7);
                }
                var truncatedFileName = req.file.originalname.substring(0, req.file.originalname.length - 4);
                if (!exports.brochureToUserIdMap[truncatedFileName]) {
                    winston_1.logger.error("Brochure mapping not found for file: " + req.file.originalname);
                    var responseObj = new models_1.ResponseObj(200, "Success", {
                        data: "Brochure mapping not found!"
                    });
                    res.status(responseObj.status).json(responseObj);
                    return;
                }
                var userId = exports.brochureToUserIdMap[truncatedFileName];
                delete exports.brochureToUserIdMap[truncatedFileName];
                var brochureObj = new Brochure.BrochureModel({
                    name: req.file.originalname,
                    originalFilename: req.file.originalname,
                    originalFilePath: brochure,
                    path: brochure,
                    userId: userId,
                    username: user.fullname,
                    coupon: generateCouponCode(),
                    amount: 0
                });
                Brochure.findByBrochureName(brochureObj.name, function (err, brochureObjFromDB) {
                    if (err) {
                        winston_1.logger.error(err);
                        winston_1.logger.error("Error finding brochure in DB");
                    }
                    if (brochureObjFromDB) {
                        winston_1.logger.debug("Brochure already exists in DB: " + brochureObjFromDB.name);
                        parsePDFForReports(brochureObjFromDB, function (errBr, updatedBrochureObj) {
                            if (errBr || !updatedBrochureObj) {
                                winston_1.logger.error("parsePDFForReports failed: " + errBr);
                                var responseObj = new models_1.ResponseObj(500, "parsePDFForReports failed: " + errBr, null);
                                res.status(responseObj.status).json(responseObj);
                                return;
                            }
                            createPaymentLinkAndMerge(req, user, updatedBrochureObj, function (errPdf, mergedBrochure) {
                                if (errPdf || !mergedBrochure) {
                                    var responseObj_7 = new models_1.ResponseObj(500, "createPaymentLinkAndMerge failed: " + errBr, null);
                                    res.status(responseObj_7.status).json(responseObj_7);
                                    return;
                                }
                                index_1.socket.brochureReady(userId, mergedBrochure.name, mergedBrochure.path);
                                var responseObj = new models_1.ResponseObj(200, "Success", null);
                                res.status(responseObj.status).json(responseObj);
                            });
                        });
                    }
                    else {
                        Brochure.createBrochure(brochureObj, function (err, result) {
                            if (err) {
                                winston_1.logger.error(err);
                                winston_1.logger.error("Failed to create new Brochure!");
                                var responseObj = new models_1.ResponseObj(500, "Failed to create new Brochure!", null);
                                res.status(responseObj.status).json(responseObj);
                                return;
                            }
                            parsePDFForReports(brochureObj, function (errBr, updatedBrochureObj) {
                                if (errBr || !updatedBrochureObj) {
                                    winston_1.logger.error("parsePDFForReports failed: " + errBr);
                                    var responseObj = new models_1.ResponseObj(500, "parsePDFForReports failed: " + errBr, null);
                                    res.status(responseObj.status).json(responseObj);
                                    return;
                                }
                                createPaymentLinkAndMerge(req, user, updatedBrochureObj, function (errPdf, mergedBrochure) {
                                    if (errPdf || !mergedBrochure) {
                                        var responseObj_8 = new models_1.ResponseObj(500, "createPaymentLinkAndMerge failed: " + errBr, null);
                                        res.status(responseObj_8.status).json(responseObj_8);
                                        return;
                                    }
                                    index_1.socket.brochureReady(userId, mergedBrochure.name, mergedBrochure.path);
                                    var responseObj = new models_1.ResponseObj(200, "Success", null);
                                    res.status(responseObj.status).json(responseObj);
                                });
                            });
                        });
                    }
                });
            });
        }
        else {
            var responseObj = new models_1.ResponseObj(403, "You are not authorized to perform this action!!", null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
    });
});
/******************** Paths ****************************/
router.get("/index", function (req, res) {
    localAuthenticate(req, res, function (isValid, message, user) {
        if (isValid) {
            Brochure.findAllByUserId(user.id, function (err, brochureList) {
                if (err || !brochureList) {
                    winston_1.logger.error("Failed to fetch brochures for user: " + user.email);
                    brochureList = [];
                }
                Help.findAllByUserId(user.id, function (err, helpList) {
                    if (err || !helpList) {
                        winston_1.logger.error("Failed to fetch help list for user: " + user.email);
                        helpList = [];
                    }
                    res.render("user/index", {
                        title: "Shoe Factory",
                        relPath: "../",
                        user: user,
                        brochureList: brochureList,
                        helpList: helpList
                    });
                });
            });
        }
        else {
            res.render("403", {
                title: "Shoe Factory",
                relPath: "./"
            });
        }
    });
});
router.get("/profile", function (req, res) {
    localAuthenticate(req, res, function (isValid, message, user) {
        if (isValid) {
            res.render("user/profile", {
                title: "Shoe Factory",
                relPath: "../",
                user: user
            });
        }
        else {
            res.render("403", {
                title: "Shoe Factory",
                relPath: "./"
            });
        }
    });
});
router.get("/payment", function (req, res) {
    if (!req.query.id) {
        res.render("403", {
            title: "Shoe Factory",
            relPath: "./",
            message: "Missing parameter 'id'"
        });
        return;
    }
    var brochureId = req.query.id;
    Brochure.findByBrochureId(brochureId, function (err, brochure) {
        if (err || !brochure) {
            res.render("403", {
                title: "Shoe Factory",
                relPath: "./",
                message: "Brochure details not found!"
            });
            return;
        }
        User.findByUserId(brochure.userId, true, function (errUsr, user) {
            if (errUsr || !user) {
                res.render("403", {
                    title: "Shoe Factory",
                    relPath: "./",
                    message: "User details not found!"
                });
                return;
            }
            res.render("payment", {
                title: "Shoe Factory",
                relPath: "./",
                user: user,
                brochure: brochure
            });
        });
    });
});
module.exports = router;
/********************* Authentication ******************/
function localAuthenticate(req, res, cb) {
    winston_1.logger.silly("Query Token: " + req.query.token);
    if (typeof req.query.token === "undefined") {
        return cb(false, "Unauthorized!", null);
    }
    var token = req.query.token;
    Token.findByToken(token, function (err, tokenFromDb) {
        if (err) {
            return cb(false, "Unauthorized", null);
        }
        if (!tokenFromDb) {
            return cb(false, "Unauthorized", null);
        }
        User.findByUserId(tokenFromDb.userId, false, function (err, user) {
            if (err) {
                return cb(false, "Unauthorized", null);
            }
            if (!user) {
                return cb(false, "Unauthorized", null);
            }
            return cb(true, "Shoe Factory", user);
        });
    });
}
/****************** Supporting Functions ******************/
function generateCouponCode() {
    var coupon = randomstring_1.default.generate({ length: 8, charset: "alphanumeric" });
    //logger.silly("Coupon Code: " + coupon);
    return coupon;
}
function generateTransactionId() {
    var transactionId = randomstring_1.default.generate({
        length: 11,
        charset: "numeric"
    });
    //logger.silly("Transaction Id: " + receiptId);
    return transactionId;
}
function generateReceiptId() {
    var receiptId = randomstring_1.default.generate({
        length: 12,
        charset: "alphanumeric"
    });
    //logger.silly("Receipt Id: " + receiptId);
    return receiptId;
}
function parsePDFForReports(brochure, cb) {
    // let pdfParser = new PDFParser(null, 1);
    // pdfParser.on("pdfParser_dataError", (errData: { parserError: any }) => {
    //   logger.error("PDF Parse Error: " + errData.parserError);
    //   cb(errData.parserError || "PDF Parse Error", null);
    // });
    // pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
    //   const rawText = pdfParser.getRawTextContent();
    //   logger.silly(rawText);
    //   const splitText = rawText.split(/\r?\n/);
    //   let reportArr: Brochure.IBrochureReport[] = [];
    //   let balanceDue: any;
    //   let isValid = false;
    //   for (let itr = 0; itr < splitText.length; itr++) {
    //     let text = splitText[itr].trim();
    //     logger.silly("Line #" + itr + ": " + text);
    //     if (text.indexOf("DescriptionRateQtyAmount") >= 0) {
    //       isValid = true;
    //     } else if (!isValid) {
    //       continue;
    //     }
    //     itr++;
    //     while (itr + 2 < splitText.length) {
    //       const title = splitText[itr].trim();
    //       itr++;
    //       if (splitText[itr].trim().length > 0) {
    //         logger.silly("Empty line not found");
    //         break;
    //       }
    //       itr++;
    //       let value = splitText[itr].trim();
    //       //logger.debug("Title: " + title + ", amount: " + value);
    //       if (value.indexOf(String.fromCharCode(160)) < 0) {
    //         logger.silly("Space not found");
    //         break;
    //       }
    //       value = value.substring(
    //         value.lastIndexOf(String.fromCharCode(160)) + 1
    //       );
    //       value = value.replace(/\,/g, "");
    //       let report: Brochure.IBrochureReport = {
    //         description: title,
    //         qty: '1',
    //         amount: value
    //       };
    //       logger.debug("Title: " + title + ", amount: " + value);
    //       reportArr.push(report);
    //       itr++;
    //     }
    //     if (reportArr.length > 0) {
    //       while (
    //         itr < splitText.length &&
    //         splitText[itr].trim().indexOf("Balance Due") < 0
    //       ) {
    //         itr++;
    //       }
    //       if (
    //         itr < splitText.length &&
    //         splitText[itr].trim().indexOf("Balance Due") >= 0
    //       ) {
    //         balanceDue = splitText[itr].trim();
    //         balanceDue = balanceDue.substring(
    //           balanceDue.lastIndexOf(String.fromCharCode(160)) + 1
    //         );
    //         balanceDue = balanceDue.replace(/\,/g, "");
    //         logger.debug("Balance Due: " + balanceDue);
    //       }
    //     } else {
    //       break;
    //     }
    //   }
    //   if (balanceDue && reportArr.length > 0) {
    //     Brochure.findByBrochureName(brochure.name, function(
    //       err: any,
    //       brochureObjFromDB: any
    //     ) {
    //       if (err || !brochureObjFromDB) {
    //         logger.error(err);
    //         logger.error("Error finding brochure in DB");
    //       } else {
    //         brochureObjFromDB.amount = balanceDue;
    //         brochureObjFromDB.reports = reportArr;
    //         logger.debug(brochureObjFromDB.id);
    //         logger.debug(JSON.stringify(brochureObjFromDB));
    //         Brochure.updateBrochureById(
    //           brochureObjFromDB._id,
    //           brochureObjFromDB,
    //           function(err: any, result: any) {
    //             logger.debug(
    //               "Brochure updated result: " + JSON.stringify(result)
    //             );
    //             cb(null, brochureObjFromDB);
    //           }
    //         );
    //       }
    //     });
    //   } else {
    //     logger.error("Invalid PDF document supplied");
    //     cb("Invalid PDF document supplied", null);
    //   }
    // });
    // pdfParser.loadPDF(path.resolve(".") + "/public/" + brochure.path);
    winston_1.logger.silly(path_1.default.resolve(".") + "/public/" + brochure.path);
    var dataBuffer = fs_1.default.readFileSync(path_1.default.resolve(".") + "/public/" + brochure.path);
    pdfParse(dataBuffer).then(function (data) {
        //console.log(data.text);
        var splitText = data.text.split(/\r?\n/);
        var pdfData = {};
        pdfData.reports = [];
        var isParsingComplete = false;
        for (var itr = 0; itr < splitText.length; itr++) {
            var lineData = splitText[itr].trim();
            var dateFormat = /^(((0)[0-9])|((1)[0-2]))(\-)([0-2][0-9]|(3)[0-1])(\-)\d{4}$/;
            if (!pdfData.title && lineData.length > 0) {
                pdfData.title = lineData;
            }
            else if (!pdfData.customer && lineData.indexOf("Customer:") >= 0) {
                pdfData.customer = lineData
                    .substring(lineData.indexOf("Customer:") + "Customer:".length)
                    .trim();
                continue;
            }
            else if (!pdfData.seller && lineData.indexOf("Seller:") >= 0) {
                pdfData.seller = lineData
                    .substring(lineData.indexOf("Seller:") + "Seller:".length)
                    .trim();
                itr++;
                pdfData.subTitle = splitText[itr].trim();
                continue;
            }
            else if (!pdfData.transaction && lineData.indexOf("Transaction") >= 0) {
                pdfData.transaction = lineData
                    .substring(lineData.indexOf("Transaction") + "Transaction".length)
                    .trim();
                continue;
            }
            else if (!pdfData.date && lineData.match(dateFormat)) {
                pdfData.date = lineData;
                itr++;
                pdfData.time = splitText[itr].trim();
                continue;
                // 8377 is ascii code of rupee symbol
            }
            else if (lineData.length > 0 &&
                lineData[0] === String.fromCharCode(8377) &&
                splitText[itr + 1] &&
                splitText[itr + 1].indexOf(" X") > 0) {
                var amount = lineData.substring(1).trim();
                //amount = amount.replace(/\,/g, "");
                itr++;
                lineData = splitText[itr].trim();
                var description = lineData.substring(lineData.indexOf(" ") + 2).trim();
                var qty = lineData.substring(0, lineData.indexOf(" ")).trim();
                pdfData.reports.push({
                    description: description,
                    qty: qty,
                    amount: amount
                });
                continue;
            }
            else if (!pdfData.total && lineData.indexOf("Total:") >= 0) {
                var total = lineData
                    .substring(lineData.indexOf("Total:") + "Total:".length + 1)
                    .trim();
                //total = total.replace(/\,/g, "");
                pdfData.total = total;
                isParsingComplete = true;
                continue;
            }
        }
        //logger.silly(pdfData);
        if (isParsingComplete) {
            Brochure.findByBrochureName(brochure.name, function (err, brochureObjFromDB) {
                if (err || !brochureObjFromDB) {
                    winston_1.logger.error(err);
                    winston_1.logger.error("Error finding brochure in DB");
                }
                else {
                    brochureObjFromDB.amount = parseFloat(pdfData.total.replace(/\,/g, ""));
                    brochureObjFromDB.reports = pdfData.reports;
                    brochureObjFromDB.brochureParsedTitle = pdfData.title;
                    brochureObjFromDB.brochureParsedSubTitle = pdfData.subTitle;
                    brochureObjFromDB.brochureParsedCustomer = pdfData.customer;
                    brochureObjFromDB.brochureParsedSeller = pdfData.seller;
                    brochureObjFromDB.brochureParsedTransaction = pdfData.transaction;
                    brochureObjFromDB.brochureParsedDate = pdfData.date;
                    brochureObjFromDB.brochureParsedTime = pdfData.time;
                    brochureObjFromDB.brochureParsedTotal = pdfData.total;
                    winston_1.logger.debug(brochureObjFromDB.id);
                    winston_1.logger.debug(JSON.stringify(brochureObjFromDB));
                    Brochure.updateBrochureById(brochureObjFromDB._id, brochureObjFromDB, function (err, result) {
                        winston_1.logger.debug("Brochure updated result: " + JSON.stringify(result));
                        cb(null, brochureObjFromDB);
                    });
                }
            });
        }
    });
}
function createPaymentLinkAndMerge(req, user, brochure, cb) {
    var rootPath = path_1.default.resolve(".") + "/public/";
    var html = index_1.config.paymentHtml2;
    var url = fullUrl(req);
    url = new url_1.default.URL(url).origin;
    url += "/payment?id=" + brochure.id;
    var reports = brochure.reports;
    var reportsHtml = "";
    for (var itr = 0; itr < reports.length; itr++) {
        var desc = reports[itr].description;
        var qty = reports[itr].qty;
        var amount = reports[itr].amount;
        reportsHtml += "<tr>";
        reportsHtml +=
            '<td colspan="2">' +
                qty +
                ' <span class="weight-600 pad-b">X</span> ' +
                desc +
                "</td>";
        reportsHtml += '<td class="pad-b"></td>';
        reportsHtml += '<td class="txt-right pad-b">₹ ' + amount + "</td>";
        reportsHtml += "</tr>";
    }
    html = html.replace("replaceMeTitle", brochure.brochureParsedTitle);
    html = html.replace("replaceMeSubTitle", brochure.brochureParsedSubTitle);
    html = html.replace("replaceMeCustomer", brochure.brochureParsedCustomer);
    html = html.replace("replaceMeSeller", brochure.brochureParsedSeller);
    html = html.replace("replaceMeTransaction", brochure.brochureParsedTransaction);
    html = html.replace("replaceMeDate", brochure.brochureParsedDate);
    html = html.replace("replaceMeTime", brochure.brochureParsedTime);
    html = html.replace("replaceMeRows", reportsHtml);
    html = html.replace("replaceMeTotal", brochure.brochureParsedTotal);
    html = html.replace("replaceMeTotal", brochure.brochureParsedTotal);
    html = html.replace("replaceMePaymentLink", '<a href="' + url + '" class="btn" target="_blank">Pay Now</a>');
    html = html.replace("replaceMeReceipt", "");
    //html = html.replace("amount", "Rs. " + brochure.amount + "/-");
    //logger.debug(html);
    var brochureName = brochure.name;
    if (brochureName.indexOf(".") > 0) {
        brochureName = brochureName.substring(0, brochureName.lastIndexOf("."));
    }
    //const paymentLinkFilePath = "uploads/" + brochureName + "_paymentlink.pdf";
    var finalMergedFilename = brochureName + "_P.pdf";
    var finalMergedFilePath = "uploads/" + finalMergedFilename;
    var options = { format: "Letter" };
    try {
        html_pdf_1.default
            .create(html, options)
            .toFile(rootPath + finalMergedFilePath, function (err, result) {
            if (err) {
                winston_1.logger.error("PDF Generation Error:" + err);
                cb(err, null);
                return;
            }
            winston_1.logger.silly("Brochure Payment Link Filename: " + result.filename);
            brochure.path = finalMergedFilePath;
            brochure.name = finalMergedFilename;
            Brochure.updateBrochureById(brochure._id, brochure, function (err, result) {
                cb(err, brochure);
            });
        });
    }
    catch (e) {
        cb(e, null);
    }
}
function createReceiptAndMerge(brochure, cb) {
    var rootPath = path_1.default.resolve(".") + "/public/";
    var html = index_1.config.paymentHtml2;
    var receiptHtml = index_1.config.receiptHTML2;
    var reports = brochure.reports;
    var reportsHtml = "";
    for (var itr = 0; itr < reports.length; itr++) {
        var desc = reports[itr].description;
        var qty = reports[itr].qty;
        var amount = reports[itr].amount;
        reportsHtml += "<tr>";
        reportsHtml +=
            '<td colspan="2">' +
                qty +
                ' <span class="weight-600 pad-b">X</span> ' +
                desc +
                "</td>";
        reportsHtml += '<td class="pad-b"></td>';
        reportsHtml += '<td class="txt-right pad-b">₹ ' + amount + "</td>";
        reportsHtml += "</tr>";
    }
    html = html.replace("replaceMeTitle", brochure.brochureParsedTitle);
    html = html.replace("replaceMeSubTitle", brochure.brochureParsedSubTitle);
    html = html.replace("replaceMeCustomer", brochure.brochureParsedCustomer);
    html = html.replace("replaceMeSeller", brochure.brochureParsedSeller);
    html = html.replace("replaceMeTransaction", brochure.brochureParsedTransaction);
    html = html.replace("replaceMeDate", brochure.brochureParsedDate);
    html = html.replace("replaceMeTime", brochure.brochureParsedTime);
    html = html.replace("replaceMeRows", reportsHtml);
    html = html.replace("replaceMeTotal", brochure.brochureParsedTotal);
    html = html.replace("replaceMeTotal", brochure.brochureParsedTotal);
    html = html.replace("replaceMePaymentLink", '<span class="stamp">PAID</span>');
    var paymentDate = brochure.paymentDate || new Date();
    var paymentDateStr = paymentDate.getDate() +
        "-" +
        (paymentDate.getMonth() + 1) +
        "-" +
        paymentDate.getFullYear();
    receiptHtml = receiptHtml.replace("replaceMeTransactionId", brochure.transactionId);
    receiptHtml = receiptHtml.replace("replaceMeReceiptId", brochure.receiptId);
    receiptHtml = receiptHtml.replace("replaceMePaymentDate", paymentDateStr);
    receiptHtml = receiptHtml.replace("replaceMePaymentAmount", "Rs. " + brochure.amount + "/-");
    html = html.replace("replaceMeReceipt", receiptHtml);
    var brochureName = brochure.originalFilename;
    if (brochureName.indexOf(".") > 0) {
        brochureName = brochureName.substring(0, brochureName.lastIndexOf("."));
    }
    //const receiptFilePath = "uploads/" + brochureName + "_receipt.pdf";
    var finalMergedFilename = brochureName + "_R.pdf";
    var finalMergedFilePath = "uploads/" + finalMergedFilename;
    var options = { format: "Letter" };
    html_pdf_1.default
        .create(html, options)
        .toFile(rootPath + finalMergedFilePath, function (err, result) {
        winston_1.logger.silly("Brochure Receipt Filename: " + result.filename);
        if (err) {
            winston_1.logger.error("PDF Generation Error:" + err);
            cb(err, null);
            return;
        }
        brochure.path = finalMergedFilePath;
        brochure.name = finalMergedFilename;
        Brochure.updateBrochureById(brochure._id, brochure, function (err, result) {
            cb(err, brochure);
        });
    });
}
