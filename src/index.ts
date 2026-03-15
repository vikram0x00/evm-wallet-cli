import { ethers } from "ethers";
import { writeFile, readFile, mkdir, readdir } from "fs/promises";
import { styleText } from "util";
import { randomUUID } from "crypto";
import ReadLine from "readline";

console.clear();

const readline = ReadLine.createInterface({
	input: process.stdin,
	output: process.stdout
});

console.log(styleText(["bold", "bgBlue"], " EVM Wallet CLI "), "\n\nHardware Wallet for the Command Line");

const folders = await readdir("./");
if(!folders.includes("wallet")){
	await mkdir("./wallet/");
}

const walletFolder = "./wallet/";
const walletFile = "./wallet/wallet.wcli";
const walletInfoJson = "./wallet/wallet.json";

const fmtGreen = (arg: string)=>{ return styleText("green", arg) };

console.log(`Type ${styleText("yellow", "help")} for Commands and Help.\nType ${styleText("yellow", "git")} for Source Code\n`);

const helpText = `${styleText(["green", "bold", "underline"], "[+] Help Menu @ EVM Wallet")}\n
create - Create New EVM Wallet
wallets - View Existing Wallets
balance - View Detailed Balance
export - Export Private Key
git - Display Git Repository
clear - Clear Screen
exit - Exit the Wallet
help - Display this Menu`;

readline.on("line", (input)=>{
	if(input === "create"){
		const wallet = ethers.Wallet.createRandom();
		console.log(`[+] New Wallet Created\n\n${fmtGreen("Address:")} ${wallet.address}\n${fmtGreen("Private Key:")} ${wallet.privateKey}\n`);
	}
	if(input === "help"){
		console.log(helpText);
	}
	if(input === "clear"){
		console.clear();
	}
	if(input === "exit"){
		readline.close();
	}
});