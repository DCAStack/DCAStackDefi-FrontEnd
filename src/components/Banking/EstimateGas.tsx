import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { useContext, useState } from "react";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import use1inchRetrieveMultipleQuotes from "../../apis/1inch/RetrieveMultipleQuotes";
import { ContractContext } from "../../App";
import { IToken, IUserFunds } from "../../models/Interfaces";

function EstimateGas(
  mappedUserFunds: Record<string, IUserFunds>,
  userSchedules: Record<string, any>
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { chain } = useNetwork();
  const currentChain: number = chain ? chain?.id : 0;
  const { address } = useAccount();
  const [freeGasBal, setUserGasBal] = useState(BigNumber.from(0));

  let scheduleSellTokens: IToken[] = [];
  let scheduleBuyTokens: IToken[] = [];
  let scheduleTradeAmounts: string[] = [];
  let scheduleNumExecs: number[] = [];

  if (userSchedules && mappedUserFunds) {
    Object.keys(userSchedules).map((key) => {
      if (userSchedules[key].scheduleDates) {
        scheduleSellTokens.push(mappedUserFunds[userSchedules[key].sellToken]);
        scheduleBuyTokens.push(mappedUserFunds[userSchedules[key].buyToken]);
        scheduleTradeAmounts.push(userSchedules[key].tradeAmount.toString());
        scheduleNumExecs.push(
          Math.floor(
            (new Date(userSchedules[key].scheduleDates[3] * 1000).valueOf() -
              new Date(userSchedules[key].scheduleDates[2] * 1000).valueOf()) /
              userSchedules[key].tradeFrequency.toString() /
              1000
          )
        );
      }
    });
  }

  const { totalEstimatedGas: totalEstimatedGas } =
    use1inchRetrieveMultipleQuotes(
      currentChain,
      scheduleSellTokens,
      scheduleBuyTokens,
      scheduleTradeAmounts,
      scheduleNumExecs
    );

  useContractRead({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    functionName: "getFreeGasBalance",
    args: [parseEther(totalEstimatedGas.toString())], //gas for single trade
    // enabled: enableRead,
    cacheOnBlock: true,
    watch: true,
    overrides: { from: address },
    onSuccess(data) {
      console.log(
        "Get User Free Gas Success",
        data,
        data.toString(),
        totalEstimatedGas.toString()
      );
      setUserGasBal(BigNumber.from(data));
    },
    onError(error) {
      console.error("Get User Free Gas Error", error);
      setUserGasBal(BigNumber.from(0));
    },
  });

  return {
    estimatedGas: parseEther(totalEstimatedGas.toString()),
    freeGasBal: freeGasBal,
  };
}

export default EstimateGas;
