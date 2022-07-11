import React, { useMemo, useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { BigNumber } from "bignumber.js";
import { Flex, Text, Icon } from "@ledgerhq/native-ui";
import { getProviderName } from "@ledgerhq/live-common/lib/exchange/swap/utils";
import { getAccountUnit } from "@ledgerhq/live-common/lib/account";
import { useTranslation } from "react-i18next";
import { ExchangeRate } from "@ledgerhq/live-common/lib/exchange/swap/types";
import { Unit } from "@ledgerhq/live-common/lib/types";
import CurrencyUnitValue from "../../../components/CurrencyUnitValue";
// eslint-disable-next-line import/no-unresolved, import/named
import { providerIcons } from "../../../icons/swap";
import { SelectProviderProps } from "../types";
import CounterValue from "../../../components/CounterValue";

export function SelectProvider({
  navigation,
  route: {
    params: {
      swap: { from, to, rates },
      selectedId,
    },
  },
}: SelectProviderProps) {
  const { t } = useTranslation();
  const fromUnit = useMemo(() => from.account && getAccountUnit(from.account), [
    from.account,
  ]);

  const onSelect = useCallback(
    (rate: ExchangeRate) => {
      // @ts-expect-error
      navigation.navigate("Swap", { screen: "SwapForm", params: { rate } });
    },
    [navigation],
  );

  if (!rates.value || !fromUnit || !to.currency) {
    return null;
  }

  return (
    <Flex paddingX={4}>
      <Flex flexDirection="row" justifyContent="space-between" paddingY={2}>
        <Text margin={4} color="neutral.c70">
          {t("transfer.swap2.form.ratesDrawer.quote")}
        </Text>

        <Text padding={4} color="neutral.c70">
          {t("transfer.swap2.form.ratesDrawer.receive")}
        </Text>
      </Flex>

      <Flex>
        {rates.value.map(rate => {
          const ProviderIcon = providerIcons[rate.provider.toLowerCase()];
          const isSelected = selectedId === rate.rateId;

          return (
            <TouchableOpacity
              key={rate.rateId}
              onPress={() => onSelect(rate)}
              disabled={isSelected}
            >
              <Flex
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                padding={4}
                marginY={2}
                borderRadius={4}
                border={1}
                borderColor={isSelected ? "primary.c70" : "neutral.c30"}
              >
                <Flex flexDirection="row" alignItems="center">
                  <ProviderIcon size={24} />
                  <Flex marginLeft={4}>
                    <Text variant="large" paddingBottom={2}>
                      {getProviderName(rate.provider)}
                    </Text>

                    <Flex flexDirection="row" alignItems="center">
                      <Icon
                        name={rate.tradeMethod === "fixed" ? "Lock" : "Unlock"}
                        color="neutral.c70"
                      />
                      <Text variant="tiny" color="neutral.c70" marginLeft={1}>
                        <CurrencyUnitValue
                          value={new BigNumber(10).pow(fromUnit.magnitude)}
                          unit={fromUnit}
                          showCode
                        />

                        {" = "}

                        <CurrencyUnitValue
                          // @ts-expect-error
                          unit={to.currency.units[0]}
                          value={new BigNumber(10)
                            .pow(fromUnit.magnitude)
                            .times(rate.magnitudeAwareRate)}
                          showCode
                        />
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>

                <Flex alignItems="flex-end">
                  <Text variant="large" paddingBottom={2}>
                    <CurrencyUnitValue
                      value={rate.toAmount}
                      unit={to.currency?.units[0] as Unit}
                      showCode
                    />
                  </Text>

                  <Text variant="tiny" color="neutral.c70">
                    <CounterValue
                      inline
                      // @ts-expect-error
                      currency={to.currency}
                      value={rate.toAmount}
                      disableRounding
                      showCode
                      color="palette.text.shade40"
                    />
                  </Text>
                </Flex>
              </Flex>
            </TouchableOpacity>
          );
        })}
      </Flex>
    </Flex>
  );
}