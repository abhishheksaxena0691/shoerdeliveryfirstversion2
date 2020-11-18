import express from "express";
let router = express.Router();
import multer from "multer";
var fullUrl = require("full-url");
import URL from "url";
import { ResponseObj } from "../models/models";
import { logger } from "../config/winston";
import * as User from "../models/user";
import * as Token from "../models/token";
import * as Brochure from "../models/brochure";
import * as Help from "../models/help";
import qr from "qr-image";
import randomstring from "randomstring";
import { socket, config } from "../index";
let PDFParser = require("pdf2json");
const pdfParse = require("pdf-parse");
import path from "path";
import html2pdf from "html-pdf";
import {CreateOptions} from "html-pdf"
import fs from "fs";
const pdfMerge = require("easy-pdf-merge");
const util = require("util");

export let brochureToUserIdMap: any = {};

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
let profileImageStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "./public/images/uploads");
  },
  filename: function(req, file, callback) {
    const filename =
      file.fieldname + "_" + Date.now() + "_" + file.originalname;
    logger.silly("File upload: " + filename);
    callback(null, filename);
  }
});
let profileImageUpload = multer({
  storage: profileImageStorage
}).single("file");

// Brochure multer settings
let brochureStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "./public/uploads");
  },
  filename: function(req, file, callback) {
    const filename = file.originalname;
    logger.silly("Brochure upload: " + filename);
    callback(null, filename);
  }
});
let brochureUpload = multer({
  storage: brochureStorage
}).single("file");

router.post("/help", function(req: any, res: any) {
  localAuthenticate(req, res, function(
    isValid: boolean,
    message: string,
    user: any
  ) {
    if (isValid) {
      if (!req.body.question) {
        let responseObj = new ResponseObj(
          400,
          "Missing parameter 'question'",
          null
        );
        res.status(responseObj.status).json(responseObj);
        return;
      }
      let question = req.body.question;
      const help = new Help.HelpModel({
        question: question,
        userId: user.id
      });

      Help.createHelp(help, function(err: Error, helpObj: any) {
        if (err || !helpObj) {
          let responseObj = new ResponseObj(
            400,
            "Failed to add new question",
            null
          );
          res.status(responseObj.status).json(responseObj);
          return;
        }
        let responseObj = new ResponseObj(200, "Success", null);
        res.status(responseObj.status).json(responseObj);
      });
    } else {
      let responseObj = new ResponseObj(
        403,
        "You are not authorized to perform this action!",
        null
      );
      res.status(responseObj.status).json(responseObj);
      return;
    }
  });
});

router.post("/update-profile", function(req: any, res: any) {
  localAuthenticate(req, res, function(
    isValid: boolean,
    message: string,
    user: any
  ) {
    if (isValid) {
      if (!req.body.fullname) {
        let responseObj = new ResponseObj(
          400,
          "Missing parameter 'fullname'",
          null
        );
        res.status(responseObj.status).json(responseObj);
        return;
      }
      if (!req.body.email) {
        let responseObj = new ResponseObj(
          400,
          "Missing parameter 'email'",
          null
        );
        res.status(responseObj.status).json(responseObj);
        return;
      }
      let oldEmail = user.email;
      let fullname = req.body.fullname;
      let email = req.body.email;

      user.email = email;
      user.fullname = fullname;

      User.updateUserByEmail(oldEmail, user, function(
        err: Error,
        userObj: any
      ) {
        if (err || !userObj) {
          let responseObj = new ResponseObj(
            400,
            "Failed to update user!",
            null
          );
          res.status(responseObj.status).json(responseObj);
          return;
        }
        let responseObj = new ResponseObj(200, "Success", null);
        res.status(responseObj.status).json(responseObj);
      });
    } else {
      let responseObj = new ResponseObj(
        403,
        "You are not authorized to perform this action!",
        null
      );
      res.status(responseObj.status).json(responseObj);
      return;
    }
  });
});

