import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { Link } from "react-router-dom";
import { Button, Form, FormFeedback, FormGroup, FormText, Input, Label, Spinner} from "reactstrap";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import "./ResetPassword.css";

export default function ResetPassword (props) {
    
    const [codeSent, setCodeSent] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);


    async function handleSendCodeClick (values) {
    

        setIsSendingCode(true);

        try {
            await Auth.forgotPassword(values.email);
            
            setCodeSent(true);
            props.setAlertVisible(false);

        }   catch (e) {
            props.setAlertMessage(e.message);
            props.setAlertVisible(true);
            setIsSendingCode(false);
        }
    };

    async function handleConfirmClick (values) {

        setIsConfirming(true);

        try {
            await Auth.forgotPasswordSubmit(
                values.email,
                values.confirmationCode.toString(),
                values.password
            );

            setConfirmed(true);
            props.setAlertVisible(false);

        } catch (e) {
            props.setAlertMessage(e.message);
            props.setAlertVisible(true);
            setIsConfirming(false);
        }
    };

    function renderRequestCodeForm() {
        return (
            <Formik
                initialValues={{ email: "" }}
                validationSchema={yup.object().shape({
                email: yup.string()
                .email('A valid Email address is required')
                .required('Email is required'),
                })}
                onSubmit={values => {
                    handleSendCodeClick(values);
                }}>
                {({ errors, touched, handleSubmit}) => (
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="email">Email</Label>
                            <Input type="email" name="email" bsSize="lg" autoFocus tag={Field} invalid={errors.email && touched.email} component='input'/>
                            <FormFeedback>{errors.email}</FormFeedback>
                        </FormGroup>
                        <br/>
                        <Button
                            block
                            color="warning" size="lg"
                            type="submit"
                            disabled={isSendingCode}
                        >               
                            {isSendingCode && <Spinner as="span" color="light" />}
                            &nbsp;&nbsp;Reset Password
                        </Button>
                </Form>

                )}
            </Formik>
        );
    }

    function renderConfirmationForm() {
        return (
            <Formik
                initialValues={{ confirmationCode: "", password: "", confirmPassword: "" }}
                validationSchema={yup.object().shape({
                confirmationCode: yup.number()
                .required('Confirmation Code is required'),
                password: yup.string()
                .min(8, 'Your password must be min 8 characters. It must contain at least one uppercase and one lowercase letter. It must contain at least one number digit and one special character')
                .required('Password is required'),
                confirmPassword: yup.string()
                .oneOf([yup.ref('password')], "Passwords don't match")
                .min(8, 'Your password must be min 8 characters. It must contain at least one uppercase and one lowercase letter. It must contain at least one number digit and one special character')
                .required('Confirmation Password is required'),
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
                        <hr />
                        <FormGroup>
                            <Label for="password">Password</Label>
                            <Input type="password" name="password" bsSize="lg" tag={Field} invalid={errors.password && touched.password} component='input'/>
                            <FormFeedback>{errors.password}</FormFeedback>
                        </FormGroup>
                        <FormGroup>
                            <Label for="confirmPassword">Confirm Password</Label>
                            <Input type="password" name="confirmPassword" bsSize="lg" tag={Field} invalid={errors.confirmPassword && touched.confirmPassword} component='input'/>
                            <FormFeedback>{errors.confirmPassword}</FormFeedback>
                        </FormGroup>
                        <Button
                            block
                            color="warning" size="lg"
                            type="submit"
                            disabled={isConfirming}
                        >               
                        {isConfirming && <Spinner as="span" color="light" />}
                        &nbsp;&nbsp;Confirm
                        </Button>
                    </Form>
                )}
            </Formik>
        );
    }

    function renderSuccessMessage() {
        return (
        <div className="success">
                <p>
                    <Spinner type="grow" color="success" />Your password has been reset.</p>
                <p>
                <Button color="link" tag={Link} to="/login">Click here to login with your new credentials.</Button>
                </p>
        </div>
        );
    }


    return (
        <div className="ResetPassword">
            {!codeSent
            ? renderRequestCodeForm()
            : !confirmed
                ? renderConfirmationForm()
                : renderSuccessMessage()}
        </div>
    );
    
}