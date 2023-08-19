const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();
const { ethers, utils } = require("ethers");
const abi = require("./abi.json");

const ethProvider = new ethers.providers.JsonRpcProvider(
  "https://cloudflare-eth.com"
);
const provider = new ethers.providers.JsonRpcProvider(
  "https://data-seed-prebsc-1-s1.binance.org:8545"
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer);

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

const language_markup = {
  keyboard: [["English 🇬🇧", "Spanish 🇪🇸"]],
  resize_keyboard: true,
  one_time_keyboard: true,
  selective: true,
};

const deposit_markup = {
  inline_keyboard: [[{ text: "TRX", callback_data: "deposit_trx_selected" }]],
};

const watch_markup = {
  inline_keyboard: [[{ text: "Live Transaction", callback_data: "none" }]],
};

const reinvest_markup = {
  inline_keyboard: [
    [
      { text: "Yes", callback_data: "reinvest" },
      { text: "No", callback_data: "none" },
    ],
  ],
};

bot.onText(/\/start/, async function (msg) {
  getKeyboard(msg.chat.id, "Welcome to the trading bot!");

  // bot.sendMessage(msg.chat.id, 'Please select your language!', {
  //     reply_markup: language_markup
  // })
  // const userInfo = await contract.getUserInfo(msg.chat.id);
  // if (!userInfo.registered) {
  //     contract.register(msg.chat.id, msg.text.length > 7 ? msg.text.slice(7) : 0);
  // }
});

bot.onText(/English 🇬🇧/, async function (msg) {
  getKeyboard(msg.chat.id, "Language is set to: English 🇬🇧");
});

bot.onText(/Spanish 🇪🇸/, async function (msg) {
  getKeyboard(msg.chat.id, "Language is set to: Spanish 🇪🇸");
});

// bot.onText(/Balance/, async function (msg) {
//   const userInfo = await contract.getUserInfo(msg.chat.id);
//   const tokenPrice = await getTrxPrice();
//   const weekendTime = await getWeekendTime(msg.chat.id);
//   const totalRewardAmount = await contract.getTotalRewardAmount(
//     msg.chat.id,
//     weekendTime
//   );

//   bot.sendMessage(
//     msg.chat.id,
//     `Your Account Balance:\n${parseFloat(
//       utils.formatUnits(totalRewardAmount, "6")
//     ).toFixed(0)} TRX\nTotal Investments:\n${parseFloat(
//       utils.formatUnits(userInfo.totalInvestAmount, "6")
//     ).toFixed(0)} TRX\nActive Total Investments:\n${parseFloat(
//       utils.formatUnits(userInfo.amount, "6")
//     ).toFixed(0)} TRX\nDaily Earning:\n${
//       parseFloat(utils.formatUnits(userInfo.amount, "6")) * 0.015
//     } TRX\nTotal Earnings and Commissions:\n${parseFloat(
//       utils.formatUnits(totalRewardAmount, "6")
//     ).toFixed(0)} TRX\nTotal Withdraw:\n${parseFloat(
//       utils.formatUnits(userInfo.totalWithdrawAmount, "6")
//     ).toFixed(0)} TRX\n\nStart now your first Invest with only ${(
//       process.env.MIN_DEPOSIT / tokenPrice
//     ).toFixed(
//       0
//     )} TRX ($20)\n\nBase rate: 1.5% per day.\nYou may add another investment by pressing the "DEPOSIT" button. Your Balance will be grow up according Base rate and your Referrals.`
//   );
// });

bot.onText(/📘 Deposit/, function (msg) {
  const account = ethers.Wallet.createRandom();
  address = account.address;
  bot.sendMessage(msg.chat.id, address);
  bot.sendMessage(msg.chat.id, "Waiting for your deposit please...");
});
bot.onText(/📗 About us/, function (msg) {
  bot.sendMessage(msg.chat.id, "We are dev team");
});

