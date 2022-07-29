import { Dispatch } from "redux";
import { TFunction } from "react-i18next";

import { UserRefusedOnDevice } from "@ledgerhq/errors";
import { Account, AccountLike, Operation, SignedOperation } from "@ledgerhq/types-live";
import {
  addPendingOperation,
  getMainAccount,
  isAccount,
  isTokenAccount,
} from "@ledgerhq/live-common/account/index";
import { getAccountBridge } from "@ledgerhq/live-common/bridge/index";
import { getEnv } from "@ledgerhq/live-common/lib/env";
import { Transaction } from "@ledgerhq/live-common/generated/types";
import {
  accountToPlatformAccount,
  getPlatformTransactionSignFlowInfos,
} from "@ledgerhq/live-common/platform/converters";
import {
  serializePlatformAccount,
  deserializePlatformTransaction,
  serializePlatformSignedTransaction,
  deserializePlatformSignedTransaction,
} from "@ledgerhq/live-common/platform/serializers";
import { AppManifest } from "@ledgerhq/live-common/platform/types";
import {
  receiveOnAccountCommonLogic,
  signTransactionCommonLogic,
  completeExchangeCommonLogic,
  CompleteExchangeUiRequest,
} from "@ledgerhq/live-common/platform/logic";
import {
  RawPlatformTransaction,
  RawPlatformSignedTransaction,
} from "@ledgerhq/live-common/platform/rawTypes";
import { ToastData } from "@ledgerhq/live-common/notifications/ToastProvider/types";

import { updateAccountWithUpdater } from "../../actions/accounts";
import { openModal } from "../../actions/modals";
import { selectAccountAndCurrency } from "../../drawers/DataSelector/logic";

import * as tracking from "./tracking";
import { MessageData } from "@ledgerhq/live-common/hw/signMessage/types";
import { prepareMessageToSign } from "@ledgerhq/live-common/hw/signMessage/index";

type WebPlatformContext = {
  manifest: AppManifest;
  dispatch: Dispatch;
  accounts: AccountLike[];
};

function getParentAccount(account: AccountLike, fromAccounts: AccountLike[]): Account | null {
  return isTokenAccount(account)
    ? (fromAccounts.find(a => a.id === account.parentId) as Account)
    : null;
}

export const receiveOnAccountLogic = (
  { manifest, dispatch, accounts }: WebPlatformContext,
  accountId: string,
): Promise<string> =>
  receiveOnAccountCommonLogic(
    { manifest, accounts, tracking },
    accountId,
    (account: AccountLike, parentAccount: Account | null) => {
      // FIXME: handle address rejection (if user reject address, we don't end up in onResult nor in onCancel 🤔)
      return new Promise((resolve, reject) =>
        dispatch(
          openModal("MODAL_EXCHANGE_CRYPTO_DEVICE", {
            account,
            parentAccount,
            onResult: (account: Account, parentAccount: Account) => {
              tracking.platformReceiveSuccess(manifest);
              resolve(accountToPlatformAccount(account, parentAccount).address);
            },
            onCancel: (error: Error) => {
              tracking.platformReceiveFail(manifest);
              reject(error);
            },
            verifyAddress: true,
          }),
        ),
      );
    },
  );

export type RequestAccountParams = {
  currencies?: string[];
  allowAddAccount?: boolean;
  includeTokens?: boolean;
};
export const requestAccountLogic = async (
  { manifest }: Omit<WebPlatformContext, "accounts" | "dispatch">,
  { currencies, includeTokens }: RequestAccountParams,
) => {
  tracking.platformRequestAccountRequested(manifest);
  const { account, parentAccount } = await selectAccountAndCurrency(currencies, includeTokens);

  return serializePlatformAccount(accountToPlatformAccount(account, parentAccount));
};

export const signTransactionLogic = (
  { manifest, dispatch, accounts }: WebPlatformContext,
  accountId: string,
  transaction: RawPlatformTransaction,
  params: any,
) =>
  signTransactionCommonLogic(
    { manifest, accounts, tracking },
    accountId,
    transaction,
    params,
    (
      account: AccountLike,
      parentAccount: Account | null,
      {
        canEditFees,
        hasFeesProvided,
        liveTx,
      }: {
        canEditFees: boolean;
        hasFeesProvided: boolean;
        liveTx: Partial<Transaction>;
      },
    ) => {
      return new Promise((resolve, reject) =>
        dispatch(
          openModal("MODAL_SIGN_TRANSACTION", {
            canEditFees,
            stepId: canEditFees && !hasFeesProvided ? "amount" : "summary",
            transactionData: liveTx,
            useApp: params.useApp,
            account,
            parentAccount,
            onResult: (signedOperation: SignedOperation) => {
              tracking.platformSignTransactionSuccess(manifest);
              resolve(serializePlatformSignedTransaction(signedOperation));
            },
            onCancel: (error: Error) => {
              tracking.platformSignTransactionFail(manifest);
              reject(error);
            },
          }),
        ),
      );
    }
  );

