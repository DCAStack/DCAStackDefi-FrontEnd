import { IToken, IContract } from "./Interfaces";

interface BaseProps {
    children?: React.ReactNode;
    className?: string;
}


export interface TokenBadgeProps extends BaseProps {
    token: IToken;
}

export interface ContractInfoProps extends BaseProps {
    contract: IContract;
}
