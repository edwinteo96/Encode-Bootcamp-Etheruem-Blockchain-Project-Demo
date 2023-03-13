import { Component } from '@angular/core';
import { ethers , Wallet  , utils, Signer, BigNumber } from 'ethers';
import tokenJson  from './token-abi.json';
declare var window: any

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  blockNumber : number | string | undefined;
  // provider : ethers.providers.BaseProvider;
  provider : ethers.providers.Web3Provider | undefined;
  transactions : string [] | undefined;

  CONST_GOERLIETH_ADDRESS : string = "0x7af963cf6d228e564e2a0aa0ddbf06210b38615d";

  // constructor (){
  //   this.provider = ethers.getDefaultProvider('goerli');
  // }

  syncBlock() {
    this.blockNumber = 'loading...';
    this.provider?.getBlock('latest').then((block) => {
      this.blockNumber = block.number;
      this.transactions = block.transactions;
    });
  }

  clearBlock() {
    this.blockNumber = 0;
  }

  //userWallet: Wallet | undefined;
  userEthBalance: string | undefined;
  walletAddress: string | undefined;
  signer: Signer | undefined;
  
  // createWallet() {
  //   this.userWallet = Wallet.createRandom().connect(this.provider);
  //   this.userWallet.getBalance().then((balanceBN) => {
  //     const balanceStr = utils.formatEther(balanceBN);
  //     this.userEthBalance = parseFloat(balanceStr);
  //   })
  // }

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
        console.log('Current account address:', balance);
      }).catch(error => {
        console.error(error);
      })

      console.log("goerli address: " + this.CONST_GOERLIETH_ADDRESS);
      // let token = new ethers.Contract(this.CONST_GOERLIETH_ADDRESS, tokenJson , this.provider);
      // this.userEthBalance = await token['balanceOf'](this.walletAddress);
      
      console.log('Current balance: ' + this.userEthBalance);
    } else {
      console.error('Metamask not detected');
    }
  }
}