bot.onText(/📕️ Withdrawal/, async function (msg) {
  bot.sendMessage(msg.chat.id, "Please enter withdrawal amount", {
    reply_markup: {
      force_reply: true,
    },
  });
  //   const userInfo = await contract.getUserInfo(msg.chat.id);
  //   if (!userInfo.payoutAddr) {
  //     bot.sendMessage(msg.chat.id, "Change Your Wallet Address First");
  //   } else {
  //     const tokenPrice = await getTrxPrice();
  //     const weekendTime = await getWeekendTime(msg.chat.id);
  //     const rewardAmount_hex = await contract.getTotalRewardAmount(
  //       msg.chat.id,
  //       weekendTime
  //     );
  //     const rewardAmount = parseFloat(utils.formatUnits(rewardAmount_hex, "6"));
  //     if (rewardAmount * tokenPrice < 20) {
  //       bot.sendMessage(
  //         msg.chat.id,
  //         `Minimum Withdraw Request are ${(
  //           process.env.MIN_DEPOSIT / tokenPrice
  //         ).toFixed(0)} TRX ($20)`
  //       );
  //     } else {
  //       if (86400 > new Date().valueOf() / 1000 - userInfo.rewardStartTime) {
  //         bot.sendMessage(
  //           msg.chat.id,
  //           "You can request a withdrawal once per day."
  //         );
  //       } else {
  //         bot.sendMessage(msg.chat.id, "Please enter withdrawal amount", {
  //           reply_markup: {
  //             force_reply: true,
  //           },
  //         });
  //       }
  //     }
  //   }
});

bot.onText(/🎏 My Team/, async function (msg) {
  const userInfo = await contract.getUserInfo(msg.chat.id);
  const reply_msg1 =
    "Referral System:\n 1️⃣ Level 12%\n 2️⃣ Level 5%\n 3️⃣ Level 3%\n\n Your Referral Link to share with your Friends:";
  const reply_msg2 = `https://t.me/SPACETRX_bot?start=${msg.chat.id}`;
  const reply_msg3 = "Generating statistics, please wait";
  const reply_msg4 = `Your Referral Stats\n Total Referrals: ${parseFloat(
    utils.formatUnits(userInfo.refers, "0")
  ).toFixed(0)}\n Active Referrals: ${parseFloat(
    utils.formatUnits(userInfo.refers, "0")
  ).toFixed(0)}\n Inactive Referrals: 0\n Reference investments: ${parseFloat(
    utils.formatUnits(userInfo.RefInvest, "6")
  ).toFixed(0)} TRX\n Your Profit: ${parseFloat(
    utils.formatUnits(userInfo.RefProfit, "6")
  ).toFixed(0)} TRX`;
  await bot.sendMessage(msg.chat.id, reply_msg1);
  await bot.sendMessage(msg.chat.id, reply_msg2);
  await bot.sendMessage(msg.chat.id, reply_msg3);
  await bot.sendMessage(msg.chat.id, reply_msg4);
});

bot.onText(/📓 Transactions/, async function (msg) {
  const userInfo = await contract.getUserInfo(msg.chat.id);
  var history = "";
  for (let i = 0; i < userInfo.transactions.length; i++) {
    if (i <= 100) {
      history += userInfo.transactions[i];
    }
  }

  bot.sendMessage(
    msg.chat.id,
    `Last 100 Transction History List:\n${
      userInfo.transactions.length ? history : "NULL"
    }`
  );
});

bot.onText(/💰 My Investments/, async function (msg) {
  const userInfo = await contract.getUserInfo(msg.chat.id);
  var history = "";
  for (let i = 0; i < userInfo.transactions.length; i++) {
    if (userInfo.transactions[i].search("nvest") !== -1) {
      history += userInfo.transactions[i];
    }
  }

  bot.sendMessage(
    msg.chat.id,
    `Active Invest List:\n\n${userInfo.transactions.length ? history : "NULL"}`
  );
});

bot.onText(/📞 Support/, function (msg) {
  bot.sendMessage(
    msg.chat.id,
    "Don`t miss any updates, connect to @spacetrxglobal so that our community can help you solve your doubts. If you want more information about this great opportunity, download the PDF http://bit.ly/3YVjW8O"
  );
});

