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

export default function DeleteScheduleFlow(
  scheduleId: number,
  enableFunc: boolean = false
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const { config: deleteScheduleConfig } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled: enableFunc,
    functionName: "deleteSchedule",
    args: [scheduleId],
    overrides: {
      from: address,
    },
    onError(error) {
      console.error("Delete Schedule Prepared Error", error);
    },
    onSuccess(data) {
      console.log("Delete Schedule Prepared Success", data);
    },
  });

  const { data: deleteScheduleData, write: deleteSchedule } = useContractWrite({
    ...deleteScheduleConfig,
    onSuccess(data) {
      console.log("Delete Schedule Write Success", data);

      showNotification({
        id: "delete-schedule-pending",
        loading: true,
        title: "Delete Schedule Pending",
        message: "Waiting for your tx...",
        autoClose: false,
        disallowClose: false,
      });
    },

    onError(error) {
      console.error("Delete Schedule Write Error", error);

      showNotification({
        id: "delete-schedule-error",
        color: "red",
        title: "Error Deleting Schedule",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  useWaitForTransaction({
    hash: deleteScheduleData?.hash,
    onSuccess(data) {
      console.log("Delete Schedule Success", data);

      addRecentTransaction({
        hash: data.transactionHash,
        description: "Delete Schedule",
      });

      updateNotification({
        id: "delete-schedule-pending",
        color: "teal",
        title: "Delete Schedule Complete",
        message: "Don't forget to withdraw your unused schedule balances.",
        icon: <CircleCheck />,
        autoClose: true,
      });
    },
    onError(error) {
      console.error("Withdraw Gas Error", error);

      updateNotification({
        id: "delete-schedule-pending",
        color: "red",
        title: "Error Deleting Schedule",
        message: error.message,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    },
  });

  return {
    delete: deleteSchedule,
  };
}