router.post("/change-password", function(req: any, res: any) {
  localAuthenticate(req, res, function(
    isValid: boolean,
    message: string,
    user: any
  ) {
    if (isValid) {
      if (!req.body.newpassword) {
        let responseObj = new ResponseObj(
          400,
          "Missing parameter 'new password'",
          null
        );
        res.status(responseObj.status).json(responseObj);
        return;
      }
      if (!req.body.newpasswordre) {
        let responseObj = new ResponseObj(
          400,
          "Missing parameter 'confirm password'",
          null
        );
        res.status(responseObj.status).json(responseObj);
        return;
      }
      let oldPassword = user.password;
      let newpassword = req.body.newpassword;
      let newpasswordre = req.body.newpasswordre;

      if (newpassword !== newpasswordre) {
        let responseObj = new ResponseObj(
          400,
          "new password and confirm password do not match",
          null
        );
        res.status(responseObj.status).json(responseObj);
        return;
      }

      User.createSaltedPassword(newpassword, function(
        err: any,
        hashedPassword: string
      ) {
        if (err) {
          let responseObj = new ResponseObj(
            500,
            "Failed to encrypt password!",
            null
          );
          res.status(responseObj.status).json(responseObj);
          return;
        }
        user.password = hashedPassword;

        User.updateUserByEmail(user.email, user, function(
          err: Error,
          userObj: any
        ) {
          if (err || !userObj) {
            let responseObj = new ResponseObj(
              400,
              "Failed to update password!",
              null
            );
            res.status(responseObj.status).json(responseObj);
            return;
          }
          let responseObj = new ResponseObj(200, "Success", null);
          res.status(responseObj.status).json(responseObj);
        });
      });
    } else {
      let responseObj = new ResponseObj(
        403,
        "You are not authorized to perform this action!",
        null
      );
      res.status(responseObj.status).json(responseObj);
      return;
    }
  });
});

router.post("/update-profile-image", function(req: any, res: any) {
  localAuthenticate(req, res, function(
    isValid: boolean,
    message: string,
    user: any
  ) {
    if (isValid) {
      profileImageUpload(req, res, function(err) {
        if (err) {
          logger.error(err);
          let responseObj = new ResponseObj(
            400,
            "Failed to upload image!",
            null
          );

          res.status(responseObj.status).json(responseObj);
          return;
        }

        var image: string = req.file.path;

        if (image.length > 7 && image.indexOf("public") === 0) {
          image = image.substring(7);
        }

        user.image = image;

        User.updateUserByEmail(user.email, user, function(
          err: Error,
          userObj: any
        ) {
          if (err || !userObj) {
            let responseObj = new ResponseObj(
              400,
              "Failed to update user!",
              null
            );
            res.status(responseObj.status).json(responseObj);
            return;
          }
          let responseObj = new ResponseObj(200, "Success", null);
          res.status(responseObj.status).json(responseObj);
        });
      });
    } else {
      let responseObj = new ResponseObj(
        403,
        "You are not authorized to perform this action!",
        null
      );
      res.status(responseObj.status).json(responseObj);
      return;
    }
  });
});

router.get("/qr-code-image", function(req: any, res: any) {
  localAuthenticate(req, res, function(
    isValid: boolean,
    message: string,
    user: any
  ) {
    if (isValid) {
      var filename = user.mobile + "_" + new Date().getTime();
      let qrImage = qr.imageSync(filename, { type: "svg" });

      brochureToUserIdMap[filename] = user.id;

      let responseObj = new ResponseObj(200, "Success", qrImage);
      res.status(responseObj.status).json(responseObj);
    } else {
      let responseObj = new ResponseObj(
        404,
        "Resource not found in user",
        null
      );
      res.status(responseObj.status).json(responseObj);
      return;
    }
  });
});

