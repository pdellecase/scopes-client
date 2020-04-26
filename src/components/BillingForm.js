import React, { useState } from "react";
import { Button, Form, FormFeedback, FormGroup, Input, Label, Spinner} from "reactstrap";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import { CardElement, injectStripe } from "react-stripe-elements";
import "./BillingForm.css";

function BillingForm({ isLoading, onSubmit, ...props }) {
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);

  isLoading = isProcessing || isLoading;


  async function handleSubmitClick(values) {

    setIsProcessing(true);

    const { token, error } = await props.stripe.createToken({ name: values.name });

    setIsProcessing(false);

    onSubmit(values.storage, { token, error });
  }

  return (

    <Formik
      initialValues={{ storage: "", name: "" }}
        validationSchema={yup.object().shape({
          storage: yup.number()
          .required('Storage units are required')
          .min(10)
          .positive('Storage must be positive'),
          name: yup.string()
          .required("Cardholder's name is required"),
        })}
      onSubmit={values => {
        handleSubmitClick(values);
      }}
    >
      {({ errors, touched, handleSubmit}) => (
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="storage">Storage</Label>
            <Input type="string" name="storage" bsSize="lg" autoFocus tag={Field} invalid={errors.storage && touched.storage} component='input'/>
            <FormFeedback>{errors.storage}</FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label for="name">Cardholder&apos;s name</Label>
            <Input type="string" name="name" bsSize="lg" tag={Field} invalid={errors.name && touched.name} component='input'/>
            <FormFeedback>{errors.name}</FormFeedback>
          </FormGroup>
          <Label for="CCI">Credit Card Info</Label>
          <CardElement
            className="card-field"
            name="CCI"
            onChange={e => setIsCardComplete(e.complete)}
            style={{
              base: { fontSize: "18px", fontFamily: '"Open Sans", sans-serif' }
            }}
          />
          <br/>
          <Button
            block
            color="success" size="lg"
            type="submit"
            disabled={isLoading||!isCardComplete}
          >               
            {isLoading && <Spinner as="span" color="light" />}
            &nbsp;&nbsp;Purchase
          </Button>
        </Form>
      )}
    </Formik>

  );
}

export default injectStripe(BillingForm);