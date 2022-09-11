import { useContext } from "react";

import { showNotification, updateNotification } from "@mantine/notifications";
import { AlertOctagon, CircleCheck } from "tabler-icons-react";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ContractContext } from "../../App";

export default function PauseScheduleFlow(
  scheduleId: number,
  enableFunc: boolean = false
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const addRecentTransaction = useAddRecentTransaction();
  const { address } = useAccount();

  const { config: modifyStatusConfig } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled: enableFunc,
    functionName: "pauseSchedule",
    args: [scheduleId],
    overrides: {
      from: address,
    },
    onError(error) {
      console.error("Pause Status Prepared Error", error);
    },
    onSuccess(data) {
      console.log("Pause Status Prepared Success", data);
    },
  });

  const { data: modifyStatusData, write: pauseSchedule } = useContractWrite({
    ...modifyStatusConfig,
    onSuccess(data) {
      console.log("Pause Status Write Success", data);

      showNotification({
        id: "pause-status-pending",
        loading: true,
        title: "Pending Schedule Pause",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: false,
        disallowClose: false,
      });
    },

    onError(error) {
      console.error("Pause Status Write Error", error);

      showNotification({
        id: "pause-status-error",
        color: "red",
        title: "Error Pausing Schedule",
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
      console.log("Pause Schedule Success", data);

      addRecentTransaction({
        hash: data.transactionHash,
        description: "Pause Schedule",
      });

      updateNotification({
        id: "pause-status-pending",
        color: "teal",
        title: "Pause Schedule Complete",
        message: "Safe travels :)",
        icon: <CircleCheck />,
        autoClose: true,
      });
    },
    onError(error) {
      console.error("Pause Schedule Error", error);

      updateNotification({
        id: "pause-status-pending",
        color: "red",
        title: "Error Pausing Schedule",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  return {
    pause: pauseSchedule,
  };
}
