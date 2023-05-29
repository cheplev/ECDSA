const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { toHex } = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");


app.use(cors());
app.use(express.json());


function setAddress(hex) {
  return '0x' + hex;
}

const balances = {
  [setAddress("033c6d1c8b8ea0b44518b53dfa69d85702246fa9d7a16c57d71301e918a90f2c5b")] : 100,
  //e87948922c7546cb9dd59c7b2d5b2fc70edc8f2a4dd49db373f27c4c9d77318a
  [setAddress("02abf7cc8afcbcd5bbc12886fcb39c648057cb6410732a1d3fec8d75cd4d257713")]: 50,
  //dfbc344e1ae245b4047ca598c0111085b4b467872b6c51ebb8f330128965b2d5
  [setAddress("0275626a66aa7bd1aaf815219b43975ab32a747b0f286f8349606396bb18c8618f")]: 75,
  //57ca75aad0383beef2910a7ce538fe30ececd5582c04613e33540121208aecd7
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;
  console.log("Received send request. Sender:", sender, "Recipient:", recipient, "Amount:", amount);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    const recipientAddress = '0x' + toHex(secp.secp256k1.getPublicKey(recipient))
    balances[recipientAddress] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
