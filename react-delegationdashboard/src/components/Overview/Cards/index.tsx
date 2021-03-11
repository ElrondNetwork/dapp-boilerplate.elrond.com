import * as React from 'react';
import { decimals, denomination } from 'config';
import { useContext } from 'context';
import denominate from 'components/Denominate/formatters';
import StatCard from 'components/StatCard';
import { Address, NetworkStake } from '@elrondnetwork/erdjs/out';
import { useState } from 'react';

import SetPercentageFeeAction from './SetPercentageFeeAction';
import UpdateDelegationCapAction from './UpdateDelegationCapAction';
import AutomaticActivationAction from './AutomaticActivationAction';
import ReDelegateCapActivationAction from './ReDelegateCapActivationAction';

const Views = () => {
  const {
    dapp,
    egldLabel,
    totalActiveStake,
    numberOfActiveNodes,
    address,
    contractOverview,
    aprPercentage,
    numUsers,
  } = useContext();
  const [networkStake, setNetworkStake] = useState(new NetworkStake());

  const getPercentage = (amountOutOfTotal: string, total: string) => {
    let percentage =
      (parseInt(amountOutOfTotal.replace(/,/g, '')) / parseInt(total.replace(/,/g, ''))) * 100;
    if (percentage < 1) {
      return '<1';
    }
    return percentage ? percentage.toFixed(2) : '...';
  };

  const isAdmin = () => {
    let loginAddress = new Address(address).hex();
    return loginAddress.localeCompare(contractOverview.ownerAddress) === 0;
  };

  const getNetworkStake = () => {
    dapp.apiProvider
      .getNetworkStake()
      .then(value => {
        setNetworkStake(value);
      })
      .catch(e => {
        console.error('getTotalStake error ', e);
      });
  };

  React.useEffect(() => {
    getNetworkStake();
  }, []);

  return (
    <div className="cards d-flex flex-wrap mr-spacer">
      <StatCard
        title="Number of Users"
        value={numUsers.toString()}
        color="orange"
        svg="user.svg"
      />
      <StatCard
        title="Contract Stake"
        value={denominate({
          input: totalActiveStake,
          denomination,
          decimals,
          showLastNonZeroDecimal: false,
        })}
        valueUnit={egldLabel}
        color="violet"
        svg="contract.svg"
        percentage={`${getPercentage(
          denominate({
            input: totalActiveStake,
            denomination,
            decimals,
            showLastNonZeroDecimal: false,
          }),
          denominate({
            input: networkStake.TotalStaked.toString(),
            denomination,
            decimals,
            showLastNonZeroDecimal: false,
          })
        )}% of total stake`}
      />
      <StatCard
        title="Number of Nodes"
        value={numberOfActiveNodes}
        valueUnit=""
        color="dark-green"
        svg="nodes.svg"
        percentage={`${getPercentage(
          numberOfActiveNodes,
          networkStake.TotalValidators.toString()
        )}% of total nodes`}
      />
      <StatCard
        title="Computed APR"
        value={aprPercentage}
        valueUnit=""
        color="pink"
        svg="computed.svg"
        percentage="Annual percentage rate"
        tooltipText="This is an aproximate APR calculation for this year based on the current epoch"
      />
      <StatCard
        title="Service Fee"
        value={contractOverview.serviceFee || ''}
        valueUnit="%"
        color="yellow"
        svg="service.svg"
      >
        {location.pathname === '/owner' && <SetPercentageFeeAction />}
      </StatCard>
      {isAdmin() && location.pathname === '/owner' ? (
        <StatCard
          title="Delegation Cap"
          value={contractOverview.maxDelegationCap || ''}
          valueUnit={egldLabel}
          color="light-green"
          svg="delegation.svg"
          percentage={`${getPercentage(
            denominate({
              input: totalActiveStake,
              denomination,
              decimals,
              showLastNonZeroDecimal: false,
            }),
            contractOverview.maxDelegationCap
          )}% filled`}
        >
          <UpdateDelegationCapAction />
        </StatCard>
      ) : (
        contractOverview.maxDelegationCap !== '0' &&
        contractOverview.maxDelegationCap !== '' && (
          <StatCard
            title="Delegation Cap"
            value={contractOverview.maxDelegationCap || ''}
            valueUnit={egldLabel}
            color="green"
            svg="delegation.svg"
            percentage={`${getPercentage(
              denominate({
                input: totalActiveStake,
                denomination,
                decimals,
                showLastNonZeroDecimal: false,
              }),
              contractOverview.maxDelegationCap
            )}% filled`}
          ></StatCard>
        )
      )}

      {isAdmin() && location.pathname === '/owner' && (
        <StatCard
          title="Automatic activation"
          value={contractOverview.automaticActivation === 'true' ? 'ON' : 'OFF'}
          color="purple"
          svg="activation.svg"
        >
          <AutomaticActivationAction automaticFlag={contractOverview.automaticActivation} />
        </StatCard>
      )}
      {isAdmin() && location.pathname === '/owner' && (
        <StatCard
          title="ReDelegate Cap"
          value={contractOverview.reDelegationCap === 'true' ? 'ON' : 'OFF'}
          color="green"
          svg="activation.svg"
          percentage="Cap for rewards"
          tooltipText="If your agency uses a max delegation cap and the ReDelegate Cap is OFF your delegators will be able to redelegate the reward to your agency. If the value is ON then the redelegate will not be accepted."
        >
          <ReDelegateCapActivationAction automaticFlag={contractOverview.reDelegationCap} />
        </StatCard>
      )}
    </div>
  );
};

export default Views;
