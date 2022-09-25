import useSWR from "swr";
import { showNotification } from "@mantine/notifications";
import { AlertOctagon } from "tabler-icons-react";
import swapTokens from "../../data/swapTokens";

export default function use1inchRetrieveTokens(currentChain: number) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  if (currentChain === 31337) {
    //help with local testing
    currentChain = 1;
  }

  const readyUrl = `https://api.1inch.io/v4.0/${currentChain}/tokens`;

  const { data, error } = useSWR(
    currentChain !== 0 && currentChain !== 5 ? readyUrl : null,
    fetcher
  );

  if (data) {
    if (data.tokens) {
      // console.log("1inch fetch tokens success", data.tokens);
      data.flattenData = Object.values(data.tokens);
    }
    if (data.statusCode) {
      console.error("1inch fetch tokens error", data.error);
      showNotification({
        id: "1inch-fetch-error",
        color: "red",
        title: "Error Fetching Tokens",
        message: data.description,
        autoClose: true,
        disallowClose: false,
        icon: <AlertOctagon />,
      });
    }
  }

  if (error) {
    console.error("1inch fetch tokens error", error);
    showNotification({
      id: "1inch-fetch-error",
      color: "red",
      title: "Error Fetching Tokens",
      message: error.message,
      autoClose: true,
      disallowClose: false,
      icon: <AlertOctagon />,
    });
  }

  if (currentChain === 5) {
    const newData = {
      tokens: swapTokens[currentChain],
      flattenData: Object.values(swapTokens[currentChain]),
    };
    return {
      tokens: newData,
      isLoading: null,
      isError: null,
    };
  } else {
    console.log("else", data);
    return {
      tokens: data,
      isLoading: !error && !data,
      isError: error,
    };
  }
}
