const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm

  before(async () => {
    // Load Contracts
    daiToken = await DaiToken.new()
    dappToken = await DappToken.new()
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

    // Transfer all Dapp tokens to farm (1 million)
    await dappToken.transfer(tokenFarm.address, tokens('1000000'))

    // Send tokens to investor
    await daiToken.transfer(investor, tokens('100'), { from: owner })
  })

  describe('Mock DAI deployment', async () => {
    it('has a name', async () => {
      const name = await daiToken.name()
      assert.equal(name, 'Mock DAI Token')
    })
  })

  describe('Dapp Token deployment', async () => {
    it('has a name', async () => {
      const name = await dappToken.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('Token Farm deployment', async () => {
    it('has a name', async () => {
      const name = await tokenFarm.name()
      assert.equal(name, 'Dapp Token Farm')
    })

    it('contract has tokens', async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('Farming Tokens', async() => {
    it('reward investors for staking mDai tokens', async() => {
      let result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'Investor mDai balance is correct for staking')

      //stake mDai tokens
      await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor})
      await tokenFarm.stakeTokens(tokens('100'), {from: investor});

      //check staking result
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('0'), 'Investor mDai balance is correct after staking')

      result = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('100'), 'Token Farm mDai balance is correct after staking')

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('100'), 'Investor staking balance is correct after staking')      

      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'true', 'investor staking status is correct after staking')

      //Issue Token
      await tokenFarm.issueTokens({from: owner})

      result = await dappToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Dapp wallet balance is correct after issuance')

      await tokenFarm.issueTokens({from: investor}).should.be.rejected; 

      //Unstake mDai Tokens
      await tokenFarm.unstakeTokens({from: investor});

      //check unstaking result
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'Investor mDai balance is correct after unstaking')

      result = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('0'), 'Token Farm mDai balance is correct after unstaking')

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('0'), 'Investor staking balance is correct after unstaking')      

      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'false', 'investor staking status is correct after unstaking')

    })
  })

})