router.post("/get-reports", function(req: any, res: any) {
  localAuthenticate(req, res, function(
    isValid: boolean,
    message: string,
    user: any
  ) {
    if (isValid) {
      if (!req.body.startDate) {
        let responseObj = new ResponseObj(
          400,
          "Missing parameter 'startDate'",
          null
        );
        res.status(responseObj.status).json(responseObj);
        return;
      }
      if (!req.body.endDate) {
        let responseObj = new ResponseObj(
          400,
          "Missing parameter 'endDate'",
          null
        );
        res.status(responseObj.status).json(responseObj);
        return;
      }
      let startDate = new Date(req.body.startDate);
      let endDate = new Date(req.body.endDate);
      endDate.setDate(endDate.getDate() + 1);

      Brochure.findByDateRange(startDate, endDate, function(
        err: any,
        brochureArr: Brochure.IBrochureModel
      ) {
        if (err || !brochureArr) {
          let responseObj = new ResponseObj(
            400,
            "Error finding brochures!",
            null
          );
          res.status(responseObj.status).json(responseObj);
          return;
        }

        logger.debug(JSON.stringify(brochureArr));

        let responseObj = new ResponseObj(200, "Success", brochureArr);
        res.status(responseObj.status).json(responseObj);
      });
    } else {
      let responseObj = new ResponseObj(
        403,
        "You are not authorized to perform this action!",
        null
      );
      res.status(responseObj.status).json(responseObj);
      return;
    }
  });
});

router.post("/make-payment", function(req: any, res: any) {
  if (!req.body.id) {
    let responseObj = new ResponseObj(400, "Missing parameter 'id'", null);
    res.status(responseObj.status).json(responseObj);
    return;
  }
  let brochureId = req.body.id;

  Brochure.findByBrochureId(brochureId, function(
    err: any,
    brochure: Brochure.IBrochureModel
  ) {
    if (err || !brochure) {
      let responseObj = new ResponseObj(400, "Error finding brochure!", null);
      res.status(responseObj.status).json(responseObj);
      return;
    }

    brochure.paymentStatus = Brochure.PaymentStatus.PAID_ONLINE;
    brochure.receiptId = generateReceiptId();
    brochure.transactionId = generateTransactionId();
    brochure.paymentDate = new Date();
    Brochure.updateBrochureById(brochureId, brochure, function(
      err: any,
      result: any
    ) {
      if (err || !result) {
        let responseObj = new ResponseObj(
          400,
          "Failed to update payment status!",
          null
        );
        res.status(responseObj.status).json(responseObj);
        return;
      }

      createReceiptAndMerge(brochure, function(err: any, brochureUpdated: any) {
        if (err || !brochureUpdated) {
          let responseObj = new ResponseObj(
            400,
            "Failed to merge receipt!",
            null
          );
          res.status(responseObj.status).json(responseObj);
          return;
        }

        let responseObj = new ResponseObj(200, "Success", brochure);
        res.status(responseObj.status).json(responseObj);
      });
    });
  });
});

