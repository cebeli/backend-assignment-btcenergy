import Wallet from "../types/Wallet"
import mapTransaction, { txExt } from "./transactionMapper"

interface walletExt { 
    address: string, 
    txs: Array<txExt> 
}
const energyperbyteinkwh = parseFloat(process.env.energyperbyteinkwh || '4.56')

const mapWallet = (data: walletExt ): Wallet => {
    const calculateEnergyFromTransactions = (arr: Array<{ hash: string, size: number, tx_index: string }>): number => {
        const rawSum: number = arr.reduce((acc, curr) => acc + (curr.size * (energyperbyteinkwh * 1000)), 0)
        return rawSum / 1000
    }

    const wallet: Wallet = {
        address: data.address,
        energyInKwH: calculateEnergyFromTransactions(data.txs),
        tx: data.txs.map((tx: { hash: string, size: number, tx_index: string }) => mapTransaction(tx))
    }
    return wallet
}

export default mapWallet
