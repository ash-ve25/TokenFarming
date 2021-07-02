pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{

//deposit DAI token
//get Dapp token
	string public name = "Dapp Token Farm";
	DappToken public dappToken;
	DaiToken public daiToken;

	constructor(DappToken _dappToken, DaiToken _daiToken) public{
		dappToken = _dappToken;
		daiToken = _daiToken;
	}


}