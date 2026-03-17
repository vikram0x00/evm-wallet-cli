#!/usr/bin/env node
import { ethers } from "ethers";
import { writeFile, readFile, readdir } from "fs/promises";
import { mkdirSync, writeFileSync } from "fs";
import { styleText } from "util";
import ReadLine from "readline";
console.clear();

const readline = ReadLine.createInterface({
	input: process.stdin,
	output: process.stdout
});

type walletSession = {
	state?: string | undefined,
	walletId?: string | undefined
}

const ethereumRpc = new ethers.JsonRpcProvider("https://ethereum-rpc.publicnode.com");

console.log(styleText(["bold", "bgBlue"], " EVM Wallet CLI "), "\n\nHardware Wallet for the Command Line");

const session: walletSession = {};

const walletFolder = "/wallet";
const walletFile = "/wallet/wallet.wcli";
const walletInfoJson = "/wallet/config.json";

const folders = await readdir("/");
if(!folders.includes("wallet")){
	mkdirSync(walletFolder);
	writeFileSync(walletFile, "");
	writeFileSync(walletInfoJson, `{
	"txns": [], 
	"tokens": [],
	"networks": [
		{
			"url": "",
			"testnet": false
		}
	],
	"defaultNetwork": "",
	"defaultWallet": "",
	"wallets": [],
	"walletPath": "/wallet/wallet.wcli"
}`);
}

const fmtGreen = (arg: string)=>{ return styleText("green", arg) };

console.log(`Type ${styleText("yellowBright", "help")} for Commands and Help.\nType ${styleText("yellowBright", "git")} for Source Code\n`);

const helpText = `${styleText(["green", "bold", "underline"], "[+] Help Menu @ EVM Wallet")}\n
create - Create New EVM Wallet
wallets - View Existing Wallets
balance - Balance for Current Wallet
balanceall - Balances for all wallets
export - Export Private Key
git - Display Git Repository
send - Send Tokens / Native Currency
contract - Manage Contract addresses
network - Manage EVM networks
recieve - Recieve Crypto
mode - Set EVM Network 
default - Set Default Wallet
wallets - View Existing Wallets

clear - Clear Screen
exit - Exit the Wallet
help - Display this Menu`;

readline.on("line", async (input)=>{
	if(input === "create"){
		const wallet = ethers.Wallet.createRandom();
		console.log(`[+] New Wallet Created\n\n${fmtGreen("Address:")} ${wallet.address}\n${fmtGreen("Private Key:")} ${wallet.privateKey}\n${fmtGreen("[+] Info Saved to wallet.wcli")}`);
		const existingWallets = (await readFile(walletFile, "utf-8")).split("\n");
		existingWallets.push(wallet.privateKey);
		await writeFile(walletFile, existingWallets.join("\n"));
	}
	else if(input === "wallets"){
		const wallets = (await readFile(walletFile, "utf-8")).split("\n");
		if(wallets.length === 0){
			console.log(`${styleText("red", "Error: ")} No Wallets Found`);
			return;
		}
		const walletAddressMap = wallets.map(e => {
			const address = new ethers.Wallet(e).address.slice(0,7) + "...";
			return { address, privateKey: `${e.slice(0,6)}...${e.slice(-6)}` }
		});
		console.log(fmtGreen("[+] Existing Wallets"), "\n");
		walletAddressMap.forEach((w, i)=>{
			console.log(`[${i}] ${fmtGreen("Address: ")} ${w.address} | ${fmtGreen("Private Key: ")} ${w.privateKey}`);
		});
	}
	else if(input === "balanceall"){
		const wallets = (await readFile(walletFile, "utf-8")).split("\n");
		console.log(`${fmtGreen("[+] Wallet Balance")}\n`);
		wallets.forEach(async (wallet) => {
			const address = new ethers.Wallet(wallet).address;
			const balance = await ethereumRpc.getBalance(address);
			const fmtBal = ethers.formatUnits(balance, 18);
			console.log(`${fmtGreen("Address: ")} ${wallet.slice(0, 6)}... | ${Number(fmtBal).toFixed(3)} ETH`);
		});
	}
	else if(input === "balance"){
		
	}
	else if(input === "default"){
		const wallets = (await readFile(walletFile, "utf-8")).split("\n");
		const walletObj = wallets.map(e => {
			return new ethers.Wallet(e);
		});
		walletObj.forEach((w, i)=>{
			console.log(`[${i}] ${fmtGreen("Address: ")} ${w.address.slice(0, 6)}... | ${fmtGreen("Private Key: ")} ${w.privateKey.slice(0, 7)}...`);
		});
		process.stdout.write("Enter Wallet Index to Set a Default Wallet: ");
		session.state = "awaiting_def_walletIndex";
	}
	else if(input === "help"){
		console.log(helpText);
	}
	else if(input === "clear"){
		console.clear();
	}
	else if(input === "exit"){
		readline.close();
	}
	else if(session.state === "awaiting_def_walletIndex"){
		const allWalletAddresses = (await readFile(walletFile, "utf-8")).split("\n").map(e => { return new ethers.Wallet(e).address });
		const walletIndex = Number(input);
		const configJson = JSON.parse(await readFile(walletInfoJson, "utf-8"));
		if(isNaN(walletIndex) || walletIndex >= allWalletAddresses.length){
			console.log(styleText("red", "Error: "), "Invalid Wallet Index Entered.");
			return;
		}
		configJson.defaultWallet = allWalletAddresses[walletIndex];
		await writeFile(walletInfoJson, JSON.stringify(configJson));
		console.log("New Default Wallet Set Successfully");
		delete session.state;
	}
	else{
		console.log(styleText("red", "Unknown Command Entered"), `Type ${styleText("yellowBright", "help")} for help and commands\n`);
	}
});