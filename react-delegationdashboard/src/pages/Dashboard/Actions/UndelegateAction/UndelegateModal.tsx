import React from 'react';
import { Modal } from 'react-bootstrap';
import { useContext } from 'context';
import { ErrorMessage, Formik } from 'formik';
import { object, string } from 'yup';
import { ActionModalType } from 'helpers/types';

const UndelegateSchema = object().shape({
  amount: string()
    .required('Required')
    .test('number', 'String not allows, only numbers. For example (12.20)', value => {
      const regex = /^(\d+(?:[\.]\d{1,2})?)$/;
      return regex.test(value || '');
    }),
});

const UndelegateModal = ({
  show,
  title,
  description,
  handleClose,
  handleContinue,
}: ActionModalType) => {
  const { egldLabel } = useContext();

  return (
    <Modal show={show} onHide={handleClose} className="modal-container" animation={false} centered>
      <div className="card">
        <div className="card-body p-spacer text-center">
          <p className="h3" data-testid="undelegateTitle">
            {title}
          </p>
          <p className="lead">{description}</p>

          <Formik
            initialValues={{
              amount: '',
            }}
            onSubmit={values => {
              handleContinue(values.amount);
            }}
            validationSchema={UndelegateSchema}
          >
            {props => {
              const { handleSubmit, values, handleBlur, handleChange } = props;

              return (
                <form onSubmit={handleSubmit} className="text-left">
                  <div className="form-group mt-spacer mb-0">
                    <label htmlFor="amount">Amount {egldLabel}</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        id="amount"
                        name="amount"
                        data-testid="amount"
                        required={true}
                        value={values.amount}
                        autoComplete="off"
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                    <ErrorMessage name="amount" />
                  </div>
                  <div className="d-flex justify-content-center align-items-center flex-wrap mt-spacer">
                    <button
                      type="submit"
                      className="btn btn-outline-primary mx-2"
                      id="continueDelegate"
                      data-testid="continueUndelegate"
                    >
                      Continue
                    </button>
                    <button id="closeButton" className="btn btn-link mx-2" onClick={handleClose}>
                      Close
                    </button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </Modal>
  );
};

export default UndelegateModal;
