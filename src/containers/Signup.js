import React, { useState } from "react";
import { Button, Form, FormFeedback, FormGroup, Input, Label, Spinner} from "reactstrap";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import { Auth} from "aws-amplify";
import config from "../config";
import "./Signup.css";


export default function Signup(props) {
  
  const [newUser, setNewUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  

  async function handleSubmit(values) {
    
    setIsLoading(true);
  
    try {

      // Security Check on restricted domains (Production only)
      var restrictedDomains = config.RESTRICTED_DOMAINS;
      if((restrictedDomains!=="")&&(restrictedDomains!==null)&&(restrictedDomains!=='*')){
        var index=0;
        var matchedDomain=false;
        var restrictedDomainsArray = restrictedDomains.split(',');
        while(index<restrictedDomainsArray.length){
          if(values.email.includes(restrictedDomainsArray[index])) {
            matchedDomain=true;
          }
          index++;
        }
        if(!matchedDomain) {throw new Error("Application could not sign you in, please contact your Administrator");}
      }

      const newUser = await Auth.signUp({
        username: values.email,
        password: values.password
      });
      setIsLoading(false);
      setNewUser(newUser);

      props.setAlertVisible(false);
    
    } catch (e) {
        if (e.name === "UsernameExistsException") {
          props.setAlertMessage("Check your email for a new verification code if you didn't confirm your credentials yet, otherwise just authenticate through the Login page.");
          props.setAlertVisible(true);
    
          const newUser = await Auth.resendSignUp(values.email);
         
          setNewUser(newUser);
           
        } else {
          props.setAlertMessage(e.message);
          props.setAlertVisible(true);
        }
       
        setIsLoading(false);
       
    }

  }
  
  async function handleConfirmationSubmit(values) {
  
    setIsLoading(true);
  
    try {
      await Auth.confirmSignUp(values.email, values.confirmationCode.toString());
      await Auth.signIn(values.email, values.password);

      props.setAlertVisible(false);
  
      props.userHasAuthenticated(true);
      props.history.push("/");
    } catch (e) {
      props.setAlertMessage(e.message);
      props.setAlertVisible(true);
      setIsLoading(false);
    }
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
          handleConfirmationSubmit(values);
        }}>
        {({ errors, touched, handleSubmit}) => (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="confirmationCode">Confirmation Code</Label>
              <Input type="number" name="confirmationCode" bsSize="lg" autoFocus tag={Field} invalid={errors.confirmationCode && touched.confirmationCode} component='input'/>
              <FormFeedback>{errors.confirmationCode}</FormFeedback>
            </FormGroup>
          <br/>
          <Button
              block
              color="success" size="lg"
              type="submit"
              disabled={isLoading}
            >               
               {isLoading && <Spinner as="span" color="light" />}
               &nbsp;&nbsp;Verify
            </Button>
          </Form>
        )}
      </Formik>
    );
  }

  function renderForm() {
    return (
      <Formik
        initialValues={{ email: "", password: "", confirmPassword: "" }}
        validationSchema={yup.object().shape({
          email: yup.string()
          .email('A valid Email address is required')
          .required('Email is required'),
          password: yup.string()
          .min(8, 'Your password must be min 8 characters. It must contain at least one uppercase and one lowercase letter. It must contain at least one number digit and one special character')
          .required('Password is required'),
          confirmPassword: yup.string()
          .oneOf([yup.ref('password')], "Passwords don't match")
          .min(8, 'Your password must be min 8 characters. It must contain at least one uppercase and one lowercase letter. It must contain at least one number digit and one special character')
          .required('Confirmation Password is required'),
        })}
        onSubmit={values => {
          handleSubmit(values);
        }}
      >
        {({ errors, touched, handleSubmit}) => (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input type="email" name="email" bsSize="lg" autoFocus tag={Field} invalid={errors.email && touched.email} component='input'/>
              <FormFeedback>{errors.email}</FormFeedback>
            </FormGroup>
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
          <br/>
          <Button
              block
              color="success" size="lg"
              type="submit"
              disabled={isLoading}
            >               
               {isLoading && <Spinner as="span" color="light" />}
               &nbsp;&nbsp;Signup
            </Button>
          </Form>
        )}
      </Formik>
    );
  }


  return (
    
    <div className="Signup">
      {newUser === null ? renderForm() : renderConfirmationForm()}
    </div>
  );
}