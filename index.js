const express = require("express");
const cors = require("cors");

const fs = require("fs");
// const ora = require("ora");
// const chalk = require("chalk");
const excelJS = require("exceljs");
const moment = require("moment");

const { Client, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const SESSION_FILE_PATH = "./session.json";
let client;
let sessionData;

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));

const sendToAPI = (req, res) => {
  const { message, to } = req.body;
  const numberPhone = `${to}@u.us`;

  client.on('authenticated', () => {
    sendMessage(numberPhone, message);
   return  res.send({ status: "BOT DICSYS", data: `${message}` });
  })
  
  client.on('auth_failure', () => {
    return res.send({ status: "BOT DICSYS", data: `fail auth` });
  })

  return res.send({ status: "BOT DICSYS", data: `default` });
  
};

//! define post endpoint
app.post("/send", sendToAPI);

const withSession = () => {
  //   const spinner = ora(`Loading ${chalk.yellow("validando")}`);
  sessionData = require(SESSION_FILE_PATH);
  spinner.start();
  client = new Client({
    session: sessionData,
  });

  client.on("ready", () => {
    console.log("ready");
    spinner.stop();

    listenMessage();
  });

  client.on("auth_failure", () => {
    spinner.stop();
    console.log("error in auth");
  });

  client.initialize();
};

const withOutSession = () => {
  console.log("sin sesion");
  client = new Client();
  client.on("qr", (qr) => {
    qrcode.generate(qr), { small: true };
  });

  client.on("authenticated", (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (error) => {
      if (error) {
        console.log(error);
      }
    });
  });

  client.initialize();
};

const listenMessage = () => {
  client.on("message", (msg) => {
    const { from, to, body } = msg;

    console.log(from, to, body);

    switch (body) {
      case "hola":
        sendMessage(from, "saluda mirko");
        break;
      case "chau":
        sendMessage(from, "despide mirko");
        break;
      default:
        sendMedia(from, "images.png");
    }
  });

  saveHistorial(from, body);
};

const sendMessage = (to, msg) => {
  client.sendMessage(to, msg);
};

const sendMedia = (to, file) => {
  const media = MessageMedia.fromFilePath(`./assets/${file}`);

  client.sendMessage(to, media);
};

const saveHistorial = (from, msg) => {
  const path = `./log-chats/${from}.xlsx`;

  const book = new excelJS.Workbook();
  const date = moment().format("DD-MM-YYYY hh:mm");

  if (fs.existsSync(path)) {
    book.xlsx.readFile(path).then(() => {
      const sheet = book.getWorksheet(1);

      const lastRow = sheet.lastRow;

      let rowToInsert = sheet.getRow(++lastRow.number);
      rowToInsert.getCell("A").value = date;
      rowToInsert.getCell("B").value = msg;
      rowToInsert.commit();

      book.xlsx
        .writeFile(path)
        .then(() => {
          console.log("chat updated");
        })
        .catch(() => {
          console.log("error when try update log");
        });
    });
  } else {
    const sheet = book.addWorksheet("Chats");

    sheet.columns = [
      { header: "Fecha", key: "date" },
      { header: "Mensaje", key: "msg" },
    ];

    sheet.addRow([date, msg]);
    book.xlsx
      .writeFile(path)
      .then(() => {
        console.log("generete excel");
      })
      .catch(() => {
        console.log("error when write excel file");
      });
  }
};

fs.existsSync(SESSION_FILE_PATH) ? withSession() : withOutSession();

app.listen(4545, () => {
  console.log("BOT DICSYS UP");
});
