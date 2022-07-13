import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Flex, Text } from "@ledgerhq/native-ui";
import {
  getAccountCurrency,
  getAccountName,
} from "@ledgerhq/live-common/lib/account";
import {
  ExchangeRate,
  Pair,
  SwapTransactionType,
} from "@ledgerhq/live-common/lib/exchange/swap/types";
import { useNavigation } from "@react-navigation/native";
import {
  usePickDefaultCurrency,
  useSelectableCurrencies,
} from "@ledgerhq/live-common/lib/exchange/swap/hooks";
import { CryptoCurrency, TokenCurrency } from "@ledgerhq/live-common/lib/types";
import { Selector } from "./Selector";
import { CurrencyValue } from "./CurrencyValue";

interface Props {
  swapTx: SwapTransactionType;
  provider?: string;
  exchangeRate?: ExchangeRate;
  pairs: Pair[];
}

export function To({ swapTx, provider, pairs }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const fromCurrency = useMemo(
    () =>
      swapTx.swap.from.account && getAccountCurrency(swapTx.swap.from.account),
    [swapTx.swap.from],
  );

  const currencies = useCurrencies(pairs, fromCurrency?.id);

  const { name, balance, amount } = useMemo(() => {
    const { currency, account, amount } = swapTx.swap.to;

    return {
      name: (account && getAccountName(account)) || currency?.name,
      balance: currency?.units[0].code ?? "",
      amount,
    };
  }, [swapTx.swap.to]);

  usePickDefaultCurrency(
    currencies,
    swapTx.swap.to.currency,
    swapTx.setToCurrency,
  );

  const onPress = useCallback(() => {
    navigation.navigate("SelectCurrency", { currencies, provider });
  }, [navigation, currencies, provider]);

  return (
    <Flex>
      <Text>{t("transfer.swap2.form.to")}</Text>
      <Flex flexDirection="row" justifyContent="space-between">
        <Selector
          currency={swapTx.swap.to.currency}
          title={name}
          subTitle={balance || "-"}
          onPress={onPress}
          disabled={!swapTx.swap.to.currency}
        />

        <Flex flex={1} justifyContent="center">
          <CurrencyValue currency={swapTx.swap.to.currency} amount={amount} />
        </Flex>
      </Flex>
    </Flex>
  );
}

// based toSelector on apps/ledger-live-desktop/src/renderer/actions/swap.js
function useCurrencies(
  pairs: Pair[],
  fromCurrencyId?: string,
): (CryptoCurrency | TokenCurrency)[] {
  const filtered = useMemo(() => {
    if (!pairs) return [];

    if (fromCurrencyId)
      return pairs.reduce<string[]>(
        (acc, pair) => (pair.from === fromCurrencyId ? [...acc, pair.to] : acc),
        [],
      );

    return pairs.map(p => p.to);
  }, [pairs, fromCurrencyId]);

  return useSelectableCurrencies({ allCurrencies: [...new Set(filtered)] });
}