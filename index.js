const fs = require("fs");
const ora = require("ora");
const chalk = require("chalk");

const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const SESSION_FILE_PATH = "./session.json";
let client;
let sessionData;

const withSession = () => {
  const spinner = ora(`Loading ${chalk.yellow("validando")}`);
  sessionData = require(SESSION_FILE_PATH);
  spinner.start();
  client = new Client({
    session: sessionData,
  });

  client.on("ready", () => {
    console.log("ready");
    spinner.stop();
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

(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();
