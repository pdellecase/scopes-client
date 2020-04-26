import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { Button, Form, FormFeedback, FormGroup, Input, Label, Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import "./Login.css";

export default function Login(props) {
  const [isLoading, setIsLoading] = useState(false);
 
  
  async function handleSubmit(values) {

    setIsLoading(true);

    try {
      await Auth.signIn(values.email, values.password);
      
      props.userHasAuthenticated(true);
      props.setAlertVisible(false);
      
    } catch (e) {
      props.setAlertMessage(e.message);
      props.setAlertVisible(true);
      setIsLoading(false);
    }
  }

  return (
    <div className="Login">
      <Formik
        enableReinitialize
        initialValues={{ email: "", password: "" }}
        validationSchema={yup.object().shape({
          email: yup.string()
            .email('A valid Email address is required')
            .required('Email is required'),
          password: yup.string()
            .min(6, 'Password is too Short')
            .required('Password is required'),
        })}
        onSubmit={values => {
          handleSubmit(values);
        }}>
        {({ errors, touched, handleSubmit}) => (

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="email">Login</Label>
              <Input type="email" name="email" bsSize="lg" autoFocus tag={Field} invalid={errors.email && touched.email} component='input'/>
              <FormFeedback>{errors.email}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="password">Password</Label>
              <Input type="password" name="password" bsSize="lg" tag={Field} invalid={errors.password && touched.password} component='input'/>
              <FormFeedback>{errors.password}</FormFeedback>
            </FormGroup>
            <Button color="link" tag={Link} to="/login/reset">Forgot password?</Button>
            <Button
              block
              color="primary" size="lg"
              type="submit"
              disabled={isLoading}
            >               
               {isLoading && <Spinner as="span" color="light" />}
               &nbsp;&nbsp;Login
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
