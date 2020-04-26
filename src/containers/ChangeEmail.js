import React, { useState } from "react";
import { Button, Form, FormFeedback, FormGroup, FormText, Input, Label, Spinner} from "reactstrap";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import { Auth} from "aws-amplify";
import "./ChangeEmail.css";


export default function ChangeEmail(props) {

    const [codeSent, setCodeSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    async function handleUpdateClick (values) {

        setIsLoading(true);

        try {
            const user = await Auth.currentAuthenticatedUser();
            await Auth.updateUserAttributes(user, { email: values.email });

            setCodeSent(true);
            props.setAlertVisible(false);
            setIsLoading(false);
      
        } catch (e) {
            props.setAlertMessage(e.message);
            props.setAlertVisible(true);
            setIsLoading(false);
        }
    };


    async function handleConfirmClick (values) {
    
        setIsLoading(true);

        try {
            await Auth.verifyCurrentUserAttributeSubmit("email", values.confirmationCode.toString());

            setIsLoading(false);
            props.setAlertVisible(false);

            props.history.push("/settings");

        } catch (e) {
            props.setAlertMessage(e.message);
            props.setAlertVisible(true);
            setIsLoading(false);
        }
    };

    function renderUpdateForm() {
        return (
            <Formik
                initialValues={{ email: "" }}
                validationSchema={yup.object().shape({
                    email: yup.string()
                    .email('A valid Email address is required')
                    .required('Email is required'),
                })}
                onSubmit={values => {
                    handleUpdateClick(values);
                }}>
                {({ errors, touched, handleSubmit}) => (
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="email">New Email</Label>
                            <Input type="email" name="email" bsSize="lg" autoFocus tag={Field} invalid={errors.email && touched.email} component='input'/>
                            <FormFeedback>{errors.email}</FormFeedback>
                        </FormGroup>
                        <br/>
                        <Button
                            block
                            color="warning" size="lg"
                            type="submit"
                            disabled={isLoading}
                        >               
                            {isLoading && <Spinner as="span" color="light" />}
                            &nbsp;&nbsp;Update Email
                        </Button>
                    </Form>
                 )}
            </Formik>
         );
    }

    function renderConfirmationForm() {
        return (
            <Formik
                initialValues={{ confirmationCode: "" }}
                validationSchema={yup.object().shape({
                    confirmationCode: yup.number()
                    .required('Confirmation Code is required'),
                })}
                onSubmit={values => {
                    handleConfirmClick(values);
                }}>
                {({ errors, touched, handleSubmit, values}) => (
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="confirmationCode">Confirmation Code</Label>
                            <Input type="number" name="confirmationCode" bsSize="lg" autoFocus tag={Field} invalid={errors.confirmationCode && touched.confirmationCode} component='input'/>
                            <FormFeedback>{errors.confirmationCode}</FormFeedback>
                            <FormText>Please check your email ({values.email}) for the confirmation code.</FormText>
                        </FormGroup>
                        <br/>
                        <Button
                            block
                            color="warning" size="lg"
                            type="submit"
                            disabled={isLoading}
                        >               
                            {isLoading && <Spinner as="span" color="light" />}
                            &nbsp;&nbsp;Confirm Change
                        </Button>
                    </Form>
                )}
            </Formik>
        );
    }


    return (
        <div className="ChangeEmail">
            {!codeSent
            ? renderUpdateForm()
            : renderConfirmationForm()
            }
        </div>
    );

}