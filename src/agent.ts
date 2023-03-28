import {
  BlockEvent,
  Finding,
  Initialize,
  HandleBlock,
  HandleTransaction,
  HandleAlert,
  AlertEvent,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";
import { NETHERMIND_DEPLOYER_ADDRESS,FORTA_CONTRACT_ADDRESS,CREATE_AGENT } from "./utils";


export function provideHandleTx(functionAbi: string, proxy: string, deployer: string) : HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];


    if(txEvent.from!=deployer.toLowerCase()){
      return findings;
    }

    const createBotTx = txEvent.filterFunction(functionAbi,proxy);
  
    createBotTx.forEach((call) => {
      const agentId = call.args[0];
      const owner = call.args[1];
      const metadata = call.args[2];
      const chainIds = call.args[3];
      findings.push(
        Finding.fromObject({
          name: "New Nethermind Bot Created",
          description: `New bot Created with ID: ${agentId} and owner: ${owner} and metadata: ${metadata} and chainIds: ${chainIds}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            agentId: agentId.toString(),
            owner,
            chainIds: chainIds.toString(),
            metadata,
          },
        })
      );
    })

    



  
   
   
    return findings;
  };
}


export default {
  // initialize,
  handleTransaction: provideHandleTx(CREATE_AGENT,NETHERMIND_DEPLOYER_ADDRESS,FORTA_CONTRACT_ADDRESS),
  // handleBlock,
  // handleAlert
};
