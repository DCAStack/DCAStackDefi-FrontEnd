import { useEffect, useContext, useState } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon } from "tabler-icons-react";

import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useNetwork,
  useAccount,
} from "wagmi";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { parseEther } from "ethers/lib/utils";
import use1inchRetrieveQuote from "../../apis/1inch/RetrieveQuote";
import { IToken } from "../../models/Interfaces";
import { BigNumber } from "@ethersproject/bignumber";

export default function ResumeScheduleFlow(
  scheduleId: number,
  enableFunc: boolean = false,
  remainingBudget: BigNumber,
  tradeAmount: BigNumber,
  tradeFrequency: BigNumber,
  sellToken: IToken,
  buyToken: IToken,
  numExec: number
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const addRecentTransaction = useAddRecentTransaction();
  const { chain, chains } = useNetwork();
  const currentChain: number = chain ? chain?.id : 0;
  const { address, isConnecting, isDisconnected } = useAccount();

  const [quote1inch, setQuote1inch] = useState({
    estimatedGasFormatted: "0",
  });
  const [enableRead, setEnableRead] = useState(false);
  const [enableWrite, setEnableWrite] = useState(false);

  const {
    quote: quoteDetails,
    isLoading: quoteLoading,
    isError: quoteError,
  } = use1inchRetrieveQuote(
    currentChain,
    sellToken,
    buyToken,
    tradeAmount.toString(),
    tradeFrequency.toNumber(),
    new Date(),
    new Date(),
    numExec,
    true
  );

  useEffect(() => {
    if (quoteDetails) {
      setQuote1inch(quoteDetails);
      setEnableRead(true);
    }
  }, [quoteDetails]);

  const {
    config: modifyStatusConfig,
    error: prepareModifyStatusError,
    isError: prepareModifyStatusIsError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled: enableFunc && enableRead && !remainingBudget.eq(0),
    functionName: "resumeSchedule",
    args: [scheduleId, parseEther(quote1inch.estimatedGasFormatted)],
    overrides: {
      from: address,
    },
    onError(error) {
      console.log("Resume Status Prepared Error", error);
      setEnableWrite(false);
    },
    onSuccess(data) {
      console.log("Resume Status Prepared Success", data);
      setEnableWrite(true);
    },
  });

  const {
    data: modifyStatusData,
    error,
    isError: modifyStatusError,
    write: resumeSchedule,
  } = useContractWrite({
    ...modifyStatusConfig,
    onSuccess(data) {
      console.log("Resume Status Write Success", data);

      showNotification({
        id: "resume-status-pending",
        loading: true,
        title: "Pending Schedule Resume",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: false,
        disallowClose: false,
      });
    },

    onError(error) {
      console.log("Resume Status Write Error", error);

      showNotification({
        id: "resume-status-error",
        color: "red",
        title: "Error Resuming Schedule",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  const { isLoading: txPending, isSuccess: txDone } = useWaitForTransaction({
    hash: modifyStatusData?.hash,
    onSuccess(data) {
      console.log("Resume Schedule Success", data);

      addRecentTransaction({
        hash: data.transactionHash,
        description: "Resume Schedule",
      });

      updateNotification({
        id: "resume-status-pending",
        color: "teal",
        title: "Resume Schedule Complete",
        message: "Happy DCAing!",
        icon: <CircleCheck />,
        autoClose: true,
      });
    },
    onError(error) {
      console.log("Resume Schedule Error", error);

      updateNotification({
        id: "resume-status-pending",
        color: "red",
        title: "Error Resuming Schedule",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  return {
    resume: resumeSchedule,
    resumeStatus: enableWrite,
  };
}
