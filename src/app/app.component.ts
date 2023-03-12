import { Component } from '@angular/core';
import { ethers , Wallet  , utils } from 'ethers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  blockNumber : number | string | undefined;
  provider : ethers.providers.BaseProvider;

  constructor (){
    this.provider = ethers.getDefaultProvider('goerli');
  }

  syncBlock() {
    this.blockNumber = 'loading...';
    this.provider.getBlock('latest').then((block) => {
      this.blockNumber = block.number;
    });
  }

  clearBlock() {
    this.blockNumber = 0;
  }

  userWallet: Wallet | undefined;
  userEthBalance: number | undefined;
  
  createWallet() {
    this.userWallet = Wallet.createRandom().connect(this.provider);
    this.userWallet.getBalance().then((balanceBN) => {
      const balanceStr = utils.formatEther(balanceBN);
      this.userEthBalance = parseFloat(balanceStr);
    })
  }
}
