import { useEffect, useContext } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { CircleCheck, AlertOctagon } from "tabler-icons-react";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useWaitForTransaction,
} from "wagmi";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ContractContext } from "../../App";
import { parseUnits, parseEther } from "ethers/lib/utils";

export default function ResumeScheduleFlow(
  scheduleId: number,
  enableFunc: boolean = false,
  gasEstimate: string,
  freeTokenBalance: string,
  tokenBalance: string
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const addRecentTransaction = useAddRecentTransaction();

  const {
    config: modifyStatusConfig,
    error: prepareModifyStatusError,
    isError: prepareModifyStatusIsError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled: enableFunc,
    functionName: "resumeSchedule",
    args: [scheduleId, parseEther("1").toString()],
    onError(error) {
      console.log("Resume Status Prepared Error", error);
      showNotification({
        id: "resume-status-error",
        color: "red",
        title: "Error Resuming Schedule",
        message: "You may need to top up your deposit and/or gas!",
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });

      //prompt gas top up
      showNotification({
        id: "resume-status-topup-gas",
        title: "Topping Up Gas",
        message: "Please deposit X gas to resume schedule!",
        autoClose: true,
        disallowClose: false,
      });

      //prompt deposit top up
      showNotification({
        id: "resume-status-topup-deposit",
        title: "Topping Up Deposit",
        message: "Please deposit X token to resume schedule!",
        autoClose: true,
        disallowClose: false,
      });
    },
    onSuccess(data) {
      console.log("Resume Status Prepared Success", data);
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
        autoClose: true,
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
  };
}
