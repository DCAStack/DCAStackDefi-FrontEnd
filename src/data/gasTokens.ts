import { IToken } from "../models/Interfaces";

const gasTokens: Record<number, IToken> = {
    0: {
        address: "",
        decimals: 0,
        logoURI: "",
        name: "",
        symbol: "Gas?"
    },

    1: {
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        decimals: 18,
        logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
        name: "Ethereum",
        symbol: "ETH"
    },
    5: {
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        decimals: 18,
        logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
        name: "Ethereum",
        symbol: "ETH"
    },
    31337: {
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        decimals: 18,
        logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
        name: "Ethereum",
        symbol: "ETH"
    },
    137: {
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        decimals: 18,
        logoURI: "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
        name: "Matic",
        symbol: "MATIC"
    },
};

export const nullToken: IToken = {
    address: "",
    decimals: 0,
    logoURI: "",
    name: "",
    symbol: ""
}

export default gasTokens;