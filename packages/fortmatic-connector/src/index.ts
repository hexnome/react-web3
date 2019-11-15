import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import invariant from 'tiny-invariant'

const chainIdToNetwork: { [network: number]: string } = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan'
}

export interface FortmaticConnectorArguments {
  apiKey: string
  chainId: number
}

export class FortmaticConnector extends AbstractConnector {
  private readonly apiKey: string
  private readonly chainId: number

  public fortmatic: any
  private provider: any

  constructor({ apiKey, chainId }: FortmaticConnectorArguments) {
    invariant(Object.keys(chainIdToNetwork).includes(chainId.toString()), `Unsupported chainId ${chainId}`)
    super({ supportedChainIds: [chainId] })

    this.apiKey = apiKey
    this.chainId = chainId
  }

  public async activate(): Promise<ConnectorUpdate> {
    const { default: Fortmatic } = await import('fortmatic')
    this.fortmatic = new Fortmatic(
      this.apiKey,
      this.chainId === 1 || this.chainId === 4 ? undefined : chainIdToNetwork[this.chainId]
    )
    this.provider = this.fortmatic.getProvider()

    const account = await this.provider.enable().then((accounts: string[]): string => accounts[0])

    return { provider: this.provider, account }
  }

  public async getProvider(): Promise<any> {
    return this.provider
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId
  }

  public async getAccount(): Promise<null | string> {
    return this.provider.send('eth_accounts').then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {
    this.provider = undefined
    this.fortmatic = undefined
  }

  public async close() {
    await this.fortmatic.user.logout()
    this.emitDeactivate()
  }
}
