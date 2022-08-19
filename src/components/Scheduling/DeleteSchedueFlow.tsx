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

export default function DeleteScheduleFlow(
  scheduleId: number,
  enableFunc: boolean = false
) {
  const { address: contractAddr, abi: contractABI } =
    useContext(ContractContext);
  const { address, isConnecting, isDisconnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const {
    config: deleteScheduleConfig,
    error: preparedeleteScheduleError,
    isError: preparedeleteScheduleIsError,
  } = usePrepareContractWrite({
    addressOrName: contractAddr,
    contractInterface: contractABI,
    enabled: enableFunc,
    functionName: "deleteSchedule",
    args: [scheduleId],
    onError(error) {
      console.log("Delete Schedule Prepared Error", error);
    },
    onSuccess(data) {
      console.log("Delete Schedule Prepared Success", data);
    },
  });

  const {
    data: deleteScheduleData,
    error: deleteScheduleError,
    isError: deleteScheduleIsError,
    write: deleteSchedule,
  } = useContractWrite({
    ...deleteScheduleConfig,
    onSuccess(data) {
      console.log("Delete Schedule Write Success", data);

      showNotification({
        id: "delete-schedule-pending",
        loading: true,
        title: "Delete Schedule Pending",
        message: "Waiting for your tx. Check status on your account tab.",
        autoClose: true,
        disallowClose: false,
      });
    },

    onError(error) {
      console.log("Delete Schedule Write Error", error);

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

  const { isLoading: deleteTxPending, isSuccess: deleteTxDone } =
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
        });
      },
      onError(error) {
        console.log("Withdraw Gas Error", error);

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
