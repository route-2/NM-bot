import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
} from "forta-agent";
import { createAddress } from "forta-agent-tools";
import { provideHandleTx } from "./agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { Interface } from "ethers";
import ethers from "ethers";
import { BigNumber } from "ethers";


import { NETHERMIND_DEPLOYER_ADDRESS,CREATE_AGENT,FORTA_CONTRACT_ADDRESS } from "./utils";
const number = BigNumber;
const TEST_DATA_1 = {
  agentId:BigNumber.from("444"),
            owner:createAddress("0x4"),
            chainIds: [BigNumber.from("333")],
            metadata:"abcdefghi",
}
const TEST_DATA_2 = {
  agentId:BigNumber.from("4444"),
            owner:createAddress("0x44"),
            chainIds: [BigNumber.from("3333")],
            metadata:"jklmnopqr",
}

const TEST_DEPLOYER_ADDRESS = createAddress("0x123");
const TEST_FORTA_ADDRESS = createAddress("0x456");


describe("Nethermind Agent", () => {
  let handleTransaction: HandleTransaction;
  let fortaProxy = new Interface([CREATE_AGENT]);

  beforeAll(() => {
    handleTransaction = provideHandleTx(CREATE_AGENT,TEST_DEPLOYER_ADDRESS,TEST_FORTA_ADDRESS);
  }
  );

  it("returns empty findings if no transactions", async () => {
    const txEvent = new TestTransactionEvent();
    const findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  }
  );
  


})