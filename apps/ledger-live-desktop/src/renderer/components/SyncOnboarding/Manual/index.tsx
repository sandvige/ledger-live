import React from "react";
import { Button, Flex, Text, VerticalTimeline } from "@ledgerhq/react-ui";
import { CloseMedium } from "@ledgerhq/react-ui/assets/icons";
import { useTranslation } from "react-i18next";
import LangSwitcher from "~/renderer/components/Onboarding/LangSwitcher";

import nanoX from "~/renderer/images/nanoX.v3.svg";
import nanoXDark from "~/renderer/images/nanoXDark.v3.svg";
import Illustration from "~/renderer/components/Illustration";

const SyncOnboardingManual = () => {
  const { t } = useTranslation();

  const steps = [
    {
      status: "active",
      title: "Nano is connected",
      renderBody: () => (
        <Text>
          {`Continue setup on Nano This screen will change dynamically to provide you with relevant information while you set up Nano`}
        </Text>
      ),
    },
    {
      status: "inactive",
      title: "Set your PIN",
      renderBody: () => (
        <Text>
          {`Your PIN can be 4 to 8 digits long. Anyone with access to your Nano and to your PIN can also access all your crypto and NFT assets.`}
        </Text>
      ),
      estimatedTime: 120,
    },
    {
      status: "inactive",
      title: "Recovery phrase",
      renderBody: () => (
        <Text>{`Tap on the videos below to learn more about your secret recovery phrase`}</Text>
      ),
      estimatedTime: 300,
    },
    {
      status: "inactive",
      title: "Software check",
      renderBody: () => (
        <Text>{`We'll verify whether your Nano is genuine. This should be quick and easy!`}</Text>
      ),
    },
    {
      status: "inactive",
      title: "Nano applications",
      renderBody: () => <Text>{`Nano uses apps to enable secure blockchain transactions`}</Text>,
    },
    {
      status: "inactive",
      title: "Nano is ready",
    },
  ];

  return (
    <Flex bg="background.main" width="100%" height="100%" flexDirection="column">
      <Flex width="100%" justifyContent="flex-end" mt={4} px={4}>
        <LangSwitcher />
        <Button ml={4} Icon={CloseMedium} />
      </Flex>
      <Flex flex={1} px={8} py={4}>
        <Flex flex={1} flexDirection="column" justifyContent="center">
          <Text variant="h1" fontSize="24px" mb="50px">
            Setup your Nano
          </Text>
          <VerticalTimeline steps={steps as any} />
        </Flex>
        <Flex flex={1} justifyContent="center" alignItems="center">
          <Illustration
            style={{
              height: 540,
              width: 240,
              backgroundSize: "contain",
            }}
            lightSource={nanoX}
            darkSource={nanoXDark}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default SyncOnboardingManual;
