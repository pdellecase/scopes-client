import React, { useRef, useState } from "react";
import { Button, Form, FormFeedback, FormGroup, Input, Label, Spinner} from "reactstrap";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import { API } from "aws-amplify";
import { s3Upload } from "../libs/awsLib";
import config from "../config";
import "./NewScope.css";

export default function NewScope(props) {
  const file = useRef(null);
  const [content] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  function handleFileChange(event) {
    file.current = event.target.files[0];
  }

  async function handleSubmit(values) {

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB.`
      );
      return;
    }
  
    setIsLoading(true);
  
    try {
      const attachment = file.current
        ? await s3Upload(file.current)
        : null;
  
      await createScope({ content: values.content, attachment });

      props.setAlertVisible(false);

      props.history.push("/");

    } catch (e) {
      props.setAlertMessage(e.message);
      props.setAlertVisible(true);
      setIsLoading(false);
    }
  }
  
  function createScope(scope) {
    return API.post("scopes", "/scopes", {
      body: scope
    });
  }

  return (
    <div className="NewScope">
      <Formik
        initialValues={{ content: content }}
        validationSchema={yup.object().shape({
          content: yup.string()
          .required('Content is required'),
        })}
        onSubmit={values => {
          handleSubmit(values);
        }}
      >
        {({ errors, touched, handleSubmit}) => (
            
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="content">Content</Label>
              <Input type="textarea" name="content" autoFocus tag={Field} invalid={errors.content && touched.content} component='input'/>
              <FormFeedback>{errors.content}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="file">Attachment</Label>
              <Input type="file" name="file" id="file" onChange={handleFileChange} />
            </FormGroup>
            <br/>
            <Button
              block
              color="primary"
              type="submit"
              disabled={isLoading}
            >               
              {isLoading && <Spinner as="span" color="light" />}
              &nbsp;&nbsp;Create
            </Button>
          </Form>
        )}
      </Formik>

    </div>
  );
}