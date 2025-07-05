import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Text,
  Stack,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react"
import { CheckIcon } from "@chakra-ui/icons"

// Replace with actual URLs or placeholder URLs
const Feature = ({ title, text, icon }) => {
  return (
    <Stack>
      <HStack align={"top"}>
        <Box color={"green.400"} px={2}>
          <Icon as={icon} />
        </Box>
        <VStack align={"start"}>
          <Text fontWeight={600}>{title}</Text>
          <Text color={useColorModeValue("gray.600", "gray.400")}>{text}</Text>
        </VStack>
      </HStack>
    </Stack>
  )
}

export default function LandingFeatures() {
  return (
    <Box p={4}>
      <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
        <Heading fontSize={{ base: "2xl", sm: "4xl" }} fontWeight={"bold"}>
          Key Features
        </Heading>
        <Text color={useColorModeValue("gray.600", "gray.400")} fontSize={"xl"}>
          Explore the powerful features that make our platform stand out.
        </Text>
      </Stack>

      <Container maxW={"5xl"} mt={12}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
          <Feature
            icon={CheckIcon}
            title={"Feature 1"}
            text={"Description of feature 1. This could be a longer description explaining the benefits."}
          />
          <Feature
            icon={CheckIcon}
            title={"Feature 2"}
            text={"Description of feature 2. This could be a longer description explaining the benefits."}
          />
          <Feature
            icon={CheckIcon}
            title={"Feature 3"}
            text={"Description of feature 3. This could be a longer description explaining the benefits."}
          />
          <Feature
            icon={CheckIcon}
            title={"Feature 4"}
            text={"Description of feature 4. This could be a longer description explaining the benefits."}
          />
        </SimpleGrid>
      </Container>
    </Box>
  )
}
