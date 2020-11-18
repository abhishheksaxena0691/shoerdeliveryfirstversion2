var mongoose = require("mongoose");
var Config = require("../../lib/config/config");
var User = require("../../lib/models/user");

let config = new Config.Config();
const mongodbURI = config.mongodbURI;

const userList = [
  {
    email: "bot@gmail.com",
    mobile: "1111111111",
    role: "BOT",
    fullname: "Bot 1",
    password: "bot1",
  }
];

try {
  if (config.mongodbURI == null || config.mongodbURI == undefined) {
    console.log("Can't read configuration");
    process.exit(-1);
  }
} catch (ex) {
  console.log("Can't read configuration: " + ex);
  process.exit(-1);
}

mongoose.connect(
  mongodbURI,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    bufferMaxEntries: 0,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000
  },
  function(err, db) {
    var totalExpected = userList.length;
    var total = 0;

    userList.forEach(element => {
        const user = new User.UserModel(element);
        User.createSaltedPassword(user.password, function(
          err,
          hashedPassword
        ) {
          if (err) {
            console.log(err);
            return;
          }
          user.password = hashedPassword;
          User.findByEmail(element.email, function(err, r) {
            if (err) {
              console.log("failed for " + element.email);
            } else {
              if (!r) {
                User.createUser(user, function(err, r) {
                  if (err) {
                    console.log("failed " + element.email);
                  } else {
                    console.log("added " + element.email);
                  }
                  total++;
                  if (total == totalExpected) {
                    db.close();
                  }
                });
              } else {
                var userJson = JSON.parse(JSON.stringify(user));
                delete userJson._id;
                delete userJson.createdAt;
                User.updateUserByEmail(element.email, userJson, function(
                  err,
                  r
                ) {
                  if (err) {
                    console.log("failed " + element.email);
                  } else {
                    console.log("updated " + element.email);
                  }
                  total++;
                  if (total == totalExpected) {
                    db.close();
                  }
                });
              }
            }
          });
        });
    });
  }
);

