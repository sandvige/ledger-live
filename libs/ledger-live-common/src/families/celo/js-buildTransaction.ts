import { BigNumber } from "bignumber.js";
import { CeloTx } from "@celo/connect";
import type { Account } from "@ledgerhq/types-live";
import type { Transaction } from "./types";
import { celoKit } from "./api/sdk";
import { getVote } from "./logic";

const buildTransaction = async (account: Account, transaction: Transaction) => {
  const kit = celoKit();

  const value = transactionValue(account, transaction);

  let celoTransaction: CeloTx;

  if (transaction.mode === "lock") {
    const lockedGold = await kit.contracts.getLockedGold();
    celoTransaction = {
      from: account.freshAddress,
      value: value.toFixed(),
      to: lockedGold.address,
      data: lockedGold.lock().txo.encodeABI(),
      gas: await lockedGold.lock().txo.estimateGas({
        from: account.freshAddress,
        value: value.toFixed(),
      }),
    };
  } else if (transaction.mode === "unlock") {
    const lockedGold = await kit.contracts.getLockedGold();
    celoTransaction = {
      from: account.freshAddress,
      to: lockedGold.address,
      data: lockedGold.unlock(value).txo.encodeABI(),
      gas: await lockedGold.unlock(value).txo.estimateGas({
        from: account.freshAddress,
      }),
    };
  } else if (transaction.mode === "withdraw") {
    const lockedGold = await kit.contracts.getLockedGold();

    celoTransaction = {
      from: account.freshAddress,
      to: lockedGold.address,
      data: lockedGold.withdraw(transaction.index || 0).txo.encodeABI(),
      gas: await lockedGold.withdraw(transaction.index || 0).txo.estimateGas({
        from: account.freshAddress,
        value: value.toFixed(),
      }),
    };
  } else if (transaction.mode === "vote") {
    const election = await kit.contracts.getElection();
    const vote = await election.vote(
      transaction.recipient,
      new BigNumber(value)
    );

    celoTransaction = {
      from: account.freshAddress,
      to: election.address,
      data: vote.txo.encodeABI(),
      gas: await vote.txo.estimateGas({ from: account.freshAddress }),
    };
  } else if (transaction.mode === "revoke") {
    const election = await kit.contracts.getElection();
    const accounts = await kit.contracts.getAccounts();
    const voteSignerAccount = await accounts.voteSignerToAccount(
      account.freshAddress
    );

    const revokes = await election.revoke(
      voteSignerAccount,
      transaction.recipient,
      new BigNumber(value)
    );

    const revoke = revokes.find((transactionObject) => {
      return (
        (transactionObject.txo as any)._method.name ===
        (transaction.index === 0 ? "revokePending" : "revokeActive")
      );
    });
    if (!revoke) throw new Error("No votes to revoke");

    celoTransaction = {
      from: account.freshAddress,
      to: election.address,
      data: revoke.txo.encodeABI(),
      gas: await revoke.txo.estimateGas({ from: account.freshAddress }),
    };
  } else if (transaction.mode === "activate") {
    const election = await kit.contracts.getElection();
    const accounts = await kit.contracts.getAccounts();
    const voteSignerAccount = await accounts.voteSignerToAccount(
      account.freshAddress
    );

    const activates = await election.activate(voteSignerAccount);
    const activate = activates.find(
      (a) => a.txo.arguments[0] === transaction.recipient
    );
    if (!activate) throw new Error("No votes to activate");

    celoTransaction = {
      from: account.freshAddress,
      to: election.address,
      data: activate.txo.encodeABI(),
      gas: await activate.txo.estimateGas({
        from: account.freshAddress,
      }),
    };
  } else if (transaction.mode === "register") {
    const accounts = await kit.contracts.getAccounts();
    celoTransaction = {
      from: account.freshAddress,
      to: accounts.address,
      data: accounts.createAccount().txo.encodeABI(),
      gas: await accounts
        .createAccount()
        .txo.estimateGas({ from: account.freshAddress }),
    };
  } else {
    // Send
    const celoToken = await kit.contracts.getGoldToken();
    celoTransaction = {
      from: account.freshAddress,
      to: celoToken.address,
      data: celoToken
        .transfer(transaction.recipient, value.toFixed())
        .txo.encodeABI(),
    };

    const gas = await kit.connection.estimateGasWithInflationFactor(
      celoTransaction
    );

    celoTransaction = {
      ...celoTransaction,
      gas,
    };
  }
  const tx: CeloTx = {
    ...celoTransaction,
    chainId: await kit.connection.chainId(),
    nonce: await kit.connection.nonce(account.freshAddress),
    gasPrice: await kit.connection.gasPrice(),
  };

  return tx;
};

const transactionValue = (
  account: Account,
  transaction: Transaction
): BigNumber => {
  let value = transaction.amount;

  if (transaction.useAllAmount) {
    if (
      (transaction.mode === "unlock" || transaction.mode === "vote") &&
      account.celoResources
    ) {
      value = account.celoResources.nonvotingLockedBalance;
    } else if (transaction.mode === "revoke" && account.celoResources) {
      const revoke = getVote(account, transaction.recipient, transaction.index);
      if (revoke?.amount) value = revoke.amount;
    } else {
      value = account.spendableBalance.minus(transaction.fees || 0);
    }
  }

  return value;
};

export default buildTransaction;
