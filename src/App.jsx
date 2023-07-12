import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalidAddress, setInvalidAddress] = useState(false);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  window.ethereum.on('accountsChanged', async (accounts) => {
    if (!accounts.length) setWalletConnected(false);
    else setUserAddress(accounts[0]);

  })

 

  function isValidAddress(address) {
    const regex = /^0x[a-fA-F0-9]{40}$/;
    return regex.test(address);
  }

  async function getAccounts() {
    
    setPendingRequest(true);
    const accounts = await provider.send('eth_requestAccounts');
    
    setUserAddress(accounts[0]);
    setWalletConnected(true);
    setPendingRequest(false);
  }

  async function getTokenBalance() {
    setInvalidAddress(false)
    setHasQueried(false);
    setLoading(true);

    let user = userAddress;

    console.log(user)
    
    if (user.slice(-4) === '.eth') user = await provider.resolveName(user);

    console.log(user)

    if (!isValidAddress(user)) setInvalidAddress(true);
    
   
    const configs = {
      apiKey: 'TkcHoygMVt4ECaS6e5tia-a7u0_ixuP_',
      network: Network.ETH_SEPOLIA,
    };

    const alchemy = new Alchemy(configs);
    const data = await alchemy.core.getTokenBalances(user);
    
    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setLoading(false);
    setHasQueried(true);
  }

  return (
    <Box w="100vw">
      {!walletConnected && <Button onClick={getAccounts} disabled={pendingRequest}>Connect Wallet</Button>}
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an ENS or wallet address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        {walletConnected ? (<><Heading mt={42}>
          Your wallet is connected at address:
          
        </Heading>
        <div>{userAddress}</div>
        <Button fontSize={20} onClick={getTokenBalance} mt={36} bgColor="black" color="green">
          Check ERC-20 Token Balances
        </Button>
        {invalidAddress && 'Invalid address bro!'}
        {loading ? <Heading my={36}>Loading Bro...</Heading> : <Heading my={36}>ERC-20 token balances:</Heading>}
        </>) : (<><Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          id="input-bar"
          onChange={(e) => setUserAddress(e.target.value)}
          color= {"green.500"}
          
          w="600px"
          textAlign="center"
          p={4}
          fontSize={24}
        />
        
        <Button fontSize={20} onClick={getTokenBalance} mt={36} color="green" bgColor="black">
          Check ERC-20 Token Balances
        </Button>
        
        <Heading my={36}>ERC-20 token balances:</Heading></>)}

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  id='money-box'
                  flexDir={'column'}
                  bg="black"
                  w={'20vw'}
                  h={'15vh'}
                  key={e.id}
                >
                  <Box>
                    <b>Symbol:</b> ${tokenDataObjects[i]?.symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i]?.decimals
                    )}
                  </Box>
                  <Image src={tokenDataObjects[i]?.logo} />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          <>
            {!loading && 'Please make a query! This may take a few seconds...'}
            <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            
                <Flex
                  flexDir={'column'}
                  
                  h={'15vh'}
                  
                  
                >
                  <Box>
                    
                  </Box>
                  <Box>
                   
                  </Box>
                  
                </Flex>
             
          </SimpleGrid>
          </>
          
          )}
      </Flex>
    </Box>
  );
}

export default App;
