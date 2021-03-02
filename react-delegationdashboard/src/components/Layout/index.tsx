import { QueryResponse } from '@elrondnetwork/erdjs/out/smartcontracts/query';
import denominate from 'components/Denominate/formatters';
import { denomination, decimals } from 'config';
import { useContext, useDispatch } from 'context';
import { emptyAgencyMetaData } from 'context/state';
import { contractViews } from 'contracts/ContractViews';
import { ContractOverview, AgencyMetadata, NetworkConfig, NetworkStake, Stats } from 'helpers/types';
import React from 'react';
import { calculateAPR } from './APRCalculation';
import Footer from './Footer';
import Navbar from './Navbar';

const Layout = ({ children, page }: { children: React.ReactNode; page: string }) => {
  const dispatch = useDispatch();
  const { dapp, delegationContract } = useContext();
  const { getContractConfig, getTotalActiveStake, getBlsKeys, getNumUsers, getMetaData } = contractViews;

  const getContractOverviewType = (value: QueryResponse) => {
    let delegationCap = denominate({
      decimals,
      denomination,
      input: value.returnData[2].asBigInt.toString(),
      showLastNonZeroDecimal: false,
    });
    let initialOwnerFunds = denominate({
      decimals,
      denomination,
      input: value.returnData[3].asBigInt.toString(),
      showLastNonZeroDecimal: false,
    });
    return new ContractOverview(
      value.returnData[0].asHex.toString(),
      (value.returnData[1].asNumber / 100).toString(),
      delegationCap,
      initialOwnerFunds,
      value.returnData[4]?.asString,
      value.returnData[5].asBool,
      value.returnData[6].asBool,
      value.returnData[7]?.asString,
      value.returnData[8].asBool,
      value.returnData[9]?.asNumber * 6
    );
  };

  const getAgencyMetaDataType = (value: QueryResponse) => {
    if(value.returnData.length === 0) {
      return emptyAgencyMetaData;
    }
    return new AgencyMetadata(
      value.returnData[0]?.asString,
      value.returnData[1]?.asString,
      value.returnData[2]?.asString
    );
  };
  React.useEffect(() => {
    Promise.all([
      getMetaData(dapp, delegationContract),
      getNumUsers(dapp, delegationContract),
      getContractConfig(dapp, delegationContract),
      getTotalActiveStake(dapp, delegationContract),
      getBlsKeys(dapp, delegationContract),
      dapp.apiProvider.getNetworkStats(),
      dapp.apiProvider.getNetworkStake(),
      dapp.proxy.getNetworkConfig(),
    ])
      .then(
        ([
          metaData,
          numUsers,
          contractOverview,
          {
            returnData: [activeStake],
          },
          { returnData: blsKeys },
          networkStats,
          networkStake,
          networkConfig,
        ]) => {
          dispatch({
            type: 'setNumUsers',
            numUsers: numUsers.returnData[0].asNumber,
          });
          dispatch({
            type: 'setContractOverview',
            contractOverview: getContractOverviewType(contractOverview),
          });
          dispatch({
            type: 'setAgencyMetaData',
            agencyMetaData: getAgencyMetaDataType(metaData),
          });
          dispatch({
            type: 'setTotalActiveStake',
            totalActiveStake: activeStake.asBigInt.toString(),
          });
          dispatch({
            type: 'setNumberOfActiveNodes',
            numberOfActiveNodes: blsKeys.filter(key => key.asString === 'staked').length.toString(),
          });
          dispatch({
            type: 'setAprPercentage',
            aprPercentage: calculateAPR({
              stats: new Stats(networkStats.Epoch),
              networkConfig: new NetworkConfig(
                networkConfig.TopUpFactor,
                networkConfig.TopUpRewardsGradientPoint
              ),
              networkStake: new NetworkStake(
                networkStake.TotalValidators,
                networkStake.ActiveValidators,
                networkStake.QueueSize,
                networkStake.TotalStaked
              ),
              blsKeys: blsKeys,
              totalActiveStake: activeStake.asBigInt.toString(),
            }),
          });
        }
      )
      .catch(e => {
        console.log('To do ', e);
      });
  }, []);

  return (
    <div className={`layout d-flex flex-column min-vh-100 ${page}`}>
      {page !== 'home' && <Navbar />}
      <main className="container flex-grow-1 d-flex p-3 p-sm-spacer">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
