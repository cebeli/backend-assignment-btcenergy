import Transaction from "./Transaction";

type Wallet = {
    address: string,
    energyInKwH: number,
    tx: Array<Transaction>
}

export default Wallet
