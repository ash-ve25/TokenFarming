pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{

//deposit DAI token
//get Dapp token
	string public name = "Dapp Token Farm";
	DappToken public dappToken;
	DaiToken public daiToken;
	address public owner;
	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	constructor(DappToken _dappToken, DaiToken _daiToken) public{
		dappToken = _dappToken;
		daiToken = _daiToken;
		owner = msg.sender;
	}

//Stake Token (Deposit)
	function stakeTokens(uint _amount) public{

		require(_amount > 0, "amount cannot be zero");
		//Transfer DAI tokens to this contract for staking
		daiToken.transferFrom(msg.sender, address(this), _amount);

		//Update staking balance 
		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

		//add user to stakers array only if he has not staked before
		if(!hasStaked[msg.sender]){
			stakers.push(msg.sender);
		}

		//update staking status
		isStaking[msg.sender] = true;
		hasStaked[msg.sender] = true;
	}

//Issue Tokens to all stakers
// issue same amount of dappTokens that the stakers staked the daiTokens
	function issueTokens() public{

		//Only owner can call the function
		require(msg.sender == owner, "Only owner can call the function");
		for(uint i=0; i< stakers.length; i++){
			address recipient = stakers[i];
			uint bal = stakingBalance[recipient];
			if(bal > 0){
				dappToken.transfer(recipient, bal);	
			}
		}
	}

	//Unstaking Tokens
	function unstakeTokens() public{

		uint bal = stakingBalance[msg.sender];
		require(bal > 0, "amount cannot be zero");

		daiToken.transfer(msg.sender, bal);

		//Update staking balance 
		stakingBalance[msg.sender] = 0;

		//update staking status
		isStaking[msg.sender] = false;		
	}

}