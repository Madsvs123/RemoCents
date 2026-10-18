import { Button } from "@chakra-ui/react";
import React from "react";

const ChakraButton = ({ children, ...props }) => {
  return (
    <Button 
      colorScheme="brand"
      px={6}
      py={2}
      fontWeight="medium"
      borderRadius="md"
      _hover={{ 
        transform: "translateY(-1px)",
        boxShadow: "md"
      }}
      _active={{ 
        transform: "translateY(0)"
      }}
      transition="all 0.2s"
      {...props}
    >
      {children}
    </Button>
  );
};

export default ChakraButton;