## How to replace main wallet private key

To replace .env.product file, Please follow the steps below.

1. open .env.product file.
2. replace variables<br>
COINMARKETCAP_API_KEY: you have to get coinmarketcap api key in https://coinmarketcap.com/api/ and replace<br>
PRIVATE_KEY: you have to get private key from metamask wallet and replace<br>
            the wallet must have some bnb testnet token.<br> you can get test bnb in https://testnet.bnbchain.org/faucet-smart<br>
MAIN_WALLET_PRIVATE_KEY: you have to get private key from tron wallet and replace<br>
3. .env.product file name rename as .env<br>

After all setting, you can deploy bot with follow command.

```sh
npm insatll
```

After npm install
```sh
npm start
```