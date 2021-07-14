import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useContext } from 'context';
import { UndelegatedValueType } from './UndelegatedValueType';
import { DelegationTransactionType } from 'helpers/contractDataDefinitions';
import { useDelegationWallet } from 'helpers/useDelegation';
import ConfirmTransactionModal from 'components/ConfirmTransactionModal';

const UndelegatedValueRow = ({
  undelegatedValue: value,
}: {
  undelegatedValue: UndelegatedValueType;
}) => {
  const [isDisabled, setIsDisabled] = React.useState(true);
  const { egldLabel, ledgerAccount, walletConnectAccount } = useContext();
  const [counter, setCounter] = React.useState(value.timeLeft);
  const [showCheckYourLedgerModal, setShowCheckYourLedgerModal] = useState(false);
  const [transactionArguments, setTransactionArguments] = useState(
    new DelegationTransactionType('', '')
  );
  const { sendTransactionWallet } = useDelegationWallet();

  const handleWithdraw = () => {
    let txArguments = new DelegationTransactionType('0', 'withdraw');
    if (ledgerAccount || walletConnectAccount) {
      setTransactionArguments(txArguments);
      setShowCheckYourLedgerModal(true);
    } else {
      sendTransactionWallet(txArguments);
    }
  };

  useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
    counter === 0 && setIsDisabled(false);
  }, [counter]);

  const getTimeLeft = () => {
    if (counter === 0) setCounter(value.timeLeft);
    let waitingStartDate = moment.duration(counter, 'seconds');
    if(waitingStartDate.asDays() >= 1){
      return (waitingStartDate.asDays() | 0) + ' days';
    }
    const timeLeftInMiliseconds = waitingStartDate.asMilliseconds();
    return moment.utc(timeLeftInMiliseconds).format('D:HH:mm:ss');
  };
  return (
    <>
      <tr>
        <td>
          <div className="d-flex align-items-center text-nowrap trim">
            {value.value} {egldLabel}
          </div>
        </td>
        <td>
          <div className="d-flex align-items-center text-nowrap trim">
            {value.timeLeft > 0 ? (
              <span className="badge badge-sm badge-light-orange text-orange">
                {getTimeLeft()} left
              </span>
            ) : (
              <span className="badge badge-sm badge-light-green text-green">Completed</span>
            )}
          </div>
        </td>
        <td>
          <button
            disabled={isDisabled}
            onClick={handleWithdraw}
            className="btn btn-primary btn-sm d-flex ml-auto"
          >
            Withdraw
          </button>
        </td>
      </tr>
      <ConfirmTransactionModal
        show={showCheckYourLedgerModal}
        transactionArguments={transactionArguments}
        handleClose={() => {
          setShowCheckYourLedgerModal(false);
        }}
      />
    </>
  );
};
export default UndelegatedValueRow;
