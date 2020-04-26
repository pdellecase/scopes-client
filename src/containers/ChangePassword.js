import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { Button, Form, FormFeedback, FormGroup, Input, Label, Spinner} from "reactstrap";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import "./ChangePassword.css";

export default function ChangePassword (props) {
 
    const [isChanging, setIsChanging] = useState(false);
    

    async function handleChangeClick (values) {
    

        setIsChanging(true);
        
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
            await Auth.changePassword(
                currentUser,
                values.oldPassword,
                values.password
            );

            props.setAlertVisible(false);
            props.history.push("/settings");

        } catch (e) {
            props.setAlertMessage(e.message);
            props.setAlertVisible(true);
            setIsChanging(false);
        }
    };

 
    return (
        <div className="ChangePassword">
            <Formik
                initialValues={{ oldPassword: "", password: "", confirmPassword: "" }}
                validationSchema={yup.object().shape({
                oldPassword: yup.string()
                    .required('Old password is required'),
                password: yup.string()
                .min(8, 'Your new password must be min 8 characters. It must contain at least one uppercase and one lowercase letter. It must contain at least one number digit and one special character')
                .required('Password is required'),
                confirmPassword: yup.string()
                .oneOf([yup.ref('password')], "Passwords don't match")
                .min(8, 'Your new password must be min 8 characters. It must contain at least one uppercase and one lowercase letter. It must contain at least one number digit and one special character')
                .required('Confirmation Password is required'),
                })}
                onSubmit={values => {
                    handleChangeClick(values);
                }}>
                {({ errors, touched, handleSubmit}) => (
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="oldPassword">Old Password</Label>
                            <Input type="password" name="oldPassword" bsSize="lg" tag={Field} invalid={errors.oldPassword && touched.oldPassword} component='input'/>
                            <FormFeedback>{errors.oldPassword}</FormFeedback>
                        </FormGroup>
                        <hr />
                        <FormGroup>
                            <Label for="password">New Password</Label>
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
                            disabled={isChanging}
                        >               
                        {isChanging && <Spinner as="span" color="light" />}
                        &nbsp;&nbsp;Change Password
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    );
  

}