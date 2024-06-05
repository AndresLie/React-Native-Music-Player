import React from "react";
import { HStack,Spinner } from "native-base";

export const LoadingSpinner = () => {
    return <HStack space={10} alignItems="center" height={'60%'}>
        <Spinner accessibilityLabel="Loading posts" size="lg"/>
      </HStack>;
  };