export const broadcastTransactionLogic = async (
  { manifest, dispatch, accounts }: WebPlatformContext,
  accountId: string,
  signedTransaction: RawPlatformSignedTransaction,
  pushToast: (data: ToastData) => void,
  t: TFunction,
) => {
  const account = accounts.find(account => account.id === accountId);
  if (!account) {
    tracking.platformBroadcastFail(manifest);
    return Promise.reject(new Error("Account required"));
  }

  if (!signedTransaction) {
    tracking.platformBroadcastFail(manifest);
    return Promise.reject(new Error("Transaction required"));
  }

  const parentAccount = getParentAccount(account, accounts);

  const signedOperation = deserializePlatformSignedTransaction(signedTransaction, accountId);
  const bridge = getAccountBridge(account, parentAccount);
  const mainAccount = getMainAccount(account, parentAccount);

  let optimisticOperation: Operation = signedOperation.operation;

  // FIXME: couldn't we use `useBroadcast` here?
  if (!getEnv("DISABLE_TRANSACTION_BROADCAST")) {
    try {
      optimisticOperation = await bridge.broadcast({
        account: mainAccount,
        signedOperation,
      });
      tracking.platformBroadcastSuccess(manifest);
    } catch (error) {
      tracking.platformBroadcastFail(manifest);
      throw error;
    }
  }

  dispatch(
    updateAccountWithUpdater(mainAccount.id, account =>
      addPendingOperation(account, optimisticOperation),
    ),
  );

  pushToast({
    id: optimisticOperation.id,
    type: "operation",
    title: t("platform.flows.broadcast.toast.title"),
    text: t("platform.flows.broadcast.toast.text"),
    icon: "info",
    callback: () => {
      tracking.platformBroadcastOperationDetailsClick(manifest);
      dispatch(
        openModal("MODAL_OPERATION_DETAILS", {
          operationId: optimisticOperation.id,
          accountId: account.id,
          parentId: null,
        }),
      );
    },
  });

  return optimisticOperation.hash;
};

export const startExchangeLogic = (
  { manifest, dispatch }: Omit<WebPlatformContext, "accounts">,
  exchangeType: number,
) => {
  tracking.platformStartExchangeRequested(manifest);

  return new Promise((resolve, reject) =>
    dispatch(
      openModal("MODAL_PLATFORM_EXCHANGE_START", {
        exchangeType,
        onResult: (nonce: string) => {
          tracking.platformStartExchangeSuccess(manifest);
          resolve(nonce);
        },
        onCancel: (error: Error) => {
          tracking.platformStartExchangeFail(manifest);
          reject(error);
        },
      }),
    ),
  );
};

export type CompleteExchangeRequest = {
  provider: string;
  fromAccountId: string;
  toAccountId: string;
  transaction: RawPlatformTransaction;
  binaryPayload: string;
  signature: string;
  feesStrategy: string;
  exchangeType: number;
};
export const completeExchangeLogic = (
  { manifest, dispatch, accounts }: WebPlatformContext,
  request: CompleteExchangeRequest,
) =>
  completeExchangeCommonLogic(
    { manifest, accounts, tracking },
    request,
    ({
      provider,
      fromAccount,
      fromParentAccount,
      toAccount,
      toParentAccount,
      transaction,
      binaryPayload,
      signature,
      feesStrategy,
      exchangeType,
    }: CompleteExchangeUiRequest): Promise<Operation> =>
      new Promise((resolve, reject) =>
        dispatch(
          openModal("MODAL_PLATFORM_EXCHANGE_COMPLETE", {
            provider,
            exchange: {
              fromAccount,
              fromParentAccount,
              toAccount,
              toParentAccount,
            },
            transaction,
            binaryPayload,
            signature,
            feesStrategy,
            exchangeType,
            onResult: (operation: Operation) => {
              tracking.platformCompleteExchangeSuccess(manifest);
              resolve(operation);
            },
            onCancel: (error: Error) => {
              tracking.platformCompleteExchangeFail(manifest);
              reject(error);
            },
          }),
        ),
      ),
  );

export const signMessageLogic = (
  { manifest, dispatch, accounts }: WebPlatformContext,
  accountId: string,
  message: string,
) => {
  tracking.platformSignMessageRequested(manifest);

  const account = accounts.find(account => account.id === accountId);
  if (account === undefined) {
    return Promise.reject(new Error("account not found"));
  }

  let formattedMessage: MessageData | null;
  try {
    if (isAccount(account)) {
      formattedMessage = prepareMessageToSign(account, message);
    } else {
      throw new Error("account provided should be the main one");
    }
  } catch (error) {
    tracking.platformSignMessageFail(manifest);
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    dispatch(
      openModal("MODAL_SIGN_MESSAGE", {
        message: formattedMessage,
        account,
        onConfirmationHandler: (signature: string) => {
          tracking.platformSignMessageSuccess(manifest);
          resolve(signature);
        },
        onFailHandler: (err: Error) => {
          tracking.platformSignMessageFail(manifest);
          reject(err);
        },
        onClose: () => {
          tracking.platformSignMessageUserRefused(manifest);
          reject(UserRefusedOnDevice());
        },
      }),
    );
  });
};
