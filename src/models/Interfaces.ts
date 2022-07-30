import { ContractInterface } from 'ethers';


export interface IToken {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoURI: string;
}

export interface IContract {
  address: string;
  abi: ContractInterface;
}