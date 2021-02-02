export interface AccountType {
  address: string;
  balance: string;
  nonce: number;
  code?: string;
}

export interface DelegationContractType {
  name: string;
  gasLimit: number;
  data: string;
}

export class StatCardType {
  title!: string;
  value!: string;
  valueUnit!: string;
}


export class NodeType {
  blsKey!: string;
  status!: { [key: string]: string };
  public constructor(blsKey: string, status: { [key: string]: string }) {
    this.blsKey = blsKey;
    this.status = status;

  }
}
