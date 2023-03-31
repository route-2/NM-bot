import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
} from "forta-agent";
import { createAddress } from "forta-agent-tools";
import { provideHandleTransaction } from "./agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { Interface } from "@ethersproject/abi";
import ethers from "ethers";

var utils = require("ethers").utils;

import {
  NETHERMIND_DEPLOYER_ADDRESS,
  CREATE_AGENT,
  FORTA_CONTRACT_ADDRESS,
} from "./utils";
const TEST_DATA_1 = {
  agentId: utils.bigNumberify.from("444"),
  owner: createAddress("0x4"),
  chainIds: [utils.bigNumberify.from("333")],
  metadata: "abcdefghi",
};
const TEST_DATA_2 = {
  agentId: utils.bigNumberify.from("4444"),
  owner: createAddress("0x44"),
  chainIds: [utils.bigNumberify.from("3333")],
  metadata: "jklmnopqr",
};

const TEST_DEPLOYER_ADDRESS = createAddress("0x123");
const TEST_FORTA_ADDRESS = createAddress("0x456");

describe("Nethermind Agent", () => {
  let handleTransaction: HandleTransaction;
  let fortaProxy = new Interface([CREATE_AGENT]);

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(
      CREATE_AGENT,
      TEST_DEPLOYER_ADDRESS,
      TEST_FORTA_ADDRESS
    );
  });

  it("returns empty findings if no transactions", async () => {
    const txEvent = new TestTransactionEvent();
    const findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if it's a different deployer", async () => {
    const TEST_DEPLOYER = createAddress("0x1");
    const txEvent = new TestTransactionEvent()
      .setFrom(TEST_DEPLOYER)
      .setTo(FORTA_CONTRACT_ADDRESS)
      .addTraces({
        function: "" || fortaProxy.getFunction("createAgent") || undefined,
        to: FORTA_CONTRACT_ADDRESS,
        from: TEST_DEPLOYER,

        arguments: [
          TEST_DATA_1.agentId,
          TEST_DEPLOYER,
          TEST_DATA_1.metadata,
          [utils.bigNumberify.from(TEST_DATA_1.chainIds[0])],
        ],
      });

    const findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns  findings if there are bot deployments", async () => {
    const txEvent = new TestTransactionEvent()
      .setFrom(TEST_DEPLOYER_ADDRESS)
      .setTo(TEST_FORTA_ADDRESS)
      .addTraces({
        function: "" || fortaProxy.getFunction("createAgent") || undefined,
        to: TEST_FORTA_ADDRESS,

        arguments: [
          TEST_DATA_1.agentId,
          TEST_DATA_1.owner,
          TEST_DATA_1.metadata,
          [utils.bigNumberify.from(TEST_DATA_1.chainIds[0])],
        ],
      });
    const findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "New Nethermind Bot Created on Forta",
        description: `New bot Created with ID: ${TEST_DATA_1.agentId} and owner: ${TEST_DATA_1.owner} and metadata: ${TEST_DATA_1.metadata} and chainIds: ${TEST_DATA_1.chainIds}`,
        alertId: "FORTA-1",
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          agentId: TEST_DATA_1.agentId.toString(),
          owner: TEST_DATA_1.owner,
          chainIds: TEST_DATA_1.chainIds.toString(),
          metadata: TEST_DATA_1.metadata,
        },
      }),
    ]);
  });
});
