import React, { useState, useCallback } from "react";
import { Button, Flex, Icons } from "@ledgerhq/react-ui";
import Text from "~/renderer/components/Text";
import DeviceLanguageInstallation from "./DeviceLanguageInstallation";
import { DeviceInfo } from "@ledgerhq/live-common/types/manager";
import { Device } from "@ledgerhq/live-common/hw/actions/types";
import { idsToLanguage, Language } from "@ledgerhq/live-common/types/languages";
import { useTranslation } from "react-i18next";
import { withV3StyleProvider } from "~/renderer/styles/StyleProviderV3";

type Props = {
  deviceInfo: DeviceInfo;
  device: Device;
};

const DeviceLanguage: React.FC<Props> = ({ deviceInfo, device }: Props) => {
  if (deviceInfo.languageId === undefined) return null;

  const [isLanguageInstallationOpen, setIsLanguageInstallation] = useState(false);
  const [deviceLanguage, setDeviceLanguage] = useState<Language>(
    idsToLanguage[deviceInfo.languageId],
  );
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(deviceLanguage);

  const refreshDeviceLanguage = useCallback(() => {
    setDeviceLanguage(selectedLanguage);
  }, [setDeviceLanguage, selectedLanguage]);

  const { t } = useTranslation();

  return (
    <Flex alignItems="center">
      <Icons.LanguageMedium color="neutral.c80" size={24} />
      <Flex ml={1}>
        <Text ff="Inter|SemiBold" color="palette.text.shade40" fontSize={4}>
          Language
        </Text>
      </Flex>
      <Button
        Icon={Icons.ChevronRightMedium}
        onClick={() => setIsLanguageInstallation(true)}
        data-test-id="manager-change-language-button"
      >
        {t(`deviceLocalization.languages.${deviceLanguage}`)}
      </Button>
      <DeviceLanguageInstallation
        isOpen={isLanguageInstallationOpen}
        onClose={() => setIsLanguageInstallation(false)}
        deviceInfo={deviceInfo}
        device={device}
        onSelectLanguage={setSelectedLanguage}
        selectedLanguage={selectedLanguage}
        currentLanguage={deviceLanguage}
        onSuccess={refreshDeviceLanguage}
      />
    </Flex>
  );
};

export default withV3StyleProvider(DeviceLanguage);