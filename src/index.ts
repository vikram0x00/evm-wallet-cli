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

const ethereumRpc = new ethers.JsonRpcProvider("https://ethereum-rpc.publicnode.com");

console.log(styleText(["bold", "bgBlue"], " EVM Wallet CLI "), "\n\nHardware Wallet for the Command Line");

const walletFolder = "/wallet";
const walletFile = "/wallet/wallet.wcli";
const walletInfoJson = "/wallet/config.json";

const folders = await readdir("/");
if(!folders.includes("wallet")){
	mkdirSync(walletFolder);
	writeFileSync(walletFile, " ");
	writeFileSync(walletInfoJson, "{}");
}

const fmtGreen = (arg: string)=>{ return styleText("green", arg) };

console.log(`Type ${styleText("yellowBright", "help")} for Commands and Help.\nType ${styleText("yellowBright", "git")} for Source Code\n`);

const helpText = `${styleText(["green", "bold", "underline"], "[+] Help Menu @ EVM Wallet")}\n
create - Create New EVM Wallet
wallets - View Existing Wallets
balance - View Detailed Balance
export - Export Private Key
git - Display Git Repository
send - Send Tokens / Native Currency
contract - Manage Contract addresses
network - Manage EVM networks
recieve - Recieve Crypto
mode - Set EVM Network 
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
		const walletAddressMap = wallets.map(e => {
			const address = new ethers.Wallet(e).address.slice(0,7) + "...";
			return { address, privateKey: `${e.slice(0,6)}...${e.slice(-6)}` }
		});
		console.log(fmtGreen("[+] Existing Wallets"), "\n");
		walletAddressMap.forEach((w, i)=>{
			console.log(`[${i}] ${fmtGreen("Address: ")} ${w.address} | ${fmtGreen("Private Key: ")} ${w.privateKey}`);
		});
	}
	else if(input === "balance"){
		const wallets = (await readFile(walletFile, "utf-8")).split("\n");
		wallets.forEach(async (wallet) => {
			const address = new ethers.Wallet(wallet).address;
			const balance = await ethereumRpc.getBalance(address);
			const fmtBal = ethers.formatUnits(balance, 18);
			console.log(`${fmtGreen("[+] Wallet Balance")}\n\n${fmtGreen("Address: ")} ${wallet.slice(0, 6)}... | ${Number(fmtBal).toFixed(3)} ETH\n`);
		});
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
	else{
		console.log(styleText("red", "Unknown Command Entered"), `Type ${styleText("yellowBright", "help")} for help and commands\n`);
	}
});