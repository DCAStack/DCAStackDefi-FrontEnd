import { IToken } from "./Interfaces";

interface BaseProps {
    children?: React.ReactNode;
    className?: string;
}


export interface TokenBadgeProps extends BaseProps {
    token: IToken;
}
