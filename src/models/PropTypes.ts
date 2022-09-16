import { IToken, IUserFunds } from "./Interfaces";
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
    userFunds?: IUserFunds[];
    mappedUserFunds?: Record<string, IUserFunds>;
    userSchedules?: Record<string, any>;
}
