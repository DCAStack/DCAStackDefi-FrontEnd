import { useContext, useEffect, useState } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { AlertOctagon, CircleCheck } from "tabler-icons-react";

import { BigNumber } from "@ethersproject/bignumber";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { parseEther } from "ethers/lib/utils";
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import use1inchRetrieveQuote from "../../apis/1inch/RetrieveQuote";
import { ContractContext } from "../../App";
import { IToken } from "../../models/Interfaces";

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
  const { chain } = useNetwork();
  const currentChain: number = chain ? chain?.id : 0;
  const { address } = useAccount();

  const [quote1inch, setQuote1inch] = useState({
    estimatedGasFormatted: "0",
  });
  const [enableRead, setEnableRead] = useState(false);
  const [enableWrite, setEnableWrite] = useState(false);

  const { quote: quoteDetails } = use1inchRetrieveQuote(
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

  const { config: modifyStatusConfig } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled: enableFunc && enableRead && !remainingBudget.eq(0),
    functionName: "resumeSchedule",
    args: [scheduleId, parseEther(quote1inch.estimatedGasFormatted)],
    overrides: {
      from: address,
    },
    onError(error) {
      console.error("Resume Status Prepared Error", error);
      setEnableWrite(false);
    },
    onSuccess(data) {
      console.log("Resume Status Prepared Success", data);
      setEnableWrite(true);
    },
  });

  const { data: modifyStatusData, write: resumeSchedule } = useContractWrite({
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
      console.error("Resume Status Write Error", error);

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

  useWaitForTransaction({
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
      console.error("Resume Schedule Error", error);

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