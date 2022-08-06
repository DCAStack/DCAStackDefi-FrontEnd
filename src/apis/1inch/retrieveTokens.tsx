import useSWR from "swr";
import React, { useState } from "react";

export default function use1inchRetrieveTokens(currentChain: number) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  if (currentChain === 31337) {
    //help with local testing
    currentChain = 1;
  }

  const { data, error } = useSWR(
    `https://api.1inch.io/v4.0/${currentChain}/tokens`,
    fetcher
  );

  if (data) {
    if (data.tokens) {
      data.strippedTokens = Object.values(data.tokens);
      //   console.log("1inch fetch tokens success", data);
    }
  }

  if (error) console.log("1inch fetch tokens error", error);

  return {
    tokens: data?.strippedTokens,
    isLoading: !error && !data,
    isError: error,
  };
}