/********************* BOT ******************************/
router.post("/bot/upload-file", function(req: any, res: any) {
  localAuthenticate(req, res, function(
    isValid: boolean,
    message: string,
    user: any
  ) {
    if (isValid) {
      brochureUpload(req, res, function(err) {
        if (err) {
          logger.error(err);
          let responseObj = new ResponseObj(
            400,
            "Failed to upload brochure!",
            null
          );

          res.status(responseObj.status).json(responseObj);
          return;
        }

        var brochure: string = req.file.path;

        if (brochure.length > 7 && brochure.indexOf("public") === 0) {
          brochure = brochure.substring(7);
        }

        const truncatedFileName = req.file.originalname.substring(
          0,
          req.file.originalname.length - 4
        );

        if (!brochureToUserIdMap[truncatedFileName]) {
          logger.error(
            "Brochure mapping not found for file: " + req.file.originalname
          );

          let responseObj = new ResponseObj(200, "Success", {
            data: "Brochure mapping not found!"
          });
          res.status(responseObj.status).json(responseObj);
          return;
        }
        let userId = brochureToUserIdMap[truncatedFileName];

        delete brochureToUserIdMap[truncatedFileName];

        const brochureObj = new Brochure.BrochureModel({
          name: req.file.originalname,
          originalFilename: req.file.originalname,
          originalFilePath: brochure,
          path: brochure,
          userId: userId,
          username: user.fullname,
          coupon: generateCouponCode(),
          amount: 0
        });

        Brochure.findByBrochureName(brochureObj.name, function(
          err: any,
          brochureObjFromDB: any
        ) {
          if (err) {
            logger.error(err);
            logger.error("Error finding brochure in DB");
          }

          if (brochureObjFromDB) {
            logger.debug(
              "Brochure already exists in DB: " + brochureObjFromDB.name
            );

            parsePDFForReports(brochureObjFromDB, function(
              errBr: any,
              updatedBrochureObj: Brochure.IBrochure
            ) {
              if (errBr || !updatedBrochureObj) {
                logger.error("parsePDFForReports failed: " + errBr);

                let responseObj = new ResponseObj(
                  500,
                  "parsePDFForReports failed: " + errBr,
                  null
                );
                res.status(responseObj.status).json(responseObj);
                return;
              }

              createPaymentLinkAndMerge(req, user, updatedBrochureObj, function(
                errPdf: any,
                mergedBrochure: any
              ) {
                if (errPdf || !mergedBrochure) {
                  let responseObj = new ResponseObj(
                    500,
                    "createPaymentLinkAndMerge failed: " + errBr,
                    null
                  );
                  res.status(responseObj.status).json(responseObj);
                  return;
                }

                socket.brochureReady(
                  userId,
                  mergedBrochure.name,
                  mergedBrochure.path
                );
                let responseObj = new ResponseObj(200, "Success", null);
                res.status(responseObj.status).json(responseObj);
              });
            });
          } else {
            Brochure.createBrochure(brochureObj, function(
              err: any,
              result: any
            ) {
              if (err) {
                logger.error(err);
                logger.error("Failed to create new Brochure!");

                let responseObj = new ResponseObj(
                  500,
                  "Failed to create new Brochure!",
                  null
                );
                res.status(responseObj.status).json(responseObj);
                return;
              }

              parsePDFForReports(brochureObj, function(
                errBr: any,
                updatedBrochureObj: Brochure.IBrochure
              ) {
                if (errBr || !updatedBrochureObj) {
                  logger.error("parsePDFForReports failed: " + errBr);

                  let responseObj = new ResponseObj(
                    500,
                    "parsePDFForReports failed: " + errBr,
                    null
                  );
                  res.status(responseObj.status).json(responseObj);
                  return;
                }

                createPaymentLinkAndMerge(
                  req,
                  user,
                  updatedBrochureObj,
                  function(errPdf: any, mergedBrochure: any) {
                    if (errPdf || !mergedBrochure) {
                      let responseObj = new ResponseObj(
                        500,
                        "createPaymentLinkAndMerge failed: " + errBr,
                        null
                      );
                      res.status(responseObj.status).json(responseObj);
                      return;
                    }

                    socket.brochureReady(
                      userId,
                      mergedBrochure.name,
                      mergedBrochure.path
                    );
                    let responseObj = new ResponseObj(200, "Success", null);
                    res.status(responseObj.status).json(responseObj);
                  }
                );
              });
            });
          }
        });
      });
    } else {
      let responseObj = new ResponseObj(
        403,
        "You are not authorized to perform this action!!",
        null
      );
      res.status(responseObj.status).json(responseObj);
      return;
    }
  });
});