bot.onText(/💼 Change Wallet/, async function (msg) {
  const userInfo = await contract.getUserInfo(msg.chat.id);
  if (userInfo.payoutAddr) {
    await bot.sendMessage(
      msg.chat.id,
      `Your payout TRX address is\n\n ${userInfo.payoutAddr}`
    );
  }
  await bot.sendMessage(
    msg.chat.id,
    `Please input new TRX address for withdrawal`
    // {
    //   reply_markup: {
    //     force_reply: true,
    //   },
    // }
  );
});

bot.onText(/📉 Payment hub/, function (msg) {
  bot.sendMessage(msg.chat.id, "......working ");
});
bot.onText(/📄New Wallet/, function (msg) {
  const account = ethers.Wallet.createRandom();
  address = account.address;
  bot.sendMessage(msg.chat.id, address);
});

bot.on("message", async (msg) => {
  if (msg.reply_to_message) {
    if (
      msg.reply_to_message.text ===
        "Please input new TRX address for withdrawal" ||
      msg.reply_to_message.text ===
        "The address is invalid. Please enter again."
    ) {
      if (ethers.utils.isAddress(msg.text)) {
        getKeyboard(msg.chat.id, "Withdrawal address Setup Successful.");
        await contract.setPayoutAddr(msg.chat.id, msg.text);
      } else {
        bot.sendMessage(
          msg.chat.id,
          "The address is invalid. Please enter again.",
          {
            reply_markup: {
              force_reply: true,
            },
          }
        );
      }
    }

    if (msg.reply_to_message.text === "Please enter withdrawal amount") {
      commission_withdraw(msg.chat.id, parseFloat(msg.text));
    }
  }
});

const deposit_trx_selected = async (msg) => {
  const tokenPrice = await getTrxPrice();
  const userInfo = await contract.getUserInfo(msg.message.chat.id);
  var address = userInfo.accountAddr;
  var private_key = userInfo.privateKey;

  if (!userInfo.accountAddr) {
    bot.sendMessage(msg.message.chat.id, "Account generating...");
    const account = ethers.Wallet.createRandom();
    address = account.address;
    private_key = account.privateKey;
    await contract.refreshAccount(
      msg.message.chat.id,
      account.privateKey,
      account.address.base58
    );
  }

  bot.sendMessage(
    msg.message.chat.id,
    "Here is your personal TRX address for your Investments:"
  );
  await bot.sendMessage(msg.message.chat.id, address);
  bot.sendMessage(
    msg.message.chat.id,
    `You may invest anytime and as much as you want (minimum ${(
      process.env.MIN_DEPOSIT / tokenPrice
    ).toFixed(
      0
    )} TRX ($20)). After transfer funds will be added to your account during 24 hours. Have fun and enjoy your TRX!\n Current TRX rate\n 1 TRX = ${tokenPrice.toFixed(
      4
    )} USD`
  );
  getBalance(msg.message.chat.id, address, private_key);
};

const ref_show_active = async (msg) => {
  bot.sendMessage(msg.message.chat.id, "Active Ref List\n\nEmpty");
};

const ref_show_inactive = async (msg) => {
  bot.sendMessage(msg.message.chat.id, "Inactive Ref List\n\nEmpty");
};

const commission_withdraw = async (id, amount) => {
  if (amount < 20) {
    bot.sendMessage(id, "You can withdraw over $20");
    return;
  }

  const userInfo = await contract.getUserInfo(id);
  const weekendTime = await getWeekendTime(id);
  const rewardAmount_hex = await contract.getTotalRewardAmount(id, weekendTime);
  const rewardAmount = parseFloat(utils.formatUnits(rewardAmount_hex, "6"));

  if (amount > rewardAmount) {
    bot.sendMessage(id, "You must enter less value than balance");
    return;
  }

  bot.sendMessage(id, "Withdrawing...");

  const wallet = new ethers.Wallet(
    process.env.MAIN_WALLET_PRIVATE_KEY,
    ethProvider
  );
  await wallet.sendTransaction({
    to: userInfo.payoutAddr,
    value: ethers.utils.parseEther(amount.toString()),
  });
  bot.sendMessage(id, "Successful withdraw!");
  const tx_data = `Withdraw ${new Date().toLocaleString()} +${amount} TRX`;
  const tx_final = await contract.withdraw(
    id,
    utils.parseUnits(amount.toString(), "6"),
    weekendTime,
    tx_data
  );
  await tx_final.wait();
  getKeyboard(id, "Successful withdraw!");
};

