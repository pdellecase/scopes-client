import React, { useRef, useState, useEffect } from "react";
import { Button, Form, FormFeedback, FormGroup, Input, Label, Spinner} from "reactstrap";
import { Link } from "react-router-dom";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import { API, Storage } from "aws-amplify";
import { s3Upload } from "../libs/awsLib";
import config from "../config";
import "./Scopes.css";

export default function Scopes(props) {
  const file = useRef(null);
  const [scope, setScope] = useState(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    function loadScope() {
      return API.get("scopes", `/scopes/${props.match.params.id}`);
    }

    async function onLoad() {
      try {
        const scope = await loadScope();
        const { content, attachment } = scope;

        if (attachment) {
          scope.attachmentURL = await Storage.vault.get(attachment);
        }

        setContent(content);
        setScope(scope);
        
      } catch (e) {
        alert(e);
      }
    }

    onLoad();
  }, [props.match.params.id]);

  
  function formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }
  
  function handleFileChange(event) {
    file.current = event.target.files[0];
  }

  function saveScope(scope) {
    return API.put("scopes", `/scopes/${props.match.params.id}`, {
      body: scope
    });
  }
  
  async function handleSubmit(values) {
    let attachment;
  
    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB.`
      );
      return;
    }
  
    setIsLoading(true);
  
    try {
      if (file.current) {
        attachment = await s3Upload(file.current);
      }
  
      await saveScope({
        content: values.content,
        attachment: attachment || scope.attachment
      });

      props.setAlertVisible(false);
      
      props.history.push("/");

    } catch (e) {
      props.setAlertMessage(e.message);
      props.setAlertVisible(true);
      setIsLoading(false);
    }
  }
  
  function deleteScope() {
    return API.del("scopes", `/scopes/${props.match.params.id}`);
  }
  
  async function handleDelete(event) {
    event.preventDefault();
  
    const confirmed = window.confirm(
      "Are you sure you want to delete this scope?"
    );
  
    if (!confirmed) {
      return;
    }
  
    setIsDeleting(true);
  
    try {
      await deleteScope();

      props.setAlertVisible(false);
      props.history.push("/");

    } catch (e) {
      props.setAlertMessage(e.message);
      props.setAlertVisible(true);
      setIsDeleting(false);
    }
  }
  
  return (
    <div className="Scopes">
      {scope && (

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
              {scope.attachment && (
                <FormGroup>
                  <Label for="attachment">Attachment</Label>
                  <Button color="link" name="attachment" tag={Link} to={scope.attachmentURL}>{formatFilename(scope.attachment)}</Button>
                </FormGroup>
              )}
              <FormGroup>
                {!scope.attachment && <Label for="file">Attachment</Label>}
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
                &nbsp;&nbsp;Save
              </Button>
              <Button
                block
                color="danger"
                type="submit"
                disabled={isDeleting}
                onClick={handleDelete}
              >               
                {isDeleting && <Spinner as="span" color="light" />}
                &nbsp;&nbsp;Delete
              </Button>
            </Form>
          )}
        </Formik>

      )}
    </div>
  );
}