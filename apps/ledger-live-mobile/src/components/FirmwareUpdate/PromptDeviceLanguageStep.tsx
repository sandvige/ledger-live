import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { Flex } from "@ledgerhq/native-ui";
import { getDeviceModel } from "@ledgerhq/devices";
import {
  DeviceInfo,
  idsToLanguage,
  Language,
  languageIds,
} from "@ledgerhq/types-live";
import { Device } from "@ledgerhq/live-common/hw/actions/types";
import { useAvailableLanguagesForDevice } from "@ledgerhq/live-common/lib/manager/hooks";

import Track from "../../analytics/Track";
import { FwUpdateForegroundEvent } from ".";
import { useLocale } from "../../context/Locale";
import { localeIdToDeviceLanguage } from "../../languages";

import ChangeDeviceLanguageAction from "../ChangeDeviceLanguageAction";
import ChangeDeviceLanguagePrompt from "../ChangeDeviceLanguagePrompt";
import DeviceActionProgress from "../DeviceActionProgress";

type Props = {
  oldDeviceInfo?: DeviceInfo;
  updatedDeviceInfo?: DeviceInfo;
  device: Device;
  dispatchEvent: React.Dispatch<FwUpdateForegroundEvent>;
};
const PropmtDeviceLanguageStep = ({
  oldDeviceInfo,
  updatedDeviceInfo,
  dispatchEvent,
  device,
}: Props) => {
  const { locale: currentLocale } = useLocale();

  let {
    availableLanguages: newAvailableLanguages,
    loaded: newLanguagesLoaded,
  } = useAvailableLanguagesForDevice(updatedDeviceInfo);
  let {
    availableLanguages: oldAvailableLanguages,
    loaded: oldLanguagesLoaded,
  } = useAvailableLanguagesForDevice(oldDeviceInfo);

  const [isLanguagePromptOpen, setIsLanguagePromptOpen] = useState<boolean>(
    false,
  );

  const [languageToInstall, setLanguageToInstall] = useState<Language>(
    "english",
  );
  const [deviceForAction, setDeviceForAction] = useState<Device | null>(null);

  const { t } = useTranslation();

  const deviceLocalizationFeatureFlag = { enabled: true }; // useFeature("deviceLocalization");

  const installLanguage = useCallback(
    (language: Language) => {
      console.log("install language:", language);
      setLanguageToInstall(language);
      setDeviceForAction(device);
    },
    [device],
  );

  useEffect(() => {
    if (true) {
      const deviceLanguageId = updatedDeviceInfo?.languageId;
      const potentialDeviceLanguage = localeIdToDeviceLanguage[currentLocale];

      const langAvailableForTheFirstTime =
        potentialDeviceLanguage !== undefined &&
        !oldAvailableLanguages.includes(potentialDeviceLanguage) &&
        newAvailableLanguages.includes(potentialDeviceLanguage);

      // firmware version verification is not really needed here, the presence of a language id
      // indicates that we are in a firmware that supports localization

      console.log("FROOM THE USE EFFECT", {
        langAvailableForTheFirstTime,
        deviceLanguageId,
        potentialDeviceLanguage,
        deviceLanguageText: idsToLanguage[deviceLanguageId as number],
        deviceLocalizationFeatureFlag,
        oldDeviceInfo,
        englishId: languageIds["english"],
        firstCondition:
          langAvailableForTheFirstTime &&
          deviceLanguageId !== undefined &&
          idsToLanguage[deviceLanguageId] !== potentialDeviceLanguage &&
          deviceLocalizationFeatureFlag.enabled,
        secondCondition:
          oldDeviceInfo?.languageId !== undefined &&
          oldDeviceInfo?.languageId !== languageIds["english"],
      });

      if (
        false
        // langAvailableForTheFirstTime &&
        // deviceLanguageId !== undefined &&
        // idsToLanguage[deviceLanguageId] !== potentialDeviceLanguage &&
        // deviceLocalizationFeatureFlag.enabled
      ) {
        setIsLanguagePromptOpen(true);
      } else if (
        true
        // oldDeviceInfo?.languageId !== undefined &&
        // oldDeviceInfo?.languageId !== languageIds["english"]
      ) {
        installLanguage("french");
      } else {
        dispatchEvent({ type: "languagePromptDismissed" });
      }
    }
  }, [
    newAvailableLanguages,
    newLanguagesLoaded,
    oldAvailableLanguages,
    oldLanguagesLoaded,
    dispatchEvent,
    currentLocale,
    oldDeviceInfo,
    updatedDeviceInfo,
    installLanguage,
  ]);

  // TODO: remove console log
  console.log("RENDER", {
    newAvailableLanguages,
    newLanguagesLoaded,
    oldAvailableLanguages,
    oldLanguagesLoaded,
    dispatchEvent,
    currentLocale,
    oldDeviceInfo,
    updatedDeviceInfo,
    installLanguage,
    deviceForAction,
    languageToInstall
  });

  const deviceName = getDeviceModel(device.modelId).productName;

  return (
    <Flex alignItems="center">
      {isLanguagePromptOpen && (
        <>
          <Track event="FirmwareUpdateFirstDeviceLanguagePrompt" onMount />
          <ChangeDeviceLanguagePrompt
            titleWording={t("deviceLocalization.firmwareUpdatePrompt.title", {
              language: t(
                `deviceLocalization.languages.${localeIdToDeviceLanguage[currentLocale]}`,
              ),
              deviceName,
            })}
            descriptionWording={t(
              "deviceLocalization.firmwareUpdatePrompt.description",
              {
                language: t(
                  `deviceLocalization.languages.${localeIdToDeviceLanguage[currentLocale]}`,
                ),
                deviceName,
              },
            )}
            canSkip
            onSkip={() => dispatchEvent({ type: "languagePromptDismissed" })}
            onConfirm={() =>
              installLanguage(
                localeIdToDeviceLanguage[currentLocale] as Language,
              )
            }
          />
        </>
      )}
      {deviceForAction !== null ? (
        <ChangeDeviceLanguageAction
          device={deviceForAction}
          language={languageToInstall}
          onClose={() => {
            console.log("FIIIM DA DEVICE ACTION")
            setDeviceForAction(null);
            dispatchEvent({ type: "languagePromptDismissed" });
          }}
        />
      ) : (
        !isLanguagePromptOpen && <DeviceActionProgress />
      )}
    </Flex>
  );
};

export default PropmtDeviceLanguageStep;
