import { Flex, Icons, Text, Button } from "@ledgerhq/native-ui";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Language, DeviceInfo } from "@ledgerhq/types-live";
import BottomModal from "../../../components/BottomModal";
import DeviceLanguageSelection from "./DeviceLanguageSelection";
import ChangeDeviceLanguageAction from "../../../components/ChangeDeviceLanguageAction";
import { useAvailableLanguagesForDevice } from "@ledgerhq/live-common/lib/manager/hooks";
import { Device } from "@ledgerhq/live-common/lib/hw/actions/types";

type Props = {
  pendingInstalls: boolean;
  currentDeviceLanguage: Language;
  device: Device;
  deviceInfo: DeviceInfo;
  onLanguageChange: () => void;
};

const DeviceLanguage: React.FC<Props> = ({
  pendingInstalls,
  currentDeviceLanguage,
  device,
  deviceInfo,
  onLanguageChange,
}) => {
  const { t } = useTranslation();

  const [isChangeLanguageOpen, setIsChangeLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    currentDeviceLanguage,
  );

  const { availableLanguages } = useAvailableLanguagesForDevice(deviceInfo);

  const [shouldInstallLanguage, setShouldInstallLanguage] = useState<boolean>(
    false,
  );
  const [
    deviceForActionModal,
    setDeviceForActionModal,
  ] = useState<Device | null>(null);

  const closeChangeLanguageModal = useCallback(
    () => setIsChangeLanguageOpen(false),
    [setIsChangeLanguageOpen],
  );
  const openChangeLanguageModal = useCallback(
    () => setIsChangeLanguageOpen(true),
    [setIsChangeLanguageOpen],
  );

  const confirmInstall = useCallback(() => {
    setShouldInstallLanguage(true);
    closeChangeLanguageModal();
  }, [setShouldInstallLanguage, closeChangeLanguageModal]);
  // this has to be done in two steps because we can only open the second modal after the first
  // one has been hidden. So we need to put this function attached to the onModalHide prop of the first
  // see https://github.com/react-native-modal/react-native-modal/issues/30
  const openDeviceActionModal = useCallback(() => {
    if (shouldInstallLanguage) {
      setDeviceForActionModal(device);
    }
  }, [shouldInstallLanguage, device, setDeviceForActionModal]);

  const closeDeviceActionModal = useCallback(() => {
    setShouldInstallLanguage(false);
    setDeviceForActionModal(null);
  }, [setShouldInstallLanguage, setDeviceForActionModal]);

  const refreshDeviceLanguage = useCallback(() => {
    onLanguageChange();
  }, [selectedLanguage]);

  return (
    <>
      <Flex
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Flex flexDirection="row">
          <Icons.LanguageMedium size={24} color="neutral.c80" />
          <Text ml={2} color="neutral.c80">
            {t("deviceLocalization.language")}
          </Text>
        </Flex>
        {availableLanguages.length ? (
          <Button
            disabled={pendingInstalls}
            Icon={Icons.DropdownMedium}
            onPress={openChangeLanguageModal}
          >
            {t(`deviceLocalization.languages.${currentDeviceLanguage}`)}
          </Button>
        ) : (
          <Text>
            {t(`deviceLocalization.languages.${currentDeviceLanguage}`)}
          </Text>
        )}
      </Flex>
      <BottomModal
        isOpened={isChangeLanguageOpen}
        onClose={closeChangeLanguageModal}
        onModalHide={openDeviceActionModal}
      >
        <DeviceLanguageSelection
          deviceLanguage={currentDeviceLanguage}
          onSelectLanguage={setSelectedLanguage}
          selectedLanguage={selectedLanguage}
          onConfirmInstall={confirmInstall}
          availableLanguages={availableLanguages}
        />
      </BottomModal>
      <ChangeDeviceLanguageAction
        onClose={closeDeviceActionModal}
        device={deviceForActionModal}
        language={selectedLanguage}
        onResult={refreshDeviceLanguage}
      />
    </>
  );
};

export default DeviceLanguage;
