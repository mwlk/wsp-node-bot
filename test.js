const fs = require("fs");
const excelJS = require("exceljs");
const moment = require("moment");

const qrcode = require("qrcode-terminal");

const { Client } = require("whatsapp-web.js");
const client = new Client();
// var client;
var sessionData;

const SESSION_FILE_PATH = "./session.json";

// client = new Client({
// 	authStrategy: new LocalAuth()
// });

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
  listenMessage();
});

client.on("authenticated", (session) => {
  console.log(session);
});

client.initialize();

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
      case "file":
        sendMedia(from, "images.png"); 
        break;
    }

    saveHistorial(from, body);
  });
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

const sendMessage = (to, msg) => {
  client.sendMessage(to, msg);
};

const sendMedia = (to, file) => {
  const media = MessageMedia.fromFilePath(`./assets/${file}`);
  console.log(media)

  client.sendMessage(to, media);
};
