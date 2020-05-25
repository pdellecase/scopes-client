import React, { useState } from "react";
import { API, Auth, Storage } from "aws-amplify";
import { Button, Form, FormFeedback, FormGroup, Input, Label, Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import "./Login.css";

export default function Login(props) {
  const [isLoading, setIsLoading] = useState(false);
 
  function loadUserProfile() {
    return API.get("users", "/login");
  }
  
  async function handleSubmit(values) {

    setIsLoading(true);
    var isAuthenticated = false;

    try {
      // Authentication through Cognito
      await Auth.signIn(values.email, values.password);
      props.userHasAuthenticated(true);
      isAuthenticated = true;

      // Load User Profile through API and get key profile info
      const userProfile = await loadUserProfile();
      if((userProfile) && (userProfile.userActive)) {
        props.setProfile(userProfile.profile);
        
        props.setUserName(userProfile.firstname + " " + userProfile.lastname);
       
        if(userProfile.attachment){
          let attachmentURL = await Storage.vault.get(userProfile.attachment);
          props.setUserPict(attachmentURL);
        } else {
          props.setUserPict("/assets/gen-avatar.png");
        }

        props.setAlertVisible(false);
      } else {
        await Auth.signOut();
        props.userHasAuthenticated(false);
        props.setAlertMessage("Sorry but your account is not active, contact your administrator!");
        props.setAlertVisible(true);
        setIsLoading(false);
        props.history.push("/");
      }
      
    } catch (e) { 
      if(isAuthenticated){  
        await Auth.signOut();
        isAuthenticated = false;
        props.userHasAuthenticated(false);
        props.setAlertMessage("Sorry, your account is compromised, contact your administrator and try again later! Error is: " + e.message);
        props.setAlertVisible(true);
        setIsLoading(false);
        props.history.push("/");
      } else {
        props.setAlertMessage(e.message);
        props.setAlertVisible(true);
        setIsLoading(false);
      }  
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
