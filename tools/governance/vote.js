const yargs = require('yargs');
const argv = yargs
    .option('contract', {
        alias: 'c',
        description: 'The contract address',
        type: 'string'
    })
    .option('id', {
        alias: 'i',
        description: 'The id of propose to vote',
        type: 'string'
    })
    .option('against', {
        alias: 'd',
        description: 'voteAgainst or voteFor, default is voteFor',
        type: 'bool'
    })
    .help()
    .alias('help', 'h')
    .argv;


const 1earnGovernance = artifacts.require("1earnGovernance");
const 1FI = artifacts.require("1FI");
const 1CRV = artifacts.require("1CRV");

const D = console.log;

let govInstance
let govAddress
let tokenInstance
let tokenAddress

const walletAddress = 1earnGovernance.currentProvider.addresses[0];


function argvCheck() {
    if (argv.id == null || argv.id == '')
        throw 'You must supply the id of propose to vote, using --id ID or -i ID!';
    govAddress = argv.contract ? argv.contract : 1earnGovernance.address;
    if (!govAddress)
        throw 'You must supply a contract address using --contract CONTRACT_ADDRESS or -c CONTRACT_ADDRESS!';
}

async function init() {
    argvCheck();
    govInstance = await 1earnGovernance.at(govAddress);
    tokenAddress = await govInstance.1FI.call();
    tokenInstance = await 1FI.at(tokenAddress);
}

const web3 = require('web3');

async function tokenStatus() {
    console.log(`1FI token address: ${tokenAddress}`);
    let total = await tokenInstance.totalSupply();
    console.log(`Current total supply of the hfi token is: ${web3.utils.fromWei(total)}`);

    let balance = await tokenInstance.balanceOf(walletAddress);
    console.log(`Balance of hfi token ${tokenAddress} for address ${walletAddress} is: ${web3.utils.fromWei(balance)}\n`);
}

async function vote() {
    const voteAgainst = !!argv.against;
    const proposeID = argv.id;

    const voteMethod = govInstance[voteAgainst ? 'voteAgainst' : 'voteFor'];

    let voteResult = await voteMethod(proposeID);
    console.log(`vote transactions hash: ${voteResult.tx}`)

    const proposal = await govInstance.proposals(proposeID);
    console.log(`proposal(${proposeID}):`);
    console.table({
        id: proposal.id.toString(),
        proposer: proposal.proposer,
        totalAgree: proposal.totalForVotes.toString(),
        totalAgainst: proposal.totalAgainstVotes.toString(),
        startBlockNo: proposal.start.toString(),
        endBlockNo: proposal.end.toString(),
    });
}

module.exports = function (result) {
    return init()
        .then(tokenStatus)
        .then(vote)
        .then(result).catch(result);
}
