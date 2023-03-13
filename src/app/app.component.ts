import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ethers, Wallet, utils, Signer, BigNumber, BigNumberish, Contract } from 'ethers';
import tokenJson from './erc20-abi.json';
import tokenizedBallotJson from './tokenizedballot-abi.json';

declare var window: any

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  blockNumber: number | string | undefined;
  // provider : ethers.providers.BaseProvider;
  provider: ethers.providers.Web3Provider | undefined;
  transactions: string[] | undefined;
  userEthBalance: string | undefined;
  walletAddress: string | undefined;
  signer: Signer | undefined;
  contract : Contract | undefined;
  numProposal : BigNumber | undefined;
  proposalNames : string [] = [];
  proposalCounts : BigNumber [] = [];
  winnerName : string | undefined;
  selectedOption: string | undefined;
  voteNumber: number = 0;


  CONST_GOERLIETH_ADDRESS: string = "0x7af963cf6d228e564e2a0aa0ddbf06210b38615d";
  CONST_TOKENIZED_BALLOT_ADDRESS: string = "0x33048359595Def305206558a9a156cc1d97A1C10";
  CONST_LOCALHOST_VOTE: string = "";

  constructor (private http: HttpClient){
    
  }

  syncBlock() {
    this.blockNumber = 'loading...';
    this.provider?.getBlock('latest').then((block) => {
      this.blockNumber = block.number;
      this.transactions = block.transactions;
    });
  }

  onOptionChange(event: any) {
    this.selectedOption = event.target.value;
    console.log(`The selected radio is: ${this.selectedOption}`);
  }

  onInputChange(event: any) {
    this.voteNumber = event.target.value;
    console.log(`The input value is: ${this.voteNumber}`);
  }

  getTokenAddess() {
    return this.http.get<{address: string}>(this.CONST_LOCALHOST_VOTE);
  }

  // example ussage of http pub sub
  tokenContractAddress : string | undefined;
  httpvote () {
    this.getTokenAddess().subscribe((response) => {
      this.tokenContractAddress = response.address;
    })
  }

  clearBlock() {
    this.blockNumber = 0;
  }

  //userWallet: Wallet | undefined;

  // createWallet() {
  //   this.userWallet = Wallet.createRandom().connect(this.provider);
  //   this.userWallet.getBalance().then((balanceBN) => {
  //     const balanceStr = utils.formatEther(balanceBN);
  //     this.userEthBalance = parseFloat(balanceStr);
  //   })
  // }
  
  async getWinnerName() {
    if (this.contract !== undefined) {
      const name = await this.contract['winnerName']();
      const text = ethers.utils.parseBytes32String(name).trim();
      this.winnerName = text;
    }
  }

  async getProposalCount() {
    if (this.contract !== undefined) {
      this.numProposal = await this.contract['numProposals']();
    }
  }

  async vote() {
    if (this.contract !== undefined) {
      const result = await this.contract['vote'](BigNumber.from(this.selectedOption));
    }
    // .send({ gasLimit: 1000000, gasPrice: 10000000000 });
  }

  async getContract () {
    this.contract = new ethers.Contract(this.CONST_TOKENIZED_BALLOT_ADDRESS, tokenizedBallotJson, this.provider);
  }

  async getProposalName () {
    if (this.contract !== undefined) {
      if (this.numProposal !== undefined) {
        for (let i = BigNumber.from(0); i.lt(this.numProposal); i = i.add(BigNumber.from(1))) {
          const proposal = await this.contract['proposals'](i);
          const text = ethers.utils.parseBytes32String(proposal.name).trim();
          const count = proposal.voteCount;
          this.proposalNames?.push(text);
          this.proposalCounts?.push(count);
        }
      }
    }
  }

  async connectToMetamask() {
    if (window.ethereum) {
      // Wait for the window.ethereum.enable() method to show the Metamask UI and request user permission
      await window.ethereum.enable();
      console.log('Connected to Metamask!');

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      this.signer.getAddress().then(address => {
        this.walletAddress = address;
        console.log('Current account address:', address);
      }).catch(error => {
        console.error(error);
      });

      this.signer.getBalance().then(balance => {
        this.userEthBalance = ethers.utils.formatEther(balance);
        console.log('Current account eth balance:', balance);
      }).catch(error => {
        console.error(error);
      })

      console.log("goerli address: " + this.CONST_GOERLIETH_ADDRESS);
      
      await this.getContract();
      await this.getProposalCount();
      await this.getProposalName();
      await this.getWinnerName();
    } else {
      console.error('Metamask not detected');
    }
  }
}
