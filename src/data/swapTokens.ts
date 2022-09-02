import { IToken } from "../models/Interfaces";

const swapTokens: Record<number, IToken[]> = {
    0: [
        {
            address: "",
            decimals: 0,
            logoURI: "",
            name: "",
            symbol: ""
        },
    ],

    1:
        [ //mainnet
            {
                address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                decimals: 18,
                logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
                name: "Ethereum",
                symbol: "ETH"
            },
            {
                address: "0x6b175474e89094c44da98b954eedeac495271d0f",
                decimals: 18,
                logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
                name: "Dai Stablecoin",
                symbol: "DAI"
            },
            {
                address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                decimals: 6,
                logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
                name: "USD Coin",
                symbol: "USDC"
            },
            {
                address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
                decimals: 6,
                logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
                name: "Tether USD",
                symbol: "USDT"
            },

            {
                address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
                decimals: 8,
                logoURI: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
                name: "Wrapped BTC",
                symbol: "WBTC"
            },
            {
                address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                decimals: 18,
                logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
                name: "Wrapped Ether",
                symbol: "WETH"
            }
        ],
    137: [ //matic
        {
            address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            decimals: 18,
            logoURI: "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
            name: "Matic",
            symbol: "MATIC"
        },
        {
            address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
            decimals: 18,
            logoURI: "https://tokens.1inch.io/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619.png",
            name: "Ethereum",
            symbol: "ETH"
        },
        {
            address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            decimals: 6,
            logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
            name: "Tether USD",
            symbol: "USDT"
        },
        {
            address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            decimals: 6,
            logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
            name: "USD Coin",
            symbol: "USDC"
        },
        {
            address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
            decimals: 18,
            logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
            name: "Dai Stablecoin",
            symbol: "DAI"
        },
        {
            address: "0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b",
            decimals: 18,
            logoURI: "https://tokens.1inch.io/0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b.png",
            name: "Avalanche Token",
            symbol: "AVAX"
        },
        {
            address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
            decimals: 8,
            logoURI: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
            name: "Wrapped Bitcoin",
            symbol: "WBTC"
        },
    ],
    31337:
        [ //local mainnet
            {
                address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                decimals: 18,
                logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
                name: "Ethereum",
                symbol: "ETH"
            },
            {
                address: "0x6b175474e89094c44da98b954eedeac495271d0f",
                decimals: 18,
                logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
                name: "Dai Stablecoin",
                symbol: "DAI"
            },
            {
                address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                decimals: 6,
                logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
                name: "USD Coin",
                symbol: "USDC"
            },
            {
                address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
                decimals: 6,
                logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
                name: "Tether USD",
                symbol: "USDT"
            },

            {
                address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
                decimals: 8,
                logoURI: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
                name: "Wrapped BTC",
                symbol: "WBTC"
            },
            {
                address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                decimals: 18,
                logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
                name: "Wrapped Ether",
                symbol: "WETH"
            }
        ],
};


export default swapTokens;