const energyperbyteinkwh = parseFloat(process.env.energyperbyteinkwh || '4.56')

const calculateEnergyFromSize = (size: number): number => (size * (energyperbyteinkwh * 1000)) / 1000

export default {
    calculateEnergyFromSize
}
