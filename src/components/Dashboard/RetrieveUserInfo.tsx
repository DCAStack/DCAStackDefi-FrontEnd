import { BigNumber } from "ethers";
import { formatUnits, Result } from "ethers/lib/utils";
import { useContext, useState } from "react";
import { useAccount, useNetwork, useContractRead } from "wagmi";
import use1inchRetrieveTokens from "../../apis/1inch/RetrieveTokens";
import { ContractContext } from "../../App";
import { IUserFunds } from "../../models/Interfaces";

function RetrieveUserInfo() {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address } = useAccount();

  const { chain } = useNetwork();

  const currentChain: number = chain ? chain?.id : 0;

  const { tokens: masterTokenList } = use1inchRetrieveTokens(currentChain);

  const [userTokenInfoState, setUserTokenInfo] = useState<Result | never>([
    [],
    [],
    [],
  ]);
  const [userScheduleInfoState, setUserScheduleInfo] = useState<Result | never>(
    [[], [], []]
  );

  useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "getUserAllTokenBalances",
    cacheOnBlock: true,
    watch: true,
    enabled: address !== undefined,
    overrides: { from: address },
    onSuccess(data) {
      console.log("Get user token balances success", data);
      setUserTokenInfo(data);
    },
    onError(error) {
      console.error("Get user token balances Error", error);
    },
  });

  useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "getUserSchedules",
    args: address,
    cacheOnBlock: true,
    watch: true,
    enabled: address !== undefined,
    onSuccess(data) {
      console.log("Get user schedules success", data);
      setUserScheduleInfo(data);
    },
    onError(error) {
      console.error("Get user schedules Error", error);
    },
  });

  let parsedTokenBalances: IUserFunds[] = [];
  let mappedTokenBalances: Record<string, IUserFunds> = {};
  let userTokenBalances = userTokenInfoState;
  let userTokenPurchasing = userScheduleInfoState;
  let userSchedules = userScheduleInfoState;

  let joinNeededTokens: any = [[], [], []];

  if (userTokenPurchasing) {
    for (const key of Object.keys(userTokenPurchasing)) {
      joinNeededTokens[0].push(userTokenPurchasing[key].buyToken);
    }
  }

  if (userTokenBalances) {
    joinNeededTokens[1] = joinNeededTokens[1].concat(
      Array(joinNeededTokens[0].length).fill(BigNumber.from(0))
    );
    joinNeededTokens[2] = joinNeededTokens[2].concat(
      Array(joinNeededTokens[0].length).fill(BigNumber.from(0))
    );

    joinNeededTokens[0] = joinNeededTokens[0].concat(userTokenBalances[0]);
    joinNeededTokens[1] = joinNeededTokens[1].concat(userTokenBalances[1]);
    joinNeededTokens[2] = joinNeededTokens[2].concat(userTokenBalances[2]);
  }

  if (joinNeededTokens) {
    joinNeededTokens[0].forEach(function (tokenAddr: string, index: number) {
      if (tokenAddr) {
        let tokenDetails = masterTokenList?.tokens[tokenAddr?.toLowerCase()];

        if (tokenDetails) {
          let addDetails = {
            logoURI: tokenDetails.logoURI,
            symbol: tokenDetails.symbol,
            address: tokenAddr,
            name: tokenDetails.name,
            decimals: tokenDetails.decimals,
            balance: formatUnits(
              joinNeededTokens[1][index],
              tokenDetails.decimals
            ),
            freeBalance: formatUnits(
              joinNeededTokens[2][index],
              tokenDetails.decimals
            ),
            balanceRaw: joinNeededTokens[1][index],
            freeBalanceRaw: joinNeededTokens[2][index],
          };
          if (!parsedTokenBalances.includes(addDetails)) {
            if (
              addDetails.freeBalance !== "0.0" ||
              addDetails.balance !== "0.0"
            ) {
              parsedTokenBalances.push(addDetails);
            }

            mappedTokenBalances[`${tokenAddr}`] = addDetails;
          }
        }
      }
    });
  }
  return {
    mappedTokenBalances: mappedTokenBalances,
    parsedTokenBalances: parsedTokenBalances,
    userSchedules: userSchedules,
  };
}

export default RetrieveUserInfo;
