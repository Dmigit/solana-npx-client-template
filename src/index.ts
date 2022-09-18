import * as Web3 from '@solana/web3.js';
import Dotenv from 'Dotenv';
Dotenv.config();

async function main() {
    const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'));
    const keypair = initializeKeypair();
    await connection.requestAirdrop(keypair.publicKey, Web3.LAMPORTS_PER_SOL*1);
    const balanceBefore = await connection.getBalance(keypair.publicKey);
    console.log("Original balance of sending account:", balanceBefore / Web3.LAMPORTS_PER_SOL);
    await sendSol(connection, 0.1*Web3.LAMPORTS_PER_SOL, Web3.Keypair.generate().publicKey, keypair);
    const balanceAfter = await connection.getBalance(keypair.publicKey);
    console.log("Balance of sending account after transaction", balanceAfter / Web3.LAMPORTS_PER_SOL);
}

function initializeKeypair(): Web3.Keypair {
    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
    const secretKey = Uint8Array.from(secret);
    const keypairFromSecret = Web3.Keypair.fromSecretKey(secretKey);
    return keypairFromSecret;
}

async function sendSol(connection: Web3.Connection, amount: number, to: Web3.PublicKey, sender: Web3.Keypair) {
    const transaction = new Web3.Transaction();

    const sendSolInstruction = Web3.SystemProgram.transfer(
        {
            fromPubkey: sender.publicKey,
            toPubkey: to,
            lamports: amount,
        }
    )

    transaction.add(sendSolInstruction);
    const sig = await Web3.sendAndConfirmTransaction(connection, transaction, [sender]);
    console.log(`You can view your transaction on the Solana explorer at:\nhttps://explorer.solana.com/tx/${sig}?cluster=devnet`);
}


main()
    .then(() => {
        console.log("Finished successfully")
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
