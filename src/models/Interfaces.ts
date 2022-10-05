import { BigNumber, ContractInterface } from 'ethers';

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

export interface IUserFunds {
  logoURI: string;
  symbol: string;
  address: string;
  name: string;
  decimals: number;
  balance: string;
  freeBalance: string;
  freeBalanceRaw: BigNumber
  balanceRaw: BigNumber
}