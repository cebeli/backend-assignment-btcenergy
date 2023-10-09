import Transaction from "../types/Transaction"
import Wallet from "../types/Wallet"
import mapTransaction from "./transactionMapper"

const energyperbyteinkwh = parseFloat(process.env.energyperbyteinkwh || '4.56')

const mapWallet = (data: any): Wallet => {
    const calculateEnergyFromTransactions = (arr: Array<Transaction>): number => {
        const rawSum: number = arr.reduce((acc, curr) => acc + (curr.size * (energyperbyteinkwh * 1000)), 0)
        return rawSum / 1000
    }

    let wallet: Wallet = {
        address: data.address,
        energyInKwH: calculateEnergyFromTransactions(data.txs),
        tx: data.txs.map((tx: any) => mapTransaction(tx))
    }
    return wallet
}

export default mapWallet
