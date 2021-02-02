import { Address, ContractFunction, Argument } from '@elrondnetwork/erdjs/out';
import { Query, QueryResponse } from '@elrondnetwork/erdjs/out/smartcontracts/query';
import * as React from 'react';
import { useContext } from '../../context';
import denominate from '../Denominate/formatters';
import StatCard from '../StatCard';

interface StatCardType {
    title: string;
}

const DelegatorViews = ({ title = '' }: StatCardType) => {
    const { dapp, address, erdLabel, delegationContract } = useContext();

    const [userActiveStake, setUserActiveState] = React.useState('0');
    const [userUnstakeValue, setUserUnstakedValue] = React.useState('0');
    const [claimableRewards, setClaimableRewards] = React.useState('0');
    const getClaimableRewards = () => {
        const query = new Query({
            address: new Address(delegationContract),
            func: new ContractFunction('getClaimableRewards'),
            args: [Argument.fromPubkey(new Address(address))]
        });
        dapp.proxy.queryContract(query)
            .then((value) => {
                setClaimableRewards(DenominateResponse(value) || '0');
            })
            .catch(e => console.error('getClaimableRewards error', e));
    };

    const getUserActiveStake = () => {
        const query = new Query({
            address: new Address(delegationContract),
            func: new ContractFunction('getUserActiveStake'),
            args: [Argument.fromPubkey(new Address(address))]
        });
        dapp.proxy.queryContract(query)
            .then((value) => {
                setUserActiveState(DenominateResponse(value) || '');
            })
            .catch(e => console.error('getUserActiveStake error', e));
    };

    const getUserUnStakeValue = () => {
        const query = new Query({
            address: new Address(delegationContract),
            func: new ContractFunction('getUserUnStakedValue'),
            args: [Argument.fromPubkey(new Address(address))]
        });
        dapp.proxy.queryContract(query)
            .then((value) => {
                setUserUnstakedValue(DenominateResponse(value) || '');
            })
            .catch(e => console.error('GetUserUnStakeValue error', e));
    };

    const getAllData = () => {
        getClaimableRewards();
        getUserActiveStake();
        getUserUnStakeValue();
    };

    React.useEffect(getAllData, 
        []);

    return (
        <div className="row stats full-width">
            <div className="col-12 mb-spacer">
                <div className="card card-small">
                    {title && (
                        <div className="card-header border-bottom">
                            <h6 className="m-0">{title}</h6>
                        </div>
                    )}<div className="card-body d-flex flex-wrap p-3">
                        <StatCard title="Claimable rewards" value={claimableRewards} valueUnit={erdLabel} />
                        <StatCard title="Active stake" value={userActiveStake} valueUnit={erdLabel} />
                        <StatCard title="Unstaked value" value={userUnstakeValue} valueUnit={erdLabel} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DelegatorViews;
function DenominateResponse(value: QueryResponse): React.SetStateAction<string> {
    return denominate({ input: value.returnData[0].asBigInt.toString(), denomination: 18, decimals: 2, showLastNonZeroDecimal: false });
}

