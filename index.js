require("dotenv").config();
const fetch = require("request");

const TelegramBot = require("node-telegram-bot-api");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELE_BOT;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

//tricking heroku
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

//function to convert the first letter of Country names to capital letter
function capital_letter(str) {
  str = str.split(" ");

  for (let i = 0, x = str.length; i < x; i++) {
    str[i] = str[i][0].toUpperCase() + str[i].substr(1);
  }

  return str.join(" ");
}

//text sent once /start is called
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "<b>Welcome</b>\nThis is a bot created to give out up-to-date information on the COVID19 pandemic for countries that have been affected by the virus.\nType in <a>/help</a> for more information.",
    { parse_mode: "HTML" }
  );
});

//text sent once /help is called
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "<b>/help</b>\nSee the picture attached for a general idea of how to navigate within the bot.\nEnter <b><i>/global</i></b> for information around the globe.\nEnter <b><i>/country</i></b> + COUNTRYNAME to get all information.\nFor the United States please enter <b>USA</b>, for the United Kingdom please enter <b>UK</b>, for the Republic of Korea (South Korea) please enter <b>S. Korea</b>",
    { parse_mode: "HTML" }
  );

  bot.sendPhoto(
    msg.chat.id,
    "https://drive.google.com/file/d/1QM1DhDynh6wN9JMyhBLO3fDjMrDuFnGL/view?usp=sharing"
  );
});

//text sent once /extra is called
bot.onText(/\/extra/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "<b>/extra</b>\nEnter <b><i>/infected</i></b> + COUNTRYNAME to get number of infections. \nEnter <b><i>/deaths</i></b> + COUNTRYNAME to get number of Deaths. \nEnter <b><i>/recovered</i></b> + COUNTRYNAME to get number of people recovered. \n",
    { parse_mode: "HTML" }
  );
});

//retrieve global data once /global is called
bot.onText(/\/global/, (msg) => {
  fetch( //fecting data from api
    "https://coronavirus-monitor.p.rapidapi.com/coronavirus/worldstat.php",
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
        "x-rapidapi-key": process.env.API_KEY,
      },
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        bot
          .sendMessage(msg.chat.id, "Retreiving <b>Global</b> Stats", {
            parse_mode: "HTML",
          })
          .then((msg) => {
            let globe = JSON.parse(body);
            bot.sendMessage(
              msg.chat.id,
              ` <i><b>Total Infected:</b></i> ${globe.total_cases} \n<i><b>Total Deaths:</b></i> ${globe.total_deaths} \n<i><b>Total Recovered:</b></i> ${globe.total_recovered} \n<b><i>New Cases:</i></b> ${globe.new_cases} \n<b><i>New Deaths:</i></b> ${globe.new_deaths} \n<b><i>Last Updated:</i></b> ${globe.statistic_taken_at}`,
              { parse_mode: "HTML" }
            );
          });
      }
    }
  );
});

//retrieving data for a particular country 
bot.onText(/\/country (.+)/, (msg, match) => {
  let countryName = match[1];
  fetch(
    `https://coronavirus-monitor.p.rapidapi.com/coronavirus/latest_stat_by_country.php?country=${countryName.toLowerCase()}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
        "x-rapidapi-key": process.env.API_KEY,
      },
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        bot
          .sendMessage(
            msg.chat.id,
            `Retreiving Information for <i><b>${capital_letter(
              countryName.toLowerCase()
            )}</b></i>`,
            { parse_mode: "HTML" }
          )
          .then((msg) => {
            let countries = JSON.parse(body);
            let {
              country,
              latest_stat_by_country: [
                {
                  total_cases,
                  new_cases,
                  active_cases,
                  total_deaths,
                  new_deaths,
                  total_recovered,
                  serious_critical,
                  total_cases_per1m,
                  record_date,
                },
              ],
            } = countries;
            bot.sendMessage(
              msg.chat.id,
              `<b><i>Total Cases:</i></b> ${total_cases} \n<b><i>New Cases:</i></b> ${new_cases} \n<b><i>Total Deaths:</i></b> ${total_deaths} \n<b><i>New Deaths:</i></b> ${new_deaths} \n<b><i>Total Recovered:</i></b> ${total_recovered} \n<b><i>Active Cases:</i></b> ${active_cases} \n<b><i>Critical Cases:</i></b> ${serious_critical} \n<b><i>Total Cases per Million:</i></b> ${total_cases_per1m} \n<b><i>Last Updated</i></b> ${record_date}`,
              { parse_mode: "HTML" }
            ); //close send message
          }
        ); //close function and then
      } //close if
    } //close parent function
  ); //close fetch
 }
); //close grandparent function and ontext

//retrieving data of infected for a particular country 
bot.onText(/\/infected (.+)/, (msg, match) => {
  let countryName = match[1];
  fetch(
    `https://coronavirus-monitor.p.rapidapi.com/coronavirus/latest_stat_by_country.php?country=${countryName.toLowerCase()}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
        "x-rapidapi-key": process.env.API_KEY,
      },
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        bot
          .sendMessage(
            msg.chat.id,
            `Retreiving Number of infected for <i><b>${capital_letter(
              countryName.toLowerCase()
            )}</b></i>`,
            { parse_mode: "HTML" }
          )
          .then((msg) => {
            let countries = JSON.parse(body);
            let {
              country,
              latest_stat_by_country: [
                {
                  total_cases,
                  new_cases,
                  active_cases,
                  serious_critical,
                  total_cases_per1m,
                  record_date,
                },
              ],
            } = countries;
            bot.sendMessage(
              msg.chat.id,
              `<b><i>Total Cases:</i></b> ${total_cases} \n<b><i>New Cases:</i></b> ${new_cases} \n<b><i>Active Cases:</i></b> ${active_cases} \n<b><i>Critical Cases:</i></b> ${serious_critical} \n<b><i>Total Cases per Million:</i></b> ${total_cases_per1m} \n<b><i>Last Updated</i></b> ${record_date}`,
              { parse_mode: "HTML" }
            ); //close send message
          }); //close function and then
      } //close if
    } //close parent function
  ); //close fetch
}); //close grandparent function and ontext

