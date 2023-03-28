import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from "forta-agent";
import { createAddress } from "forta-agent-tools";
import { provideHandleTx } from "./agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { Interface } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { NETHERMIND_DEPLOYER_ADDRESS,CREATE_AGENT,FORTA_CONTRACT_ADDRESS } from "./utils";

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


describe("Nethermind Bot deploying agent", () => {
  let handleTransaction: HandleTransaction;
  const mockTxEvent = createTransactionEvent({} as any);

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there are no  tx", async () => {
      let proxy = new Interface([CREATE_AGENT]);
      
      mockTxEvent.filterLog = jest.fn().mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      

    it("returns a finding if there is one", async () => {
      const mockTetherTransferEvent = {
        args: {
          from: "0xabc",
          to: "0xdef",
          value: ethers.BigNumber.from("20000000000"), //20k with 6 decimals
        },
      };
      mockTxEvent.filterLog = jest
        .fn()
        .mockReturnValue([mockTetherTransferEvent]);

      const findings = await handleTransaction(mockTxEvent);

      const normalizedValue = mockTetherTransferEvent.args.value.div(
        10 ** TETHER_DECIMALS
      );
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "High Tether Transfer",
          description: `High amount of USDT transferred: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            to: mockTetherTransferEvent.args.to,
            from: mockTetherTransferEvent.args.from,
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterLog).toHaveBeenCalledWith(
        ERC20_TRANSFER_EVENT,
        TETHER_ADDRESS
      );
    });
  });
});
