import { IToken } from "./Interfaces";
import { BigNumber } from "ethers";

interface BaseProps {
    children?: React.ReactNode;
    className?: string;
}


export interface TokenBadgeProps extends BaseProps {
    token: IToken;
    displayTokenName?: boolean;
    weiDefaultValue?: BigNumber;
}

export interface ContractInfoProps extends BaseProps {
}

export interface UserFundsProps extends BaseProps {
    userFunds?: IToken[];
    mappedUserFunds?: Record<string, IToken>;
    userSchedules?: Record<string, any>;
}
