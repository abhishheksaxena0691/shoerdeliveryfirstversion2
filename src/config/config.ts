export class Config {
  mongodbURI: string = "mongodb://shoeAdmin:ZrvtqCDCKWF4829@35.184.211.242:27017/shoeSystem";
  port: number = 3000;
  msg91authKey: string = "283313AMizXlXLsTJ5d19a5fb";
  paymentHtml =
    "<!DOCTYPE html>\
    <html>\
    <head>\
    <title>Payment</title>\
    <style>\
    body {\
      text-align: center;\
      font-family: Arial, Helvetica, sans-serif;\
    }\
    .btn {\
      background-color: #4CAF50;\
      color: white;\
      padding: 12px;\
      margin: 10px 0;\
      border: none;\
      width: 100%;\
      border-radius: 3px;\
      cursor: pointer;\
      font-size: 17px;\
    }\
    .btn:hover {\
      background-color: #45a049;\
    }\
    </style>\
    </head>\
    <body>\
    <a href='paymentLink' class='btn' target='_blank'>Pay Now (amount)</a>\
    </body>\
    </html>";

  paymentHtml2 =
    '<!DOCTYPE html>\
    <html lang="en">\
    <head>\
    <meta charset="utf-8">\
    <title>Brochure</title>\
    <link rel="stylesheet"  media="all" />\
    <style>\
    .clearfix:after {\
    content: "";\
    display: table;\
    clear: both;\
    }\
    a {\
    color: #5D6975;\
    text-decoration: underline;\
    }\
    .invoice-header{\
    margin-top:50px;\
    margin-bottom:30px;\
    }\
    body {\
    height: 29.7cm;\
    position: relative;\
    color: #000000;\
    background: #FFFFFF;\
    font-size: 18px;\
    font-family: sans-serif;\
    margin:0 50px;\
    }\
    .header{\
    text-align:center;\
    font-size: 26px;\
    font-weight: 600;\
    }\
    .side1{\
    float:left;\
    width:50%;\
    line-height: 1.7em;\
    }\
    .side2{\
    float:right;\
    width:50%;\
    text-align:right;\
    }\
    .p-title{\
    font-weight: 600;\
    margin: 0;\
    line-height: 1.7em;\
    }\
    .p-det{\
    margin: 0;\
    }\
    .table-head{\
    text-align: center;\
    font-size: 22px;\
    font-weight:600;\
    text-decoration: underline;\
    }\
    .txt-right{\
    text-align:right;\
    }\
    table {\
    width: 100%;\
    border-collapse: collapse;\
    margin-bottom: 20px;\
    }\
    table thead{\
    line-height: 50px;\
    text-align: left;\
    font-weight:600;\
    border-bottom:1px solid #808080;\
    }\
    table td {\
    line-height: 30px;\
    white-space: nowrap;\
    }\
    .pad-b{\
    padding-bottom:10px;\
    }\
    .top-border{\
    border-top: 1px solid #808080;\
    }\
    .weight-600{\
    font-weight:600;\
    }\
    .btn {\
    background-color: #4CAF50;\
    color: white;\
    padding: 12px;\
    margin: 10px 0;\
    border: none;\
    width: 100%;\
    border-radius: 3px;\
    cursor: pointer;\
    font-size: 17px;\
    }\
    .btn:hover {\
    background-color: #45a049;\
    }\
    .stamp {\
    color: #0A9928;\
    font-size: 3rem;\
    font-weight: 700;\
    border: 0.25rem solid #0A9928;\
    display: inline-block;\
    padding: 0.25rem 1rem;\
    text-transform: uppercase;\
    border-radius: 1rem;\
    mix-blend-mode: multiply;\
    }\
    </style>\
    </head>\
    <body>\
    <div class="invoice-header clearfix">\
    <div class="header">\
    <p>replaceMeTitle</p>\
    </div>\
    </div>\
    <section class="invoice-add">\
    <div class="container">\
    <div class="clearfix">\
    <div class="side1">\
    <p class="p-title">Customer: replaceMeCustomer</p>\
    <p class="p-det">Seller:replaceMeSeller</p>\
    <p class="p-det">Transaction replaceMeTransaction</p>\
    </div>\
    <div class="side2">\
    <p class="p-det">replaceMeDate</p>\
    <p class="p-det">replaceMeTime</p>\
    </div>\
    </div>\
    <p class="table-head">replaceMeSubTitle</p>\
    <table>\
    <thead>\
    <tr>\
    <th class="desc">Quantity X Description</th>\
    <th></th>\
    <th colspan="2" class="txt-right">Total Amount</th>\
    </tr>\
    </thead>\
    <tbody>\
    replaceMeRows\
    <tr class="total-row">\
    <td></td>\
    <td colspan="2" class="weight-600 top-border">Total:</td>\
    <td class="txt-right weight-600  top-border">₹ replaceMeTotal</td>\
    </tr>\
    <tr class="total-row">\
    <td></td>\
    <td colspan="2" class=" top-border">Cash:</td>\
    <td class="txt-right weight-600 top-border">₹ replaceMeTotal</td>\
    </tr>\
    <tr>\
    <td></td>\
    <td></td>\
    <td></td>\
    </tr>\
    <tr>\
    <td></td>\
    <td colspan="2"></td>\
    <td class="txt-right">replaceMePaymentLink</td>\
    </tr>\
    </tbody>\
    </table>\
    </div>\
    </section>\
    replaceMeReceipt\
    </body>\
    </html>';

  receiptHTML =
    "<!DOCTYPE html>\
    <html>\
    <head>\
    <title>Receipt</title>\
    </head>\
    <body>\
    <div style='text-align:center;'>\
    <h1 style='color:green;'>Payment Details</h1>\
    <p>Date: <b>paymentDate</b></p>\
    <p>Transaction Id: <b>transactionId</b></p>\
    <p>Receipt Id: <b>receiptId</b></p>\
    <p>Amount: <b>paidAmount</b></p>\
    </div>\
    </body>\
    </html>";

    receiptHTML2 = '<br>\
    <br>\
    <section class="invoice-add">\
    <div class="container">\
    <p class="table-head">PAYMENT RECEIPT</p>\
    <table>\
    <thead>\
    <tr>\
    <th class="desc"></th>\
    <th></th>\
    <th colspan="2" class="txt-right"></th>\
    </tr>\
    </thead>\
    <tbody>\
    <tr>\
    <td colspan="2">Transaction ID</td>\
    <td class="pad-b"></td>\
    <td class="txt-right pad-b">replaceMeTransactionId</td>\
    </tr>\
    <tr>\
    <td colspan="2">Receipt ID</td>\
    <td class="pad-b"></td>\
    <td class="txt-right pad-b">replaceMeReceiptId</td>\
    </tr>\
    <tr>\
    <td colspan="2">Payment Date</td>\
    <td class="pad-b"></td>\
    <td class="txt-right pad-b">replaceMePaymentDate</td>\
    </tr>\
    <tr>\
    <td colspan="2">Amount</td>\
    <td class="pad-b"></td>\
    <td class="txt-right pad-b">replaceMePaymentAmount</td>\
    </tr>\
    </tbody>\
    </table>\
    </div>\
    </section>';
}
