import React, { useRef, useState, useEffect } from "react";
import { Alert, Badge, Button, Col, Collapse, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, FormFeedback, FormGroup, Input, InputGroup, InputGroupAddon, Label, Modal, ModalBody, ModalFooter, ModalHeader, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Row, Spinner, TabContent, TabPane, UncontrolledDropdown} from "reactstrap";
import { Link } from "react-router-dom";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import { API, Storage } from "aws-amplify";
import AsyncSelect from "react-select/async";
import { s3FileUpload } from "../libs/awsLib";
import { debug } from "../libs/debugLib";
import classnames from 'classnames';
import config from "../config";
import "./Scopes.css";

export default function Scopes(props) {

   // General states 
  const file = useRef(null);
  const [scope, setScope] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewScope, setIsNewScope] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Top Navbar 
  const [isNavbarOpen, setNavbarOpen] = useState(false);
  const navtoggle = () => setNavbarOpen(!isNavbarOpen);
  const [crmMDropdownOpen, setCrmMDropdownOpen] = useState(false);
  const crmMToggle = () => setCrmMDropdownOpen(!crmMDropdownOpen);
  const [crmSDropdownOpen, setCrmSDropdownOpen] = useState(false);
  const crmSToggle = () => setCrmSDropdownOpen(!crmSDropdownOpen);
  // CRM Link Modal
  const [crmModal, setCrmModal] = useState(false);
  const crmModalToggle = () => setCrmModal(!crmModal);
  const [currentCrmOppType, setCurrentCrmOppType] = useState(null);
  const [currentCrmSelectedOpp, setCurrentCrmSelectedOpp] = useState(null);
  const [currentCrmSelectedOppText, setCurrentCrmSelectedOppText] = useState("Type-in and Select the CRM Opportunity to link !");
  // Tabs
  const [activeTab, setActiveTab] = useState('dashboard');
  const tabToggle = tab => {
    if(activeTab !== tab) setActiveTab(tab);
  }

  // Form Inputs
  const [scopeName, setScopeName] = useState("");
  const [crmMainOppSyncedAt, setCrmMainOppSyncedAt] = useState("");
  const [crmMainOppId, setCrmMainOppId] = useState("");
  const [crmMainOppUrl, setCrmMainOppUrl] = useState("");
  const [crmMainOppName, setCrmMainOppName] = useState("");
  const [crmMainOppStage, setCrmMainOppStage] = useState("");
  const [crmMainOppCloseDate, setCrmMainOppCloseDate] = useState("");
  const [crmMainOppProbability, setCrmMainOppProbability] = useState("");
  const [crmMainOppForecastCat, setCrmMainOppForecastCat] = useState("");

  const [crmServicesOppId, setCrmServicesOppId] = useState("");
  const [crmServicesOppUrl, setCrmServicesOppUrl] = useState("");
  const [crmServicesOppName, setCrmServicesOppName] = useState("");

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
        setIsEditMode(true);
        const scope = {scopeName: "New Scope", crmMainOppSyncedAt: "", crmMainOppId: "", crmMainOppName: "",
          crmMainOppStage: "", crmMainOppCloseDate : "", crmMainOppProbability: ""};
        setScopeName(scope.scopeName);
        setCrmMainOppSyncedAt(scope.crmMainOppSyncedAt);
        setCrmMainOppId(scope.crmMainOppId);
        setCrmMainOppName(scope.crmMainOppName);
        setCrmMainOppStage(scope.crmMainOppStage);
        setCrmMainOppCloseDate(scope.crmMainOppCloseDate);
        setCrmMainOppProbability(scope.crmMainOppProbability);
        setCrmMainOppForecastCat(scope.crmMainOppForecastCat);

        setCrmServicesOppId(scope.crmServicesOppId);
        setCrmServicesOppName(scope.crmServicesOppName);

        setScope(scope);

        debug("OnLoad(): Created new Scope - Id provided was " + props.match.params.id);
      }

      // *** Existing Scope ***
      else {
        setIsNewScope(false);
        setIsEditMode(false);
        try {
          debug("OnLoad(): Loading Scope Id = " + props.match.params.id);
          const scope = await loadScope();
          const {attachment} = scope;
          if (attachment) {
            scope.attachmentURL = await Storage.vault.get(attachment);
          }
          setScope(scope);
          setScopeName(scope.scopeName);
          setCrmMainOppSyncedAt(scope.crmMainOppSyncedAt);
          setCrmMainOppId(scope.crmMainOppId);
          setCrmMainOppUrl(config.CRM_URL + "/" + scope.crmMainOppId);
          setCrmMainOppName(scope.crmMainOppName);
          setCrmMainOppStage(scope.crmMainOppStage);
          setCrmMainOppCloseDate(scope.crmMainOppCloseDate);
          setCrmMainOppProbability(scope.crmMainOppProbability);
          setCrmMainOppForecastCat(scope.crmMainOppForecastCat); 

          setCrmServicesOppId(scope.crmServicesOppId);
          setCrmServicesOppUrl(config.CRM_URL + "/" + scope.crmServicesOppId);
          setCrmServicesOppName(scope.crmServicesOppName);
          
        } catch (e) {
          alert("Error Loading Sope: " + e);
        }
      }
    }

    onLoad();
  }, [props.match.params.id]);


  /*************************************
   ***      CRM Link Management      ***
   *************************************/

  /*** Toggle CRM Link Modal ***/
  function handleCrmLinkModal(event){
   
    setCurrentCrmOppType(event.currentTarget.id);
    crmModalToggle();
    setCurrentCrmSelectedOpp(null);
    setCurrentCrmSelectedOppText("Type-in and Select the CRM Opportunity to link !");
  }

  /*** Async CRM Search and Load Select Options ***/
  async function crmLinkLoadOptions(searchCrmStr){

    if((searchCrmStr)&&(searchCrmStr.length>=config.TRIGGER_CRM_LINK_SELECT)){
      try {
        let crmOptions = await API.get("crm", "/crmsearch/" + config.CRM_CLIENT_KEY + "/" + searchCrmStr + "/no/null");
        debug("CRM search with searchCrmStr=" + searchCrmStr + " - found " + crmOptions.length + " results");
        return crmOptions;
      } catch (e) {
        // Do not interrupt the flow if error, the asynch selector will return no results
        debug("CRM search error: " + e.message);
      }
    }
    else { 
      return [];
    }
  }  

  /*** CRM Opportunity selected ***/ 
  function handleCrmLinkSelect(selectedOption) {
    setCurrentCrmSelectedOpp(selectedOption);
    let crmSelectedOppText = selectedOption.Region__c + " Opportunity for " + selectedOption.Account_Name__c + " owned by " + 
    selectedOption.Opp_Owner_FirstName__c + " " + selectedOption.Opp_Owner_LastName__c + " - MRR " + selectedOption.Booking_MRR__c +
    " " + selectedOption.CurrencyIsoCode + " - Services? " + selectedOption.Will_professional_services_be_required__c + 
    " - Close Date: " + selectedOption.CloseDate;
    setCurrentCrmSelectedOppText(crmSelectedOppText);
    debug("CRM Opp Selected: " + crmSelectedOppText);
  }

  /*** CRM Opportunity linked to Scope ***/ 
  function handleCrmLinkScope() {

    setCrmModal(!crmModal);

    if(currentCrmOppType==="mainCRM") {
      setCrmMainOppId(currentCrmSelectedOpp.Id);
      setCrmMainOppUrl(config.CRM_URL + "/" + currentCrmSelectedOpp.Id);
      setCrmMainOppName(currentCrmSelectedOpp.Name);
      debug(currentCrmOppType + " Opp linked to Scope with Id: " + currentCrmSelectedOpp.Id);
      crmRefresh(currentCrmSelectedOpp.Id, true);
    }
    else {
      setCrmServicesOppId(currentCrmSelectedOpp.Id);
      setCrmServicesOppUrl(config.CRM_URL + "/" + currentCrmSelectedOpp.Id);
      setCrmServicesOppName(currentCrmSelectedOpp.Name);
      debug(currentCrmOppType + " Opp linked to Scope with Id: " + currentCrmSelectedOpp.Id);
      crmRefresh(currentCrmSelectedOpp.Id, false);
    } 
  }

  /*** CRM Refresh ***/ 
  function crmRefresh(crmOppId, main) {
    
    props.setLoadingSpinnerVisible(true);
    props.setLoadingMessage("Syncing CRM ...");


    if((main && crmOppId)||(crmMainOppId && crmMainOppId.length>0)){
      try {
        let crmData = API.get("crm", "/crmget/" + config.CRM_CLIENT_KEY + "/" + crmOppId + "/yes");
        alert("there is a Main CRM Link - crmData > " + JSON.stringify(crmData));
     
        if((!main && crmOppId)||(crmServicesOppId && crmServicesOppId.length>0)){
          alert("there is a Service CRM Link");
        }
      } catch (e) {
        debug("CRM refresh error: " + e.message);
      }
    }

    props.setLoadingSpinnerVisible(false);
   
  }

  /*** CRM External Links */
  function openMainCrmLink(){
    if(crmMainOppId) {window.open(config.CRM_URL + "/" + crmMainOppId, "_blank")}
    else {window.open(config.CRM_URL, "_blank")}; 
  }
  function openServicesCrmLink(){
    if(crmServicesOppId) {window.open(config.CRM_URL + "/" + crmServicesOppId, "_blank")}
    else {window.open(config.CRM_URL, "_blank")}; 
  }


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

  /**--**--**--**--**--**--**--**--*  J S X   E L E M E N T S  *--**--**--**--**--**--**--**--**--**/

  

 
  /*******************************
   *** Main Scope JSX Elements ***
   *******************************/
  return (
    
    <div className="Scopes">
      <Modal isOpen={crmModal} toggle={crmModalToggle}>
        <ModalHeader toggle={crmModalToggle}>
          <img alt="" src={currentCrmOppType==='mainCRM'?('/assets/crm_icon_M.png'):('/assets/crm_icon_S.png')} width="60" height="42" className="d-inline-block align-top"/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Link to {currentCrmOppType==='mainCRM'?('Main'):('Services')} CRM Opportunity
          </ModalHeader>
        <ModalBody>
          CRM Opportunity
          <AsyncSelect cacheOptions 
            loadOptions={searchCrmStr => crmLinkLoadOptions(searchCrmStr)}
            getOptionValue={option => option.Id}
            getOptionLabel={option => option.Name}
            onChange={handleCrmLinkSelect}
          />
          <br/>
          <Alert color="secondary">{currentCrmSelectedOppText}</Alert>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={!currentCrmSelectedOpp} onClick={handleCrmLinkScope}>Link</Button>{' '}
          <Button color="secondary" onClick={crmModalToggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
      <br></br>
      {scope && (
        <Formik
          initialValues={{ scopeName: scopeName}}
          validationSchema={yup.object().shape({
            scopeName: yup.string()
                .required('Scope Name is required'),
          })}
          onSubmit={values => {
            handleSubmit(values);
          }}
        >
          {({ errors, touched, handleSubmit}) => (
            <Form onSubmit={handleSubmit}>
              <Navbar color="light" light expand="md">
                <NavbarBrand>
                  {isEditMode && <Input type="text" name="scopeName" placeholder="Scope Name" size="45" bsSize="sm" autoFocus={isNewScope} tag={Field} invalid={errors.scopeName && touched.scopeName} component='input'/>}
                  {!isEditMode && "scopeName"}
                </NavbarBrand>
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
                        <img alt="" src={crmMainOppId?("/assets/crm_icon_M.png"):("/assets/crm_icon_M_off.png")} width="40" height="28" className="d-inline-block align-top"/>
                      </DropdownToggle>
                      <DropdownMenu>
                            <DropdownItem  onClick={openMainCrmLink}>Open CRM</DropdownItem>
                            <DropdownItem divider />  
                            <DropdownItem id="mainCRM" onClick={handleCrmLinkModal}>Link to Main CRM Opp.</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                    {crmMainOppId?(
                      <Dropdown nav isOpen={crmSDropdownOpen} toggle={crmSToggle}>
                        <DropdownToggle nav caret>
                          <img alt="" src={crmServicesOppId?("/assets/crm_icon_S.png"):("/assets/crm_icon_S_off.png")} width="40" height="28" className="d-inline-block align-top"/>
                        </DropdownToggle>
                        <DropdownMenu>
                              <DropdownItem  onClick={openServicesCrmLink}>Open CRM</DropdownItem>
                              <DropdownItem divider />  
                              <DropdownItem id="servicesCRM" onClick={handleCrmLinkModal}>Link to Services CRM Opp.</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    ):(<></>)
                    }
                  </Nav>
                </Collapse>
              </Navbar>
              <br/>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === 'dashboard' })}
                    onClick={() => { tabToggle('dashboard'); }}
                  >
                    Dashboard
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === 'sales' })}
                    onClick={() => { tabToggle('sales'); }}
                  >
                    Sales
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === 'scoping' })}
                    onClick={() => { tabToggle('scoping'); }}
                  >
                    Scoping
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === 'services' })}
                    onClick={() => { tabToggle('services'); }}
                  >
                    Services
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="dashboard">
                  <Row>
                    <Col sm="12">
                      <h4>Dashboard Contents</h4>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tabId="sales">
                  <p/>
                  <small>Last CRM Sync: {crmMainOppSyncedAt}</small>
                  <p/>
                  <InputGroup>
                    <InputGroupAddon addonType="prepend"><Button color="primary" onClick={openMainCrmLink}>&nbsp;&nbsp;&nbsp;Main Opportunity&nbsp;&nbsp;&nbsp;</Button></InputGroupAddon>
                    <Input type="text" name="crmMainOppName" value={crmMainOppName} className="maincrminput" bsSize="sm" tag={Field} invalid={errors.crmMainOppName && touched.crmMainOppName} component='input'/>
                  </InputGroup>  
                  <br/> 
                  <Row form>
                    <Col md={6}> 
                    <FormGroup>
                        <Label for="crmMainOppStage"><small>Sales Stage</small></Label>
                        <Input type="text" name="crmMainOppStage" value={crmMainOppStage} onChange={e => setCrmMainOppStage(e.target.value)} bsSize="sm" tag={Field} invalid={errors.crmMainOppStage && touched.crmMainOppStage} component='input'/>
                        <FormFeedback>{errors.crmMainOppStage}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={6}> 
                      <FormGroup>
                        <Label for="crmMainOppCloseDate"><small>Sales Close Date</small></Label>
                        <Input type="text" name="crmMainOppCloseDate" value={crmMainOppCloseDate} onChange={e => setCrmMainOppCloseDate(e.target.value)} bsSize="sm" tag={Field} invalid={errors.crmMainOppCloseDate && touched.crmMainOppCloseDate} component='input'/>
                        <FormFeedback>{errors.crmMainOppCloseDate}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row form>
                    <Col md={6}> 
                      <FormGroup>
                        <Label for="crmMainOppProbability"><small>Sales Probability</small></Label>
                        <Input type="text" name="crmMainOppProbability" value={crmMainOppProbability} onChange={e => setCrmMainOppProbability(e.target.value)} bsSize="sm" tag={Field} invalid={errors.crmMainOppProbability && touched.crmMainOppProbability} component='input'/>
                        <FormFeedback>{errors.crmMainOppProbability}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={6}> 
                      <FormGroup>
                        <Label for="crmMainOppForecastCat"><small>Sales Forecast</small></Label>
                        <Input type="text" name="crmMainOppForecastCat" value={crmMainOppForecastCat} onChange={e => setCrmMainOppForecastCat(e.target.value)} bsSize="sm" tag={Field} invalid={errors.crmMainOppForecastCat && touched.crmMainOppForecastCat} component='input'/>
                        <FormFeedback>{errors.crmMainOppForecastCat}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <br/> 
                  <InputGroup>
                    <InputGroupAddon addonType="prepend"><Button color="success" onClick={openServicesCrmLink}>Services Opportunity</Button></InputGroupAddon>
                    <Input type="text" name="crmServicesOppName" value={crmServicesOppName} className="servicescrminput" bsSize="sm" tag={Field} invalid={errors.crmServicesOppName && touched.crmServicesOppName} component='input'/>
                  </InputGroup> 
                  <br/>      
                </TabPane>
                <TabPane tabId="scoping">
                  <br/>
                  
                </TabPane>
                <TabPane tabId="services">
                  <Row>
                    <Col sm="12">
                      <h4>Services Contents</h4>
                    </Col>
                  </Row>
                </TabPane>
              </TabContent>
              {!isEditMode && 
                <Button block color="primary" type="submit" disabled={isLoading}>               
                &nbsp;&nbsp;Edit
                </Button>
              }
              {isEditMode && 
                <Button block color="primary" type="submit" disabled={isLoading}>               
                  {isLoading && <Spinner as="span" color="light" />}
                  &nbsp;&nbsp;Save
                </Button>
              }
              <Button block color="secondary" type="submit">               
                &nbsp;&nbsp; {isEditMode? ("Cancel"):("Back Home")}
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
}