//retrieving data of recovered for a particular country 
bot.onText(/\/recovered (.+)/, (msg, match) => {
  let countryName = match[1];
  fetch(
    `https://coronavirus-monitor.p.rapidapi.com/coronavirus/latest_stat_by_country.php?country=${countryName.toLowerCase()}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
        "x-rapidapi-key": process.env.API_KEY,
      },
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        bot
          .sendMessage(
            msg.chat.id,
            `Retreiving number of recovered for <i><b>${capital_letter(
              countryName.toLowerCase()
            )}</b></i>`,
            { parse_mode: "HTML" }
          )
          .then((msg) => {
            let countries = JSON.parse(body);
            let {
              country,
              latest_stat_by_country: [{ total_recovered, record_date }],
            } = countries;
            bot.sendMessage(
              msg.chat.id,
              `<b><i>Total Recovered:</i></b> ${total_recovered} \n<b><i>Last Updated</i></b> ${record_date}`,
              { parse_mode: "HTML" }
            ); //close send message
          }); //close function and then
      } //close if
    } //close parent function
  ); //close fetch
}); //close grandparent function and ontext

//retrieving data of deaths for a particular country 
bot.onText(/\/deaths (.+)/, (msg, match) => {
  let countryName = match[1];
  fetch(
    `https://coronavirus-monitor.p.rapidapi.com/coronavirus/latest_stat_by_country.php?country=${countryName.toLowerCase()}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
        "x-rapidapi-key": process.env.API_KEY,
      },
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        bot
          .sendMessage(
            msg.chat.id,
            `Retreiving number of deaths for <i><b>${capital_letter(
              countryName.toLowerCase()
            )}</b></i>`,
            { parse_mode: "HTML" }
          )
          .then((msg) => {
            let countries = JSON.parse(body);
            let {
              country,
              latest_stat_by_country: [
                { total_deaths, new_deaths, record_date },
              ],
            } = countries;
            bot.sendMessage(
              msg.chat.id,
              `\n<b><i>Total Deaths:</i></b> ${total_deaths} \n<b><i>New Deaths:</i></b> ${new_deaths} \n<b><i>Last Updated</i></b> ${record_date}`,
              { parse_mode: "HTML" }
            ); //close send message
          }); //close function and then
      } //close if
    } //close parent function
  ); //close fetch
}); //close grandparent function and ontext

//response if only /country was entered
bot.on("message", (msg) => {
  if (msg.text.toString().toLowerCase() === "/country") {
    bot.sendMessage(
      msg.chat.id,
      `Please enter the country name after you entered /country. <i>example:</i> /country italy`,
      { parse_mode: "HTML" }
    );
  }
});

//response if only /infected was entered
bot.on("message", (msg) => {
  if (msg.text.toString().toLowerCase() === "/infected") {
    bot.sendMessage(
      msg.chat.id,
      `Please enter the country name after you entered /infected. <i>example:</i> /infected usa`,
      { parse_mode: "HTML" }
    );
  }
});

//response if only /cdeaths was entered
bot.on("message", (msg) => {
  if (msg.text.toString().toLowerCase() === "/deaths") {
    bot.sendMessage(
      msg.chat.id,
      `Please enter the country name after you entered /deaths. <i>example:</i> /deaths china`,
      { parse_mode: "HTML" }
    );
  }
});

//response if only /recovered was entered
bot.on("message", (msg) => {
  if (msg.text.toString().toLowerCase() === "/recovered") {
    bot.sendMessage(
      msg.chat.id,
      `Please enter the country name after you entered /recovered. <i>example:</i> /recovered cambodia`,
      { parse_mode: "HTML" }
    );
  }
});

//error message if any entries are different from the calls 
bot.on("message", (msg) => {
  console.log(msg);
  if (
    msg.text.toString().toLowerCase() !== "/global" &&
    msg.text.toString().toLowerCase() !== "/start" &&
    msg.text.toString().toLowerCase() !== "/help" &&
    msg.text.toString().toLowerCase().indexOf("/country") &&
    msg.text.toString().toLowerCase().indexOf("/infected") &&
    msg.text.toString().toLowerCase().indexOf("/deaths") &&
    msg.text.toString().toLowerCase().indexOf("/recovered") &&
    msg.text.toString().toLowerCase() !== "/extra"
  ) {
    bot.sendMessage(
      msg.chat.id,
      `Invalid Country or Invalid option. Please /help to see what to do.`
    );
  }
});

bot.on("polling_error", (err) => console.log(err));


// viewed at http://localhost:3000
app.get("/", function (req, res) {
  res.send("telegramBot is now starting");
});

app.listen(port, () => console.log(`telegramBot start on port ${port}!`));