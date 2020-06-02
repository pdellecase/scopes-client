import React, { useRef, useState, useEffect } from "react";
import { Button, Collapse, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Nav, Navbar, NavbarBrand, NavbarToggler, NavLink, Spinner, UncontrolledDropdown} from "reactstrap";
import { Link } from "react-router-dom";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import { API, Storage } from "aws-amplify";
import AsyncSelect from "react-select/async";
import { s3FileUpload } from "../libs/awsLib";
import config from "../config";
import "./Scopes.css";

export default function Scopes(props) {

  const file = useRef(null);
  const [scope, setScope] = useState(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewScope, setIsNewScope] = useState(null);
  // Top Navbar
  const [isNavbarOpen, setNavbarOpen] = useState(false);
  const navtoggle = () => setNavbarOpen(!isNavbarOpen);
  const [crmMDropdownOpen, setCrmMDropdownOpen] = useState(false);
  const crmMToggle = () => setCrmMDropdownOpen(!crmMDropdownOpen);

  // CRM Modal
  const [crmModal, setCrmModal] = useState(false);
  const crmModalToggle = () => setCrmModal(!crmModal);

  
  // Form Inputs
  const [stageSelected, setStageSelected] = useState(null);


  /*****************************************************************************
   *** Scope OnLoad initialisation (Create new scope or load existing scope) ***
   *****************************************************************************/

  useEffect(() => {
    function loadScope() {
      return API.get("scopes", `/scopes/${props.match.params.id}`);
    }

    async function onLoad() {

      // *** New Scope ***
      if((props.match.params.id==null) || (props.match.params.id.toUpperCase()==="NEW")) {
        setIsNewScope(true);
        setScope({ 
          content: "", 
          attachment: null }
        );
        alert("New Scope with Scope ID " + props.match.params.id);
      }

      // *** Existing Scope ***
      else {
        setIsNewScope(false);
        try {
          alert("Scope ID = " + props.match.params.id);
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
    }

    onLoad();
  }, [props.match.params.id]);


  /*************************************
   ***      CRM Link Management      ***
   *************************************/

  /*** Toggle CRM Link Modal ***/
  function handleCrmMLink(event){
    crmModalToggle();
  }

  function callSearchCRM(inputValue){
    let result = API.get("crm", `/crm/aaa/bbb/ccc/ddd`);
   // alert("result = " + result);
    const colourOptions = [
      { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
      { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
      { value: 'purple', label: 'Purple', color: '#5243AA' },
      { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
      { value: 'orange', label: 'Orange', color: '#FF8B00' },
      { value: 'yellow', label: 'Yellow', color: '#FFC400' },
      { value: 'green', label: 'Green', color: '#36B37E' },
      { value: 'forest', label: 'Forest', color: '#00875A' },
      { value: 'slate', label: 'Slate', color: '#253858' },
      { value: 'silver', label: 'Silver', color: '#666666' },];
      return colourOptions; 
  }

  const crmLinkPromiseOptions = inputValue =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(callSearchCRM(inputValue));
    }, 1000);
  });


  /********************************************
   ***      Logo Attachment Management      ***
   ********************************************/
  function formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }
  
 

  

  function handleFileChange(event) {
    file.current = event.target.files[0];
  }

  function createScope(scope) {
    return API.post("scopes", "/scopes", {
      body: scope
    });
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
        attachment = await s3FileUpload(file.current);
      }
  
      if(isNewScope){
        await createScope({ 
          content: values.content, 
          attachment: attachment });
      } 
      else  {
        await saveScope({
          content: values.content,
          attachment: attachment || scope.attachment
        });
      } 
      

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
      <Modal isOpen={crmModal} toggle={crmModalToggle}>
        <ModalHeader toggle={crmModalToggle}>
          <img alt="" src="/assets/crm_icon_M.png" width="60" height="42" className="d-inline-block align-top"/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Link to CRM Main Opportunity
          </ModalHeader>
        <ModalBody>
          Select your CRM Opportunity
          <AsyncSelect cacheOptions defaultOptions loadOptions={crmLinkPromiseOptions} />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={crmModalToggle}>Link</Button>{' '}
          <Button color="secondary" onClick={crmModalToggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
      <br></br>
      <Navbar color="light" light expand="md">
        <NavbarBrand href="/">{content!==""? (content):("New Scope")}</NavbarBrand>
        <NavbarToggler onClick={navtoggle} />
        <Collapse isOpen={isNavbarOpen} navbar>
          <Nav className="mr-auto" navbar>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Actions
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem tag={Link} to="/scopes/new">
                  Launch Services
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem disabled>
                  Custom App Add-on
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <NavLink>&nbsp;</NavLink>
            <Dropdown nav isOpen={crmMDropdownOpen} toggle={crmMToggle}>
              <DropdownToggle nav caret>
                <img alt="" src="/assets/crm_icon_M.png" width="40" height="28" className="d-inline-block align-top"/>
              </DropdownToggle>
              <DropdownMenu>
                    <DropdownItem  href="https://login.Salesforce.com" target="_blank">Open</DropdownItem>
                    <DropdownItem divider />  
                    <DropdownItem onClick={handleCrmMLink}>Link to CRM</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Nav>
        </Collapse>
      </Navbar>

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