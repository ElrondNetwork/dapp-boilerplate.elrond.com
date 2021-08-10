import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useContext, useDispatch } from 'context';
import { HWProvider } from '@elrondnetwork/erdjs';
import { faChevronLeft, faChevronRight, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import AddressRow from './AddressRow';
import { useHistory } from 'react-router-dom';
import State from 'components/State';
import { ledgerErrorCodes } from 'helpers/ledgerErrorCodes';

const AddressTable = ({
  setShowAddressTable,
  onClick,
  setError,
}: {
  setShowAddressTable: React.Dispatch<React.SetStateAction<boolean>>;
  onClick: () => void;
  setError: (error: string) => void;
}) => {
  const { dapp, loading } = useContext();
  const dispatch = useDispatch();
  const [startIndex, setStartIndex] = React.useState(0);
  const [accounts, setAccounts] = React.useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState<number | undefined>();
  const hwWalletP = new HWProvider(dapp.proxy);
  const history = useHistory();

  const fetchAccounts = () => {
    dispatch({ type: 'loading', loading: true });
    hwWalletP
      .init()
      .then((success: any) => {
        if (!success) {
          dispatch({ type: 'loading', loading: false });
          setError('could not initialise ledger app, make sure Elrond app is open');
          console.warn('could not initialise ledger app, make sure Elrond app is open');
          return;
        }
        hwWalletP
          .getAccounts(startIndex, 5)
          .then(accounts => {
            setAccounts(accounts);
            dispatch({ type: 'loading', loading: false });
          })
          .catch(err => {
            setError('Check if Elrond app is open on Ledger');
            console.error('error', err);
            dispatch({ type: 'loading', loading: false });
          });
      })
      .catch(err => {
        if (err.statusCode in ledgerErrorCodes) {
          setError((ledgerErrorCodes as any)[err.statusCode].message);
        }
        console.error('error', err);
        dispatch({ type: 'loading', loading: false });
      });
  };

  React.useEffect(fetchAccounts, /* eslint-disable react-hooks/exhaustive-deps */ [startIndex]);

  const goToNext = () => {
    setSelectedAddress('');
    setStartIndex(current => current + 1);
  };

  const goToPrev = () => {
    setSelectedAddress('');
    setStartIndex(current => (current === 0 ? 0 : current - 1));
  };

  const setAddress = () => {
    if (selectedIndex !== undefined) {
      dispatch({
        type: 'setLedgerAccount',
        ledgerAccount: {
          index: selectedIndex,
          address: selectedAddress,
        },
      });
      dispatch({ type: 'loading', loading: true });
      const hwWalletProvider = new HWProvider(dapp.proxy);
      hwWalletProvider
        .init()
        .then((success: any) => {
          if (!success) {
            setError('could not initialise ledger app, make sure Elrond app is open');
            dispatch({ type: 'loading', loading: false });
            console.warn('could not initialise ledger app, make sure Elrond app is open');
            return;
          }

          hwWalletProvider
            .login({addressIndex: selectedIndex})
            .then(address => {
              dispatch({ type: 'setProvider', provider: hwWalletProvider });
              dispatch({ type: 'login', address });

              dispatch({
                type: 'ledgerLogin',
                ledgerLogin: {
                  index: selectedIndex,
                  loginType: 'ledger',
                },
              });
              history.push('/dashboard');
            })
            .catch((err: any) => {
              if (err.statusCode in ledgerErrorCodes) {
                setError((ledgerErrorCodes as any)[err.statusCode].message);
                dispatch({
                  type: 'setLedgerAccount',
                  ledgerAccount: undefined,
                });
              }
              dispatch({ type: 'loading', loading: false });
              console.warn(err);
            });
        })
        .catch((err: any) => {
          if (err.statusCode in ledgerErrorCodes) {
            setError((ledgerErrorCodes as any)[err.statusCode].message);
          }
          dispatch({ type: 'loading', loading: false });
          console.warn('could not initialise ledger app, make sure Elrond app is open', err);
        });
      setShowAddressTable(false);
    }
  };

  switch (true) {
    case loading:
      return (
        <State icon={faCircleNotch} iconClass="fa-spin text-primary" title="Waiting for device" />
      );
    default:
      return (
        <>
          <div className="m-auto">
            <div className="card my-spacer text-center">
              <div className="card-body p-spacer mx-lg-spacer">
                <div className="table-responsive" data-testid="ledgerAddresses">
                  <table className="table m-0 border-bottom">
                    <thead className="py-2 text-semibold border-bottom">
                      <tr>
                        <th className="text-left border-0">Address</th>
                        <th className="text-left border-0">#</th>
                      </tr>
                    </thead>
                    <tbody data-testid="addressesTable">
                      {accounts.map((account, index) => {
                        const props = {
                          account,
                          index: index + startIndex * 5,
                          selectedAddress,
                          setSelectedAddress,
                          setSelectedIndex,
                          key: index,
                        };
                        return <AddressRow {...props} />;
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex justify-content-center pager mt-2">
                  <button
                    type="button"
                    className="btn btn-link px-2"
                    onClick={goToPrev}
                    data-testid="prevBtn"
                    disabled={startIndex === 0}
                  >
                    <FontAwesomeIcon size="sm" icon={faChevronLeft} /> Prev
                  </button>
                  <button
                    type="button"
                    className="btn btn-link px-2"
                    onClick={goToNext}
                    data-testid="nextBtn"
                  >
                    Next <FontAwesomeIcon size="sm" icon={faChevronRight} />
                  </button>
                </div>
                <button
                  className="btn btn-primary px-spacer mt-4"
                  disabled={selectedAddress === ''}
                  onClick={setAddress}
                  data-testid="confirmBtn"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      );
  }
};

export default AddressTable;
