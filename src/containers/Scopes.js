import React, { useRef, useState, useEffect } from "react";
import { API, Storage } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import { s3Upload } from "../libs/awsLib";
import LoaderButton from "../components/LoaderButton";
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

  function validateForm() {
    return content.length > 0;
  }
  
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
  
  async function handleSubmit(event) {
    let attachment;
  
    event.preventDefault();
  
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
        content,
        attachment: attachment || scope.attachment
      });
      props.history.push("/");
    } catch (e) {
      alert(e);
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
      props.history.push("/");
    } catch (e) {
      alert(e);
      setIsDeleting(false);
    }
  }
  
  return (
    <div className="Scopes">
      {scope && (
        <form onSubmit={handleSubmit}>
          <FormGroup controlId="content">
            <FormControl
              value={content}
              componentClass="textarea"
              onChange={e => setContent(e.target.value)}
            />
          </FormGroup>
          {scope.attachment && (
            <FormGroup>
              <ControlLabel>Attachment</ControlLabel>
              <FormControl.Static>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={scope.attachmentURL}
                >
                  {formatFilename(scope.attachment)}
                </a>
              </FormControl.Static>
            </FormGroup>
          )}
          <FormGroup controlId="file">
            {!scope.attachment && <ControlLabel>Attachment</ControlLabel>}
            <FormControl onChange={handleFileChange} type="file" />
          </FormGroup>
          <LoaderButton
            block
            type="submit"
            bsSize="large"
            bsStyle="primary"
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Save
          </LoaderButton>
          <LoaderButton
            block
            bsSize="large"
            bsStyle="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </LoaderButton>
        </form>
      )}
    </div>
  );
}