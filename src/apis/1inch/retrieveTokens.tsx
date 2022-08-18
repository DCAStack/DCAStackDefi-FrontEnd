import useSWR from "swr";
import React, { useState } from "react";

export default function use1inchRetrieveTokens(currentChain: number) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  if (currentChain === 31337) {
    //help with local testing
    currentChain = 1;
  }

  const readyUrl = `https://api.1inch.io/v4.0/${currentChain}/tokens`;

  const { data, error } = useSWR(currentChain !== 0 ? readyUrl : null, fetcher);

  if (data) {
    if (data.tokens) {
      data.flattenData = Object.values(data.tokens);
    }
  }

  if (error) console.log("1inch fetch tokens error", error);

  return {
    tokens: data,
    isLoading: !error && !data,
    isError: error,
  };
}