/******************** Paths ****************************/
router.get("/index", function(req, res) {
  localAuthenticate(req, res, function(
    isValid: boolean,
    message: string,
    user: any
  ) {
    if (isValid) {
      Brochure.findAllByUserId(user.id, function(err: any, brochureList: any) {
        if (err || !brochureList) {
          logger.error("Failed to fetch brochures for user: " + user.email);
          brochureList = [];
        }

        Help.findAllByUserId(user.id, function(err: any, helpList: any) {
          if (err || !helpList) {
            logger.error("Failed to fetch help list for user: " + user.email);
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
    } else {
      res.render("403", {
        title: "Shoe Factory",
        relPath: "./"
      });
    }
  });
});

router.get("/profile", function(req, res) {
  localAuthenticate(req, res, function(
    isValid: boolean,
    message: string,
    user: any
  ) {
    if (isValid) {
      res.render("user/profile", {
        title: "Shoe Factory",
        relPath: "../",
        user: user
      });
    } else {
      res.render("403", {
        title: "Shoe Factory",
        relPath: "./"
      });
    }
  });
});

router.get("/payment", function(req, res) {
  if (!req.query.id) {
    res.render("403", {
      title: "Shoe Factory",
      relPath: "./",
      message: "Missing parameter 'id'"
    });
    return;
  }

  const brochureId: any = req.query.id;

  Brochure.findByBrochureId(brochureId, function(err: any, brochure: any) {
    if (err || !brochure) {
      res.render("403", {
        title: "Shoe Factory",
        relPath: "./",
        message: "Brochure details not found!"
      });
      return;
    }

    User.findByUserId(brochure.userId, true, function(errUsr: any, user: any) {
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

function localAuthenticate(req: any, res: any, cb: any) {
  logger.silly("Query Token: " + req.query.token);

  if (typeof req.query.token === "undefined") {
    return cb(false, "Unauthorized!", null);
  }

  const token = req.query.token;

  Token.findByToken(token, function(err: Error, tokenFromDb: any) {
    if (err) {
      return cb(false, "Unauthorized", null);
    }
    if (!tokenFromDb) {
      return cb(false, "Unauthorized", null);
    }
    User.findByUserId(tokenFromDb.userId, false, function(
      err: Error,
      user: any
    ) {
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
  const coupon = randomstring.generate({ length: 8, charset: "alphanumeric" });
  //logger.silly("Coupon Code: " + coupon);
  return coupon;
}

function generateTransactionId() {
  const transactionId = randomstring.generate({
    length: 11,
    charset: "numeric"
  });
  //logger.silly("Transaction Id: " + receiptId);
  return transactionId;
}

function generateReceiptId() {
  const receiptId = randomstring.generate({
    length: 12,
    charset: "alphanumeric"
  });
  //logger.silly("Receipt Id: " + receiptId);
  return receiptId;
}

function parsePDFForReports(brochure: Brochure.IBrochureModel, cb: Function) {
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

  logger.silly(path.resolve(".") + "/public/" + brochure.path);

  let dataBuffer = fs.readFileSync(
    path.resolve(".") + "/public/" + brochure.path
  );

  pdfParse(dataBuffer).then(function(data: any) {
    //console.log(data.text);

    const splitText = data.text.split(/\r?\n/);
    let pdfData: any = {};
    pdfData.reports = [];
    let isParsingComplete = false;

    for (let itr = 0; itr < splitText.length; itr++) {
      let lineData = splitText[itr].trim();
      const dateFormat = /^(((0)[0-9])|((1)[0-2]))(\-)([0-2][0-9]|(3)[0-1])(\-)\d{4}$/;

      if (!pdfData.title && lineData.length > 0) {
        pdfData.title = lineData;
      } else if (!pdfData.customer && lineData.indexOf("Customer:") >= 0) {
        pdfData.customer = lineData
          .substring(lineData.indexOf("Customer:") + "Customer:".length)
          .trim();
        continue;
      } else if (!pdfData.seller && lineData.indexOf("Seller:") >= 0) {
        pdfData.seller = lineData
          .substring(lineData.indexOf("Seller:") + "Seller:".length)
          .trim();
        itr++;
        pdfData.subTitle = splitText[itr].trim();
        continue;
      } else if (!pdfData.transaction && lineData.indexOf("Transaction") >= 0) {
        pdfData.transaction = lineData
          .substring(lineData.indexOf("Transaction") + "Transaction".length)
          .trim();
        continue;
      } else if (!pdfData.date && lineData.match(dateFormat)) {
        pdfData.date = lineData;
        itr++;
        pdfData.time = splitText[itr].trim();
        continue;
        // 8377 is ascii code of rupee symbol
      } else if (
        lineData.length > 0 &&
        lineData[0] === String.fromCharCode(8377) &&
        splitText[itr + 1] &&
        splitText[itr + 1].indexOf(" X") > 0
      ) {
        let amount = lineData.substring(1).trim();
        //amount = amount.replace(/\,/g, "");
        itr++;
        lineData = splitText[itr].trim();
        let description = lineData.substring(lineData.indexOf(" ") + 2).trim();
        let qty = lineData.substring(0, lineData.indexOf(" ")).trim();
        pdfData.reports.push({
          description: description,
          qty: qty,
          amount: amount
        });
        continue;
      } else if (!pdfData.total && lineData.indexOf("Total:") >= 0) {
        let total = lineData
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
      Brochure.findByBrochureName(brochure.name, function(
        err: any,
        brochureObjFromDB: any
      ) {
        if (err || !brochureObjFromDB) {
          logger.error(err);
          logger.error("Error finding brochure in DB");
        } else {
          brochureObjFromDB.amount = parseFloat(
            pdfData.total.replace(/\,/g, "")
          );
          brochureObjFromDB.reports = pdfData.reports;

          brochureObjFromDB.brochureParsedTitle = pdfData.title;
          brochureObjFromDB.brochureParsedSubTitle = pdfData.subTitle;
          brochureObjFromDB.brochureParsedCustomer = pdfData.customer;
          brochureObjFromDB.brochureParsedSeller = pdfData.seller;
          brochureObjFromDB.brochureParsedTransaction = pdfData.transaction;
          brochureObjFromDB.brochureParsedDate = pdfData.date;
          brochureObjFromDB.brochureParsedTime = pdfData.time;
          brochureObjFromDB.brochureParsedTotal = pdfData.total;

          logger.debug(brochureObjFromDB.id);
          logger.debug(JSON.stringify(brochureObjFromDB));

          Brochure.updateBrochureById(
            brochureObjFromDB._id,
            brochureObjFromDB,
            function(err: any, result: any) {
              logger.debug(
                "Brochure updated result: " + JSON.stringify(result)
              );
              cb(null, brochureObjFromDB);
            }
          );
        }
      });
    }
  });
}

function createPaymentLinkAndMerge(
  req: Request,
  user: User.IUser,
  brochure: any,
  cb: Function
) {
  let rootPath = path.resolve(".") + "/public/";

  let html = config.paymentHtml2;
  let url = fullUrl(req);
  url = new URL.URL(url).origin;
  url += "/payment?id=" + brochure.id;

  const reports = brochure.reports;
  let reportsHtml = "";

  for (let itr = 0; itr < reports.length; itr++) {
    const desc = reports[itr].description;
    const qty = reports[itr].qty;
    const amount = reports[itr].amount;
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
  html = html.replace(
    "replaceMeTransaction",
    brochure.brochureParsedTransaction
  );
  html = html.replace("replaceMeDate", brochure.brochureParsedDate);
  html = html.replace("replaceMeTime", brochure.brochureParsedTime);
  html = html.replace("replaceMeRows", reportsHtml);
  html = html.replace("replaceMeTotal", brochure.brochureParsedTotal);
  html = html.replace("replaceMeTotal", brochure.brochureParsedTotal);
  html = html.replace(
    "replaceMePaymentLink",
    '<a href="' + url + '" class="btn" target="_blank">Pay Now</a>'
  );
  html = html.replace("replaceMeReceipt", "");
  //html = html.replace("amount", "Rs. " + brochure.amount + "/-");

  //logger.debug(html);
  let brochureName = brochure.name;
  if (brochureName.indexOf(".") > 0) {
    brochureName = brochureName.substring(0, brochureName.lastIndexOf("."));
  }

  //const paymentLinkFilePath = "uploads/" + brochureName + "_paymentlink.pdf";
  const finalMergedFilename = brochureName + "_P.pdf";
  const finalMergedFilePath = "uploads/" + finalMergedFilename;
  let options:CreateOptions = {format:"Letter"}

  try {

  html2pdf
    .create(html, options)
    .toFile(rootPath + finalMergedFilePath, function(err, result) {
      if (err) {
        logger.error("PDF Generation Error:" + err);
        cb(err, null);
        return;
      }

      logger.silly("Brochure Payment Link Filename: " + result.filename);

      brochure.path = finalMergedFilePath;
      brochure.name = finalMergedFilename;

      Brochure.updateBrochureById(brochure._id, brochure, function(
        err: any,
        result: any
      ) {
        cb(err, brochure);
      });
    });
        
  } catch(e) {
    cb(e, null);
  }
}

function createReceiptAndMerge(brochure: any, cb: Function) {
  let rootPath = path.resolve(".") + "/public/";

  let html = config.paymentHtml2;
  let receiptHtml = config.receiptHTML2;

  const reports = brochure.reports;
  let reportsHtml = "";

  for (let itr = 0; itr < reports.length; itr++) {
    const desc = reports[itr].description;
    const qty = reports[itr].qty;
    const amount = reports[itr].amount;
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
  html = html.replace(
    "replaceMeTransaction",
    brochure.brochureParsedTransaction
  );
  html = html.replace("replaceMeDate", brochure.brochureParsedDate);
  html = html.replace("replaceMeTime", brochure.brochureParsedTime);
  html = html.replace("replaceMeRows", reportsHtml);
  html = html.replace("replaceMeTotal", brochure.brochureParsedTotal);
  html = html.replace("replaceMeTotal", brochure.brochureParsedTotal);
  html = html.replace(
    "replaceMePaymentLink",
    '<span class="stamp">PAID</span>'
  );

  let paymentDate = brochure.paymentDate || new Date();
  let paymentDateStr =
    paymentDate.getDate() +
    "-" +
    (paymentDate.getMonth() + 1) +
    "-" +
    paymentDate.getFullYear();

  receiptHtml = receiptHtml.replace("replaceMeTransactionId", brochure.transactionId);
  receiptHtml = receiptHtml.replace("replaceMeReceiptId", brochure.receiptId);
  receiptHtml = receiptHtml.replace("replaceMePaymentDate", paymentDateStr);
  receiptHtml = receiptHtml.replace(
    "replaceMePaymentAmount",
    "Rs. " + brochure.amount + "/-"
  );

  html = html.replace("replaceMeReceipt", receiptHtml);

  let brochureName = brochure.originalFilename;
  if (brochureName.indexOf(".") > 0) {
    brochureName = brochureName.substring(0, brochureName.lastIndexOf("."));
  }

  //const receiptFilePath = "uploads/" + brochureName + "_receipt.pdf";
  const finalMergedFilename = brochureName + "_R.pdf";
  const finalMergedFilePath = "uploads/" + finalMergedFilename;
  let options:CreateOptions = {format:"Letter"}

  html2pdf
    .create(html, options)
    .toFile(rootPath + finalMergedFilePath, function(err, result) {
      logger.silly("Brochure Receipt Filename: " + result.filename);

      if (err) {
        logger.error("PDF Generation Error:" + err);
        cb(err, null);
        return;
      }

      brochure.path = finalMergedFilePath;
      brochure.name = finalMergedFilename;

      Brochure.updateBrochureById(brochure._id, brochure, function(
        err: any,
        result: any
      ) {
        cb(err, brochure);
      });
    });
}