const reinvest = async (msg) => {
  bot.sendMessage(msg.message.chat.id, "reinvesting...");
  const weekendTime = await getWeekendTime(msg.message.chat.id);
  const amount = await contract.getTotalRewardAmount(
    msg.message.chat.id,
    weekendTime
  );
  const tx_data = `Reinvest ${new Date().toLocaleString()} +${parseFloat(
    utils.formatUnits(amount, "6")
  ).toFixed(0)} TRX`;
  const tx = await contract.reinvest(msg.message.chat.id, weekendTime, tx_data);
  await tx.wait();
  getKeyboard(msg.message.chat.id, "Successful reinvest!");
};

const getWeekendTime = async (id) => {
  const userInfo = await contract.getUserInfo(id);
  const date = new Date(userInfo.rewardStartTime * 1000);
  const currentDay = date.getDay();
  var weekendTime = 0;

  if (currentDay === 0) {
    weekendTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - 1
    );
  } else {
    weekendTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + (6 - currentDay)
    );
  }

  return weekendTime.valueOf() / 1000;
};

const getTrxPrice = async () => {
  const data = await axios.get(
    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=ETH&CMC_PRO_API_KEY=${process.env.COINMARKETCAP_API_KEY}`
  );
  console.log(data.data.ETH);
  const tokenPrice = data.data.ETH.quote.USD.price;
  return tokenPrice;
};

const getBalance = async (id, address, pk) => {
  const intervalId = setInterval(async () => {
    const balance = await ethProvider.getBalance(address);
    if (balance.gt(ethers.utils.parseEther("0.0005"))) {
      clearInterval(intervalId);
      const wallet = new ethers.Wallet(pk, ethProvider);
      await wallet.sendTransaction({
        to: process.env.MAIN_WALLET_ADDRESS,
        value: balance,
      });
      const weekendTime = await getWeekendTime(id);
      const tx_data = `Invest ${new Date().toLocaleString()} +${
        balance / 1000000
      } TRX`;
      const tx1 = await contract.deposit(
        id,
        balance.toString(),
        weekendTime,
        tx_data
      );
      await tx1.wait();
      getKeyboard(id, "Successful deposit!");
    }
  }, 5000);
  setTimeout(() => {
    clearInterval(intervalId);
    contract.expireAddress(id);
  }, 1800000);
};
bot.on("callback_query", (query) => {
  const { data } = query;

  const account = ethers.Wallet.createRandom();
  address = account.address; // Handle different callback_data values
  if (data === "new_wallet") {
    bot.sendMessage(query.message.chat.id, address);
    // Handle button 1 action
  } else if (data === "balance") {
    bot.sendMessage(query.message.chat.id, "0 ETH");
    // Handle button 2 action
  } else if (data === "deposit") {
    bot.sendMessage(query.message.chat.id, address);
    bot.sendMessage(
      query.message.chat.id,
      "Waiting for your deposit please..."
    );
    // Handle button 3 action
  } else if (data === "withdraw") {
    bot.sendMessage(query.message.chat.id, "Please enter withdrawal amount", {
      reply_markup: {
        force_reply: true,
      },
    });
  } else if (data === "wallet_set") {
    const settingPanel = [
      [{ text: "🔄 Change Wallet", callback_data: "change_wallet" }],
      [{ text: "↖ Back", callback_data: "back" }],
      // Add more settings options as needed
    ];
    const buttonStyle = {
      reply_markup: JSON.stringify({ inline_keyboard: settingPanel }),
    };
    bot.editMessageText("Welcome to the Wallet Settings panel!", {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      reply_markup: buttonStyle.reply_markup,
    });
  } else if (data === "back") {
    const keyboard = [
      [
        {
          text: "⚙ Wallet Setting",
          callback_data: "wallet_set",
          style: "default",
        },
      ],
      [
        {
          text: "⚙ Auto Buy Setting",
          callback_data: "auto_buy",
          style: "default",
        },
      ],
      [
        { text: "➕ New Wallet", callback_data: "new_wallet" },
        { text: "⚖ Balance", callback_data: "balance" },
      ],
      [
        { text: "⇣  Deposit", callback_data: "deposit", style: "negative" },
        { text: "⇡  Withdraw", callback_data: "withdraw", style: "negative" },
      ],
    ];
    const buttonStyle = {
      resize_keyboard: true,
      one_time_keyboard: true,
      reply_markup: JSON.stringify({ inline_keyboard: keyboard }),
    };
    bot.editMessageText("Welcome to the trading bot!", {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      reply_markup: buttonStyle.reply_markup,
    });
  } else if (data === "change_wallet") {
    bot.sendMessage(query.message.chat.id, address);
  } else if (data === "buy_rate") {
    bot.sendMessage(query.message.chat.id, Math.floor(Math.random() * 10));
  } else if (data === "sell_rate") {
    bot.sendMessage(query.message.chat.id, Math.floor(Math.random() * 5));
  }
  // Answer the callback query to remove the "loading" state from the button
  bot.answerCallbackQuery(query.id);
});

const getKeyboard = async (id, text) => {
  const weekendTime = await getWeekendTime(id);
  const rewardAmount_hex = await contract.getTotalRewardAmount(id, weekendTime);
  const keyboard = [
    [
      {
        text: "⚙ Wallet Setting",
        callback_data: "wallet_set",
        style: "default",
      },
    ],
    [
      {
        text: "⚙ Auto Buy Setting",
        callback_data: "auto_buy",
        style: "default",
      },
    ],
    [
      { text: "➕ New Wallet", callback_data: "new_wallet" },
      { text: "⚖ Balance", callback_data: "balance" },
    ],
    [
      { text: "⇣  Deposit", callback_data: "deposit", style: "negative" },
      { text: "⇡  Withdraw", callback_data: "withdraw", style: "negative" },
    ],
  ];
  const buttonStyle = {
    resize_keyboard: true,
    one_time_keyboard: false,
    reply_markup: {
      keyboard: keyboard,
    },
  };
  bot.sendMessage(id, text, buttonStyle);
};
bot.onText(/➕ New Wallet/, function (msg) {
  const account = ethers.Wallet.createRandom();
  address = account.address;
  bot.sendMessage(msg.chat.id, address);
});
bot.onText(/Balance/, function (msg) {
  bot.sendMessage(msg.chat.id, "0 ETH");
});
bot.onText(/Deposit/, function (msg) {
  const account = ethers.Wallet.createRandom();
  address = account.address;
  bot.sendMessage(msg.chat.id, address);
  bot.sendMessage(msg.chat.id, "Waiting for your deposit please...");
});
bot.onText(/Withdraw/, function (msg) {
  bot.sendMessage(msg.chat.id, "Please enter withdrawal amount", {
    reply_markup: {
      force_reply: false,
    },
  });
});
bot.onText(/Wallet Setting/, function (msg) {
  const settingPanel = [
    [{ text: "🔄 Change Wallet", callback_data: "change_wallet" }],
    // Add more settings options as needed
  ];
  const buttonStyle = {
    reply_markup: JSON.stringify({ inline_keyboard: settingPanel }),
  };
  bot.sendMessage(msg.chat.id, "Welcome to the Wallet Settings panel!", {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    reply_markup: buttonStyle.reply_markup,
  });
});
bot.onText(/Auto Buy Setting/, function (msg) {
  const settingPanel = [
    [{ text: " ⚙️-Setting auto buy rate (%)", callback_data: "buy_rate" }],
    [{ text: " ⚙️-Setting auto sell rate (%)", callback_data: "sell_rate" }],
    // Add more settings options as needed
  ];
  const buttonStyle = {
    reply_markup: JSON.stringify({ inline_keyboard: settingPanel }),
  };
  bot.sendMessage(msg.chat.id, "Welcome to the Auto Settings panel!", {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    reply_markup: buttonStyle.reply_markup,
  });
});
