import React, { useRef, useState, useEffect } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, Collapse, CustomInput, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, FormFeedback, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText, Label, Modal, ModalBody, ModalFooter, ModalHeader, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Row, Spinner, TabContent, TabPane, Toast, ToastHeader, ToastBody, UncontrolledDropdown} from "reactstrap";
import { Link} from "react-router-dom";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import { API, Storage } from "aws-amplify";
import { s3BlobUpload, s3Remove } from "../libs/awsLib";
import { formatFilename, dataURItoBlob } from "../libs/utilsLib";
import AsyncSelect from "react-select/async";
import AvatarEditor from 'react-avatar-editor';
import { getNumberOfDaysSince } from "../libs/utilsLib";
import { debug } from "../libs/debugLib";
import classnames from 'classnames';
import config from "../config";
import "./Scopes.css";

export default function Scopes(props) {

   // General UI states
  const [scope, setScope] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewScope, setIsNewScope] = useState(null);
  const [isEdited, setIsEdited] = useState(false);

  // Top Navbar 
  const [isNavbarOpen, setNavbarOpen] = useState(false);
  const navtoggle = () => setNavbarOpen(!isNavbarOpen);
  const [crmMDropdownOpen, setCrmMDropdownOpen] = useState(false);
  const crmMToggle = () => setCrmMDropdownOpen(!crmMDropdownOpen);
  const [crmSDropdownOpen, setCrmSDropdownOpen] = useState(false);
  const crmSToggle = () => setCrmSDropdownOpen(!crmSDropdownOpen);
  const [scopeNameEdit, setScopeNameEdit] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState('dashboard');
  const tabToggle = tab => {
    if(activeTab !== tab) setActiveTab(tab);
  }
   
  // Save Confirmation Modal 
  const [saveModal, setSaveModal] = useState(false);
  const saveModalToggle = () => setSaveModal(!saveModal);
  
  // CRM Link Modal
  const [crmModal, setCrmModal] = useState(false);
  const crmModalToggle = () => setCrmModal(!crmModal);
  const [currentCrmOppType, setCurrentCrmOppType] = useState(null);
  const [currentCrmSelectedOpp, setCurrentCrmSelectedOpp] = useState(null);
  const [currentCrmSelectedOppText, setCurrentCrmSelectedOppText] = useState("Type-in and Select the CRM Opportunity to link !");

  // Avatar Editor controls (profile picture)
  const file = useRef(null);
  const [logoURL, setLogoURL] = useState(null);
  const [fileValid, setFileValid] = useState(true);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarRotate, setAvatarRotate] = useState(0);
  const [avatarEditor, setAvatarEditorRef] = useState(null);
  const [avatarEdited, setAvatarEdited] = useState(false);
  
  // Form Inputs
  const [scopeName, setScopeName] = useState("");
  const [crmSyncedAt, setCrmSyncedAt] = useState("");
  const [crmSyncedAtLocal, setCrmSyncedAtLocal] = useState("");
  const [crmMainOppId, setCrmMainOppId] = useState("");
  const [crmMainOppName, setCrmMainOppName] = useState("");
  const [crmMainOppType, setCrmMainOppType] = useState("");
  const [crmMainOppStage, setCrmMainOppStage] = useState("");
  const [crmMainOppCloseDate, setCrmMainOppCloseDate] = useState("");
  const [crmMainOppProbability, setCrmMainOppProbability] = useState("");
  const [crmMainOppForecastCat, setCrmMainOppForecastCat] = useState("");
  const [crmMainOppServicesReq, setCrmMainOppServicesReq] = useState("");
  const [crmMainOppLastModifDate, setCrmMainOppLastModifDate] = useState("");
  const [crmMainOppLastModifDateLocal, setCrmMainOppLastModifDateLocal] = useState("");
  const [crmMainOppAccountName, setCrmMainOppAccountName] = useState("");
  const [crmMainOppRegion, setCrmMainOppRegion] = useState("");
  const [crmMainOppOwnerName, setCrmMainOppOwnerName] = useState("");
  const [crmMainOppMRR, setCrmMainOppMRR] = useState("");
  const [crmMainOppARR, setCrmMainOppARR] = useState("");
  const [crmMainOppMRRinUSD, setCrmMainOppMRRinUSD] = useState("");
  const [crmMainOppCurrency, setCrmMainOppCurrency] = useState("");
  const [crmMainOppDiscount, setCrmMainOppDiscount] = useState("");
  const [crmMainOppMEDDPICC, setCrmMainOppMEDDPICC] = useState("");
  const [crmMainOppDScore, setCrmMainOppDScore] = useState("");
  const [crmMainOppSupportAgents, setCrmMainOppSupportAgents] = useState("");
  const [crmMainOppSupportPlan, setCrmMainOppSupportPlan] = useState("");
  const [crmMainOppChatAgents, setCrmMainOppChatAgents] = useState("");
  const [crmMainOppChatPlan, setCrmMainOppChatPlan] = useState("");
  const [crmMainOppTalkAgents, setCrmMainOppTalkAgents] = useState("");
  const [crmMainOppTalkPlan, setCrmMainOppTalkPlan] = useState("");
  const [crmMainOppGuideAgents, setCrmMainOppGuideAgents] = useState("");
  const [crmMainOppGuidePlan, setCrmMainOppGuidePlan] = useState("");
  const [crmMainOppExploreAgents, setCrmMainOppExploreAgents] = useState("");
  const [crmMainOppExplorePlan, setCrmMainOppExplorePlan] = useState("");
  const [crmMainOppSellAgents, setCrmMainOppSellAgents] = useState("");
  const [crmMainOppSellPlan, setCrmMainOppSellPlan] = useState("");
  const [crmMainOppSCNotes, setCrmMainOppSCNotes] = useState("");
  const [crmMainOppManagerNotes, setCrmMainOppManagerNotes] = useState("");
  const [crmMainOppAENextSteps, setCrmMainOppAENextSteps] = useState("");
  const [crmMainOppCompellingEvent, setCrmMainOppCompellingEvent] = useState("");
  const [crmMainOppAccountWeb, setCrmMainOppAccountWeb] = useState("");
  const [crmMainOppAccountIndustry, setCrmMainOppAccountIndustry] = useState("");
  const [crmMainOppAccountDesc, setCrmMainOppAccountDesc] = useState("");
  const [crmMainOppAccountOwnerMarketSegment, setCrmMainOppAccountOwnerMarketSegment] = useState("");
  const [crmMainOppAccountAssignedTerritory, setCrmMainOppAccountAssignedTerritory] = useState("");
  const [crmMainOppAccountMgrTeam, setCrmMainOppAccountMgrTeam] = useState("");
  const [crmMainOppSCName, setCrmMainOppSCName] = useState("");

  const [crmServicesOppId, setCrmServicesOppId] = useState("");
  const [crmServicesOppName, setCrmServicesOppName] = useState("");
  const [crmServicesOppStage, setCrmServicesOppStage] = useState("");
  const [crmServicesOppCloseDate, setCrmServicesOppCloseDate] = useState("");
  const [crmServicesOppProbability, setCrmServicesOppProbability] = useState("");
  const [crmServicesOppLastModifDate, setCrmServicesOppLastModifDate] = useState("");
  const [crmServicesOppLastModifDateLocal, setCrmServicesOppLastModifDateLocal] = useState("");
  
  const [crmScopingContactId, setCrmScopingContactId] = useState("");
  const [crmServicesEstimates, setCrmServicesEstimates] = useState("");
  const [crmServicesPlanSubTotal, setCrmServicesPlanSubTotal] = useState("");
  const [crmServicesDiscount, setCrmServicesDiscount] = useState("");
  const [crmServicesPlanTotal, setCrmServicesPlanTotal] = useState("");
  const [crmServicesProbability, setCrmServicesProbability] = useState("");
  const [crmServicesPartnerDue, setCrmServicesPartnerDue] = useState("");
  const [crmServicesDue, setCrmServicesDue] = useState("");
  const [crmServicesSOWType, setCrmServicesSOWType] = useState("");
  const [crmServicesContractType, setCrmServicesContractType] = useState("");
  const [crmServicesNotes, setCrmServicesNotes] = useState("");
  const [crmServicesScopingNextSteps, setCrmServicesScopingNextSteps] = useState("");
  const [crmServicesSAName, setCrmServicesSAName] = useState("");

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
        setScopeNameEdit(true);
        const scope = {scopeName: ""};
        setScope(scope);
       

        debug("OnLoad(): Created new Scope - Id provided was " + props.match.params.id);
      }

      // *** Existing Scope ***
      else {
        setIsNewScope(false);
        setScopeNameEdit(false);
        try {
          debug("OnLoad(): Loading Scope Id = " + props.match.params.id);
          const scope = await loadScope();
          const attachment = scope.attachment;
          if (attachment) {
            setLogoURL(await Storage.vault.get(attachment));
          }
          setScope(scope);
          setScopeName(scope.scopeName);
          setCrmSyncedAt(scope.crmSyncedAt);
          var crmSyncDate = new Date(scope.crmSyncedAt);
          setCrmSyncedAtLocal(crmSyncDate.toLocaleDateString() + " " + crmSyncDate.toLocaleTimeString());
          setCrmMainOppId(scope.crmMainOppId);
          setCrmMainOppName(scope.crmMainOppName);
          setCrmMainOppType(scope.crmMainOppType);
          setCrmMainOppStage(scope.crmMainOppStage);
          setCrmMainOppCloseDate(scope.crmMainOppCloseDate);
          setCrmMainOppProbability(scope.crmMainOppProbability);
          setCrmMainOppForecastCat(scope.crmMainOppForecastCat); 
          setCrmMainOppServicesReq(scope.crmMainOppServicesReq);
          setCrmMainOppLastModifDate(scope.crmMainOppLastModifDate);
          var crmMainOppModifDate = new Date(scope.crmMainOppLastModifDate);
          setCrmMainOppLastModifDateLocal(crmMainOppModifDate.toLocaleDateString() + " " + crmMainOppModifDate.toLocaleTimeString());
          setCrmMainOppAccountName(scope.crmMainOppAccountName);
          setCrmMainOppRegion(scope.crmMainOppRegion);
          setCrmMainOppOwnerName(scope.crmMainOppOwnerName);
          setCrmMainOppMRR(scope.crmMainOppMRR);
          setCrmMainOppARR(scope.crmMainOppMRR?parseFloat(scope.crmMainOppMRR)*12:"");
          setCrmMainOppMRRinUSD(scope.crmMainOppMRRinUSD);
          setCrmMainOppCurrency(scope.crmMainOppCurrency);
          setCrmMainOppDiscount(scope.crmMainOppDiscount);
          setCrmMainOppMEDDPICC(scope.crmMainOppMEDDPICC);
          setCrmMainOppDScore(scope.crmMainOppDScore);
          setCrmMainOppSupportAgents(scope.crmMainOppSupportAgents);
          setCrmMainOppSupportPlan(scope.crmMainOppSupportPlan);
          setCrmMainOppChatAgents(scope.crmMainOppChatAgents);
          setCrmMainOppChatPlan(scope.crmMainOppChatPlan);
          setCrmMainOppTalkAgents(scope.crmMainOppTalkAgents);
          setCrmMainOppTalkPlan(scope.crmMainOppTalkPlan);
          setCrmMainOppGuideAgents(scope.crmMainOppGuideAgents);
          setCrmMainOppGuidePlan(scope.crmMainOppGuidePlan);
          setCrmMainOppExploreAgents(scope.crmMainOppExploreAgents);
          setCrmMainOppExplorePlan(scope.crmMainOppExplorePlan);
          setCrmMainOppSellAgents(scope.crmMainOppSellAgents);
          setCrmMainOppSellPlan(scope.crmMainOppSellPlan);
          setCrmMainOppSCNotes(scope.crmMainOppSCNotes);
          setCrmMainOppManagerNotes(scope.crmMainOppManagerNotes);
          setCrmMainOppAENextSteps(scope.crmMainOppAENextSteps);
          setCrmMainOppCompellingEvent(scope.crmMainOppCompellingEvent);
          setCrmMainOppAccountWeb(scope.crmMainOppAccountWeb);
          setCrmMainOppAccountIndustry(scope.crmMainOppAccountIndustry);
          setCrmMainOppAccountDesc(scope.crmMainOppAccountDesc);
          setCrmMainOppAccountOwnerMarketSegment(scope.crmMainOppAccountOwnerMarketSegment);
          setCrmMainOppAccountAssignedTerritory(scope.crmMainOppAccountAssignedTerritory);
          setCrmMainOppAccountMgrTeam(scope.crmMainOppAccountMgrTeam);
          setCrmMainOppSCName(scope.crmMainOppSCName);
          setCrmServicesOppId(scope.crmServicesOppId);
          setCrmServicesOppName(scope.crmServicesOppName);
          setCrmServicesOppStage(scope.crmServicesOppStage);
          setCrmServicesOppCloseDate(scope.crmServicesOppCloseDate);
          setCrmServicesOppProbability(scope.crmServicesOppProbability);
          setCrmServicesOppLastModifDate(scope.crmServicesOppLastModifDate);
          var crmServicesOppModifDate = new Date(scope.crmServicesOppLastModifDate);
          setCrmServicesOppLastModifDateLocal(crmServicesOppModifDate.toLocaleDateString() + " " + crmServicesOppModifDate.toLocaleTimeString());
          setCrmScopingContactId(scope.crmScopingContactId);
          setCrmServicesEstimates(scope.crmServicesEstimates);
          setCrmServicesPlanSubTotal(scope.crmServicesPlanSubTotal);
          (scope.crmServicesPlanTotal)? setCrmServicesDiscount(Math.round(parseFloat((scope.crmServicesPlanSubTotal)-parseFloat(scope.crmServicesPlanTotal))*100/parseFloat(scope.crmServicesPlanSubTotal))):setCrmServicesDiscount("");
          setCrmServicesPlanTotal(scope.crmServicesPlanTotal);
          setCrmServicesProbability(scope.crmServicesProbability);
          setCrmServicesPartnerDue(scope.crmServicesPartnerDue?scope.crmServicesPartnerDue:"");
          setCrmServicesDue(scope.crmServicesDue);
          setCrmServicesSOWType(scope.crmServicesSOWType);
          setCrmServicesContractType(scope.crmServicesContractType);
          setCrmServicesNotes(scope.crmServicesNotes);
          setCrmServicesScopingNextSteps(scope.crmServicesScopingNextSteps);
          setCrmServicesSAName(scope.crmServicesSAName);
          
        } catch (e) {
          alert("Error Loading Scope: " + e);
        }
      }
    }

    onLoad();
  }, [props.match.params.id]);


  /******************************************
   *** Leave with Unsaved Changes Process ***
   ******************************************/
  function handleLeaveRequest(event) {
    if(isEdited) {
      saveModalToggle();
    } else {
    props.history.push("/");
    }
  }

  function handleSaveModalLeave() {
    props.history.push("/");
  }


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
      debug(currentCrmOppType + " Opp linked to Scope with Id: " + currentCrmSelectedOpp.Id);
      handleCrmRefresh(currentCrmSelectedOpp.Id, true);
    }
    else {
      setCrmServicesOppId(currentCrmSelectedOpp.Id);
      debug(currentCrmOppType + " Opp linked to Scope with Id: " + currentCrmSelectedOpp.Id);
      handleCrmRefresh(currentCrmSelectedOpp.Id, false);
    } 
  }

  /*** CRM Refresh ***/ 
  async function handleCrmRefresh(crmOppId, main) {
    
    props.setLoadingSpinnerVisible(true);
    props.setLoadingMessage("Syncing CRM ...");


    if((main && crmOppId)||(crmMainOppId && crmMainOppId.length>0)){
      
      try {
        let crmMOppId;
        if(main && crmOppId) {crmMOppId = crmOppId} 
        else {crmMOppId = crmMainOppId}

        let crmMDataJson = await API.get("crm", "/crmget/" + config.CRM_CLIENT_KEY + "/" + crmMOppId + "/yes");
        let crmMData = crmMDataJson[0];

        alert("crmMainOppLastModifDate = " + getNumberOfDaysSince(crmMData.LastModifiedDate) + " days");
        
        (crmMData.Name) ? setCrmMainOppName(crmMData.Name):setCrmMainOppName("");
        (crmMData.Type) ? setCrmMainOppType(crmMData.Type):setCrmMainOppType("");
        (crmMData.StageName) ? setCrmMainOppStage(crmMData.StageName):setCrmMainOppStage("");
        (crmMData.CloseDate) ? setCrmMainOppCloseDate(crmMData.CloseDate):setCrmMainOppCloseDate("");
        (crmMData.Probability) ? setCrmMainOppProbability(crmMData.Probability):setCrmMainOppProbability("");
        (crmMData.ForecastCategoryName) ? setCrmMainOppForecastCat(crmMData.ForecastCategoryName):setCrmMainOppForecastCat("");
        (crmMData.Will_professional_services_be_required__c) ? setCrmMainOppServicesReq(crmMData.Will_professional_services_be_required__c):setCrmMainOppServicesReq("");
        if(crmMData.LastModifiedDate) { 
          setCrmMainOppLastModifDate(crmMData.LastModifiedDate);
          var crmMainOppModifDate = new Date(crmMData.LastModifiedDate);
          setCrmMainOppLastModifDateLocal(crmMainOppModifDate.toLocaleDateString() + " " + crmMainOppModifDate.toLocaleTimeString());
        }
        else {
          setCrmMainOppLastModifDate("");
          setCrmMainOppLastModifDateLocal("");
        }
        (crmMData.Account_Name__c) ? setCrmMainOppAccountName(crmMData.Account_Name__c):setCrmMainOppAccountName("");
        (crmMData.Region__c) ? setCrmMainOppRegion(crmMData.Region__c):setCrmMainOppRegion("");
        (crmMData.Opp_Owner_LastName__c) ? setCrmMainOppOwnerName(crmMData.Opp_Owner_FirstName__c + " " + crmMData.Opp_Owner_LastName__c):setCrmMainOppOwnerName("");
        (crmMData.Booking_MRR__c) ? setCrmMainOppMRR(crmMData.Booking_MRR__c):setCrmMainOppMRR("");
        (crmMData.Booking_MRR__c) ? setCrmMainOppARR(parseFloat(crmMData.Booking_MRR__c)*12):setCrmMainOppARR("");
        (crmMData.Total_Booking_MRR_in_USD__) ? setCrmMainOppMRRinUSD(crmMData.Total_Booking_MRR_in_USD__c):setCrmMainOppMRRinUSD("");
        (crmMData.CurrencyIsoCode) ? setCrmMainOppCurrency(crmMData.CurrencyIsoCode):setCrmMainOppCurrency("");
        (crmMData.Primary_Quote_Total_Discount__c) ? setCrmMainOppDiscount(crmMData.Primary_Quote_Total_Discount__c):setCrmMainOppDiscount("");
        (crmMData.MEDDPICC_Score__c) ? setCrmMainOppMEDDPICC(crmMData.MEDDPICC_Score__c):setCrmMainOppMEDDPICC("");
        (crmMData.D_Score_latest__c) ? setCrmMainOppDScore(crmMData.D_Score_latest__c):setCrmMainOppDScore("");
        (crmMData.of_Agents__c) ? setCrmMainOppSupportAgents(crmMData.of_Agents__c):setCrmMainOppSupportAgents("");
        (crmMData.zd_plan__c) ? setCrmMainOppSupportPlan(crmMData.zd_plan__c):setCrmMainOppSupportPlan("");
        (crmMData.Chat_Number_of_Agents__c) ? setCrmMainOppChatAgents(crmMData.Chat_Number_of_Agents__c):setCrmMainOppChatAgents("");
        (crmMData.Chat_Plan__c) ? setCrmMainOppChatPlan(crmMData.Chat_Plan__c):setCrmMainOppChatPlan("");
        (crmMData.Talk_No_of_Agents__c) ? setCrmMainOppTalkAgents(crmMData.Talk_No_of_Agents__c):setCrmMainOppTalkAgents("");
        (crmMData.Talk_Plan__c) ? setCrmMainOppTalkPlan(crmMData.Talk_Plan__c):setCrmMainOppTalkPlan("");
        (crmMData.Guide_Number_of_Agents__c) ? setCrmMainOppGuideAgents(crmMData.Guide_Number_of_Agents__c):setCrmMainOppGuideAgents("");
        (crmMData.Guide_Plan__c) ? setCrmMainOppGuidePlan(crmMData.Guide_Plan__c):setCrmMainOppGuidePlan("");
        (crmMData.Explore_Number_of_Agents__c) ? setCrmMainOppExploreAgents(crmMData.Explore_Number_of_Agents__c):setCrmMainOppExploreAgents("");
        setCrmMainOppExplorePlan(""); // info not yet accessible in CRM, to be corrected later
        (crmMData.Sell_Number_of_Agents__c) ? setCrmMainOppSellAgents(crmMData.Sell_Number_of_Agents__c):setCrmMainOppSellAgents("");
        (crmMData.Sell_Plan__c) ? setCrmMainOppSellPlan(crmMData.Sell_Plan__c):setCrmMainOppSellPlan("");
        (crmMData.Red_Flags__c) ? setCrmMainOppSCNotes(crmMData.Red_Flags__c):setCrmMainOppSCNotes("");
        (crmMData.Manager_Notes__c) ? setCrmMainOppManagerNotes(crmMData.Manager_Notes__c):setCrmMainOppManagerNotes("");
        (crmMData.Next_Step__c) ? setCrmMainOppAENextSteps(crmMData.Next_Step__c):setCrmMainOppAENextSteps("");
        (crmMData.Compelling_Event__c) ? setCrmMainOppCompellingEvent(crmMData.Compelling_Event__c):setCrmMainOppCompellingEvent("");
        
        (crmMData.Account.Website) ? setCrmMainOppAccountWeb(crmMData.Account.Website):setCrmMainOppAccountWeb("");
        (crmMData.Account.Industry) ? setCrmMainOppAccountIndustry(crmMData.Account.Industry):setCrmMainOppAccountIndustry("");
        (crmMData.Account.Description) ? setCrmMainOppAccountDesc(crmMData.Account.Description):setCrmMainOppAccountDesc("");
        (crmMData.Account.Owner_Market_Segment__c) ? setCrmMainOppAccountOwnerMarketSegment(crmMData.Account.Owner_Market_Segment__c):setCrmMainOppAccountOwnerMarketSegment("");
        (crmMData.Account.Assigned_Territory_Full_Name__c) ? setCrmMainOppAccountAssignedTerritory(crmMData.Account.Assigned_Territory_Full_Name__c):setCrmMainOppAccountAssignedTerritory("");
        (crmMData.Account.Mgr_Team__c) ? setCrmMainOppAccountMgrTeam(crmMData.Account.Mgr_Team__c):setCrmMainOppAccountMgrTeam("");
        (crmMData.Name_of_SC__r) ? setCrmMainOppSCName(crmMData.Name_of_SC__r.Name):setCrmMainOppSCName("");
      

        debug("Refreshed data from Main CRM Opp Id = " + crmMOppId);
     
        if((!main && crmOppId)||(crmServicesOppId && crmServicesOppId.length>0)){
          let crmSOppId;
          if(crmOppId) {crmSOppId = crmOppId} 
          else {crmSOppId = crmServicesOppId}

          let crmSDataJson = await API.get("crm", "/crmget/" + config.CRM_CLIENT_KEY + "/" + crmSOppId + "/yes");
          let crmSData = crmSDataJson[0];

          (crmSData.Name) ? setCrmServicesOppName(crmSData.Name):setCrmServicesOppName("");
          (crmSData.StageName) ? setCrmServicesOppStage(crmSData.StageName):setCrmServicesOppStage("");
          (crmSData.CloseDate) ? setCrmServicesOppCloseDate(crmSData.CloseDate):setCrmServicesOppCloseDate("");
          (crmSData.Probability) ? setCrmServicesOppProbability(crmSData.Probability):setCrmServicesOppProbability("");
          if(crmSData.LastModifiedDate) {
            setCrmServicesOppLastModifDate(crmSData.LastModifiedDate);
            var crmServicesOppModifDate = new Date(crmSData.LastModifiedDate);
            setCrmServicesOppLastModifDateLocal(crmServicesOppModifDate.toLocaleDateString() + " " + crmServicesOppModifDate.toLocaleTimeString());
          }
          else {
            setCrmServicesOppLastModifDate("");
            setCrmServicesOppLastModifDateLocal("");
          }
          (crmSData.ProServ_Contact__c) ? setCrmScopingContactId(crmSData.ProServ_Contact__c):setCrmScopingContactId("");
          (crmSData.Services_Estimate__c) ? setCrmServicesEstimates(crmSData.Services_Estimate__c):setCrmServicesEstimates("");
          (crmSData.Zuora_Services_Plan_Subtotal__c) ? setCrmServicesPlanSubTotal(crmSData.Zuora_Services_Plan_Subtotal__c):setCrmServicesPlanSubTotal("");
          (crmSData.Zuora_Services_Plan_Subtotal__c) ? setCrmServicesDiscount(Math.round((parseFloat(crmSData.Zuora_Services_Plan_Subtotal__c)-parseFloat(crmSData.Zuora_Services_Plan_Total__c))*100/parseFloat(crmMData.Zuora_Services_Plan_Subtotal__c))):setCrmServicesDiscount("");
          (crmSData.Zuora_Services_Plan_Total__c) ? setCrmServicesPlanTotal(crmSData.Zuora_Services_Plan_Total__c):setCrmServicesPlanTotal("");
          (crmSData.Confidence_to_Close__c) ? setCrmServicesProbability(crmSData.Confidence_to_Close__c):setCrmServicesProbability("");
          (crmSData.Services_Due_to_Partner__c) ? setCrmServicesPartnerDue(crmSData.Services_Due_to_Partner__c):setCrmServicesPartnerDue("");
          (crmSData.Services_Due_to_Zendesk__c) ? setCrmServicesDue(crmSData.Services_Due_to_Zendesk__c):setCrmServicesDue("");
          (crmSData.SOW_Type__c) ? setCrmServicesSOWType(crmSData.SOW_Type__c):setCrmServicesSOWType("");
          (crmSData.Contract_Type__c) ? setCrmServicesContractType(crmSData.Contract_Type__c):setCrmServicesContractType("");
          (crmSData.AE_Implementation_Notes__c) ? setCrmServicesNotes(crmSData.AE_Implementation_Notes__c):setCrmServicesNotes("");
          (crmSData.Service_Order_Notes__c) ? setCrmServicesScopingNextSteps(crmSData.Service_Order_Notes__c):setCrmServicesScopingNextSteps("");
          (crmSData.ProServ_Contact__r) ? setCrmServicesSAName(crmSData.ProServ_Contact__r.Name):setCrmServicesSAName("");

          debug("Refreshed data from Service CRM Opp Id = " + crmSOppId);

        } else {
          (crmMData.ProServ_Contact__c) ? setCrmScopingContactId(crmMData.ProServ_Contact__c):setCrmScopingContactId("");
          (crmMData.Services_Estimate__c) ? setCrmServicesEstimates(crmMData.Services_Estimate__c):setCrmServicesEstimates("");
          (crmMData.Zuora_Services_Plan_Subtotal__c) ? setCrmServicesPlanSubTotal(crmMData.Zuora_Services_Plan_Subtotal__c):setCrmServicesPlanSubTotal("");
          (crmMData.Zuora_Services_Plan_Subtotal__c) ? setCrmServicesDiscount(Math.round((parseFloat(crmMData.Zuora_Services_Plan_Subtotal__c)-parseFloat(crmMData.Zuora_Services_Plan_Total__c))*100/parseFloat(crmMData.Zuora_Services_Plan_Subtotal__c))):setCrmServicesDiscount("");
          (crmMData.Zuora_Services_Plan_Total__c) ? setCrmServicesPlanTotal(crmMData.Zuora_Services_Plan_Total__c):setCrmServicesPlanTotal("");
          (crmMData.Confidence_to_Close__c) ? setCrmServicesProbability(crmMData.Confidence_to_Close__c):setCrmServicesProbability("");
          (crmMData.Services_Due_to_Partner__c) ? setCrmServicesPartnerDue(crmMData.Services_Due_to_Partner__c):setCrmServicesPartnerDue("0");
          (crmMData.Services_Due_to_Zendesk__c) ? setCrmServicesDue(crmMData.Services_Due_to_Zendesk__c):setCrmServicesDue("");
          (crmMData.SOW_Type__c) ? setCrmServicesSOWType(crmMData.SOW_Type__c):setCrmServicesSOWType("");
          (crmMData.Contract_Type__c) ? setCrmServicesContractType(crmMData.Contract_Type__c):setCrmServicesContractType("");
          (crmMData.AE_Implementation_Notes__c) ? setCrmServicesNotes(crmMData.AE_Implementation_Notes__c):setCrmServicesNotes("");
          (crmMData.Service_Order_Notes__c) ? setCrmServicesScopingNextSteps(crmMData.Service_Order_Notes__c):setCrmServicesScopingNextSteps("");
          (crmMData.ProServ_Contact__r) ? setCrmServicesSAName(crmMData.ProServ_Contact__r.Name):setCrmServicesSAName("");
        } 

        var isoDateTime = new Date();
        setCrmSyncedAt(isoDateTime.toISOString());
        setCrmSyncedAtLocal(isoDateTime.toLocaleDateString() + " " + isoDateTime.toLocaleTimeString());
        
        setIsEdited(true);

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

  function handleAvatarZoomChange(event) {
    setAvatarZoom(event.target.value);
    setAvatarEdited(true);
    setIsEdited(true)
  }
  
  function handleFileChange(event) {

    file.current = event.target.files[0];

    if (file.current) {
      // Check if file is a supported image
      const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
      if (validImageTypes.includes(file.current['type'])) {

        if (file.current.size > config.MAX_ATTACHMENT_SIZE) {
          props.setAlertMessage(
            `Profile Picture is too large, it should be smaller than ${config.MAX_ATTACHMENT_SIZE /
              1000000} MB.`);
          props.setAlertVisible(false);
          setFileValid(false);
          file.current = null;
          return;
        }
        props.setAlertVisible(false);
        setFileValid(true);
        setIsEdited(true)
      }
      else {
        props.setAlertMessage("Profile Picture format not supported. Please use png, jpeg or gif !");
        props.setAlertVisible(true);
        setFileValid(false);
        file.current = null;
      }
    } 
    // Reset Avatar editor
    setAvatarZoom(1);
    if(avatarRotate===0){setAvatarRotate(360);}
    else {setAvatarRotate(0)};
  }


  /********************************************
   ***         Scope CUD Operations         ***
   ********************************************/
  
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
      
      // Save to S3 edited picture from Avatar editor
      if (avatarEditor) {
        // This returns a HTMLCanvasElement, it can be made into a data URL or a blob,
        // drawn on another canvas, or added to the DOM.
        // getImageScaledToCanvas() is used to get image resized to the canvas size (also a HTMLCanvasElement)
        const canvasScaled = avatarEditor.getImageScaledToCanvas();
        var dataUrl = canvasScaled.toDataURL();
        var blobData = dataURItoBlob(dataUrl);
        // A new file was uploaded
        if(fileValid && file.current){
          attachment = await s3BlobUpload(file.current.name, blobData, file.current.type);
          // Clear old attachmnent
          if(scope.attachment){
            await s3Remove(scope.attachment);
          }  
        }
        // Existing Picture was modified
        else if(scope.attachment && avatarEdited){
          // Save to S3 new attachment
          attachment = await s3BlobUpload(formatFilename(scope.attachment), blobData, "image/png");
          // Clear old attachmnent
          await s3Remove(scope.attachment);
        }
      }

      // Refresh scope with forms values
      if(scopeName && scopeName!=="" && scopeName!=="New Scope"){
        scope.scopeName = scopeName;
      } else {
        if(crmMainOppAccountName) { 
          setScopeName(crmMainOppAccountName);
          scope.scopeName = crmMainOppAccountName;
        } else {
          setScopeName("New Scope");
          scope.scopeName = "New Scope";
        }
      }
      scope.crmSyncedAt = crmSyncedAt?crmSyncedAt:"";
      scope.crmMainOppId = crmMainOppId?crmMainOppId:"";
      scope.crmMainOppName = crmMainOppName?crmMainOppName:"";
      scope.crmMainOppType = crmMainOppType?crmMainOppType:"";
      scope.crmMainOppStage = crmMainOppStage?crmMainOppStage:"";
      scope.crmMainOppCloseDate = crmMainOppCloseDate?crmMainOppCloseDate:"";
      scope.crmMainOppProbability = crmMainOppProbability?crmMainOppProbability:"";
      scope.crmMainOppForecastCat = crmMainOppForecastCat?crmMainOppForecastCat:"";
      scope.crmMainOppServicesReq = crmMainOppServicesReq?crmMainOppServicesReq:"";
      scope.crmMainOppLastModifDate = crmMainOppLastModifDate?crmMainOppLastModifDate:"";
      scope.crmMainOppAccountName = crmMainOppAccountName?crmMainOppAccountName:"";
      scope.crmMainOppRegion = crmMainOppRegion?crmMainOppRegion:"";
      scope.crmMainOppOwnerName = crmMainOppOwnerName?crmMainOppOwnerName:"";
      scope.crmMainOppMRR = crmMainOppMRR?crmMainOppMRR:"";
      scope.crmMainOppMRRinUSD = crmMainOppMRRinUSD?crmMainOppMRRinUSD:"";
      scope.crmMainOppCurrency = crmMainOppCurrency?crmMainOppCurrency:"";
      scope.crmMainOppDiscount = crmMainOppDiscount?crmMainOppDiscount:"";
      scope.crmMainOppMEDDPICC = crmMainOppMEDDPICC?crmMainOppMEDDPICC:"";
      scope.crmMainOppDScore = crmMainOppDScore?crmMainOppDScore:"";
      scope.crmMainOppSupportAgents = crmMainOppSupportAgents?crmMainOppSupportAgents:"";
      scope.crmMainOppSupportPlan = crmMainOppSupportPlan?crmMainOppSupportPlan:"";
      scope.crmMainOppChatAgents = crmMainOppChatAgents?crmMainOppChatAgents:"";
      scope.crmMainOppChatPlan = crmMainOppChatPlan?crmMainOppChatPlan:"";
      scope.crmMainOppTalkAgents = crmMainOppTalkAgents?crmMainOppTalkAgents:"";
      scope.crmMainOppTalkPlan = crmMainOppTalkPlan?crmMainOppTalkPlan:"";
      scope.crmMainOppGuideAgents = crmMainOppGuideAgents?crmMainOppGuideAgents:"";
      scope.crmMainOppGuidePlan = crmMainOppGuidePlan?crmMainOppGuidePlan:"";
      scope.crmMainOppExploreAgents = crmMainOppExploreAgents?crmMainOppExploreAgents:"";
      scope.crmMainOppExplorePlan = crmMainOppExplorePlan?crmMainOppExplorePlan:"";
      scope.crmMainOppSellAgents = crmMainOppSellAgents?crmMainOppSellAgents:"";
      scope.crmMainOppSellPlan = crmMainOppSellPlan?crmMainOppSellPlan:"";
      scope.crmMainOppSCNotes = crmMainOppSCNotes?crmMainOppSCNotes:"";
      scope.crmMainOppManagerNotes = crmMainOppManagerNotes?crmMainOppManagerNotes:"";
      scope.crmMainOppAENextSteps = crmMainOppAENextSteps?crmMainOppAENextSteps:"";
      scope.crmMainOppCompellingEvent = crmMainOppCompellingEvent?crmMainOppCompellingEvent:"";
      scope.crmMainOppAccountWeb = crmMainOppAccountWeb?crmMainOppAccountWeb:"";
      scope.crmMainOppAccountIndustry = crmMainOppAccountIndustry?crmMainOppAccountIndustry:"";
      scope.crmMainOppAccountDesc = crmMainOppAccountDesc?crmMainOppAccountDesc:"";
      scope.crmMainOppAccountOwnerMarketSegment = crmMainOppAccountOwnerMarketSegment?crmMainOppAccountOwnerMarketSegment:"";
      scope.crmMainOppAccountAssignedTerritory = crmMainOppAccountAssignedTerritory?crmMainOppAccountAssignedTerritory:"";
      scope.crmMainOppAccountMgrTeam = crmMainOppAccountMgrTeam?crmMainOppAccountMgrTeam:"";
      scope.crmMainOppSCName = crmMainOppSCName?crmMainOppSCName:"";
      scope.crmServicesOppId = crmServicesOppId?crmServicesOppId:"";
      scope.crmServicesOppName = crmServicesOppName?crmServicesOppName:"";
      scope.crmServicesOppStage = crmServicesOppStage?crmServicesOppStage:"";
      scope.crmServicesOppCloseDate = crmServicesOppCloseDate?crmServicesOppCloseDate:"";
      scope.crmServicesOppProbability = crmServicesOppProbability?crmServicesOppProbability:"";
      scope.crmServicesOppLastModifDate = crmServicesOppLastModifDate?crmServicesOppLastModifDate:"";
      scope.crmScopingContactId = crmScopingContactId?crmScopingContactId:"";
      scope.crmServicesEstimates = crmServicesEstimates?crmServicesEstimates:"";
      scope.crmServicesPlanSubTotal = crmServicesPlanSubTotal?crmServicesPlanSubTotal:"";
      scope.crmServicesPlanTotal = crmServicesPlanTotal?crmServicesPlanTotal:"";
      scope.crmServicesProbability = crmServicesProbability?crmServicesProbability:"";
      scope.crmServicesPartnerDue = crmServicesPartnerDue?crmServicesPartnerDue:"";
      scope.crmServicesDue = crmServicesDue?crmServicesDue:"";
      scope.crmServicesSOWType = crmServicesSOWType?crmServicesSOWType:"";
      scope.crmServicesContractType = crmServicesContractType?crmServicesContractType:"";
      scope.crmServicesNotes = crmServicesNotes?crmServicesNotes:"";
      scope.crmServicesScopingNextSteps = crmServicesScopingNextSteps?crmServicesScopingNextSteps:"";
      scope.crmServicesSAName = crmServicesSAName?crmServicesSAName:"";

      if(attachment) scope.attachment = attachment;

      if(isNewScope){
        await createScope(scope);
        setIsNewScope(false);
      } 
      else  {
        await saveScope(scope);
      } 
      setScopeNameEdit(false);
      props.setAlertVisible(false);
      setIsEdited(false);
      setIsLoading(false);

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
      if(scope.attachment){
        await s3Remove(scope.attachment);
      }  
      await deleteScope();

      props.setAlertVisible(false);
      props.history.push("/");

    } catch (e) {
      props.setAlertMessage(e.message);
      props.setAlertVisible(true);
      setIsDeleting(false);
    }
  }


  /**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**/
  /**--**--**--**--**--**--**--**--*   J S X   E L E M E N T S  *--**--**--**--**--**--**--**--**--**/
  /**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**--**/

 
  /*******************************
   *** Main Scope JSX Elements ***
   *******************************/
  return (
    
    <div className="Scopes">
      <Modal isOpen={saveModal} toggle={saveModalToggle}>
        <ModalHeader toggle={saveModalToggle}>Unsaved Changes</ModalHeader>
        <ModalBody>
        Warning there are unsaved changes!
        Do you want to leave anyway ?
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveModalLeave}>Leave and Lose Changes</Button>{' '}
          <Button color="secondary" onClick={saveModalToggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
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
          })}
          onSubmit={values => {
            handleSubmit(values);
          }}
        >
          {({ errors, touched, handleSubmit}) => (
            <Form onSubmit={handleSubmit}>
              <Navbar color="light" light expand="md">
                <NavbarBrand onDoubleClick={() => setScopeNameEdit(true)}>
                {scopeNameEdit && <Input type="text" name="scopeName" value={scopeName} onChange={function(event){setScopeName(event.target.value);setIsEdited(true)}} placeholder="Scope Name" size="40"   autoFocus={isNewScope}/>}
                {!scopeNameEdit && logoURL &&
                  <><img alt="" src={logoURL} crossOrigin="anonymous" width="100" height="25" className="d-inline-block align-top"/>&nbsp;&nbsp;</>
                }
                {!scopeNameEdit && <font className="badgeheader"><Badge color="primary" pill>&nbsp;&nbsp;{scopeName}&nbsp;&nbsp;</Badge></font>}
                </NavbarBrand>
                <NavbarToggler onClick={navtoggle} />
                <Collapse isOpen={isNavbarOpen} navbar>
                  <Nav className="ml-auto" navbar>
                    <UncontrolledDropdown nav inNavbar>
                      <DropdownToggle nav caret>
                        Actions
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem onClick={handleSubmit} disabled={isLoading||!isEdited}>
                          Save Scope
                        </DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem onClick={handleDelete} disabled={isLoading||isDeleting}>
                          Delete Scope
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
                  {crmMainOppId && (<Badge color="light">Last CRM Sync:&nbsp;&nbsp;{crmSyncedAtLocal}</Badge>)}
                  <p/>
                  {crmMainOppId && (
                    <InputGroup>
                      <InputGroupAddon addonType="prepend"><Button color="primary" onClick={openMainCrmLink}>&nbsp;&nbsp;&nbsp;Main Opportunity&nbsp;&nbsp;&nbsp;</Button></InputGroupAddon>
                      <Input type="text" name="crmMainOppName" value={crmMainOppName} className="maincrminput" bsSize="sm" readOnly/>
                    </InputGroup>  
                  )}
                  <br/> 
                  <Row form>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmMainOppAccountName"><small>Account</small></Label>
                        <Input type="text" name="crmMainOppAccountName" value={crmMainOppAccountName} onChange={function(event){setCrmMainOppAccountName(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId?true:false} className="maincrminput"/>
                      </FormGroup>
                    </Col>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmMainOppType"><small>Type</small></Label>
                        <Input type="select" name="crmMainOppType" value={crmMainOppType} placeholder="Select" onChange={function(event){setCrmMainOppType(event.target.value);setIsEdited(true)}} disabled={crmMainOppId?true:false} className="maincrmselect">
                          <option value="" disabled>Select</option>
                          <option>New Business</option>
                          <option>Expansion</option>
                          <option>Contraction</option>
                          <option>Services Only</option>
                          <option>Reactivation</option>
                          <option>Admin</option>
                          <option>Renewal</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmMainOppRegion"><small>Region</small></Label>
                        <Input type="select" name="crmMainOppRegion" value={crmMainOppRegion} placeholder="Select" onChange={function(event){setCrmMainOppRegion(event.target.value);setIsEdited(true)}} disabled={crmMainOppId?true:false} className="maincrmselect">
                          <option value="" disabled>Select</option>
                          <option>Americas</option>
                          <option>APAC</option>
                          <option>EMEA</option>
                          <option>LATAM</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmMainOppAccountOwnerMarketSegment"><small>Segment</small></Label>
                        <Input type="text" name="crmMainOppAccountOwnerMarketSegment" value={crmMainOppAccountOwnerMarketSegment} onChange={function(event){setCrmMainOppAccountOwnerMarketSegment(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId?true:false} className="maincrminput"/>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row form>
                    <Col md={3}> 
                      <Label for="MRR"><small>MRR</small></Label>
                      <InputGroup name="MRR">
                        <Input type="number" name="crmMainOppMRR" value={crmMainOppMRR} onChange={function(event){setCrmMainOppMRR(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId?true:false} className="maincrminput"/>
                        <InputGroupAddon addonType="append">
                          <Input type="select" name="crmMainOppCurrency" value={crmMainOppCurrency} placeholder="?" onChange={function(event){setCrmMainOppCurrency(event.target.value);setIsEdited(true)}} disabled={crmMainOppId?true:false} className="maincrmselect">
                            <option value="" disabled>?</option>
                            <option>AUD</option>
                            <option>EUR</option>
                            <option>GBP</option>
                            <option>JPY</option>
                            <option>USD</option>
                          </Input>
                        </InputGroupAddon>
                      </InputGroup>  
                    </Col>
                    <Col md={3}> 
                      <Label for="ARR"><small>ARR</small></Label>
                      <InputGroup name="ARR">
                        <Input type="number" name="crmMainOppARR" value={crmMainOppARR} onChange={function(event){setCrmMainOppARR(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId?true:false} className="maincrminput"/>
                        <InputGroupAddon addonType="append">
                          <Input type="select" name="crmMainOppCurrency" value={crmMainOppCurrency} placeholder="?" onChange={function(event){setCrmMainOppCurrency(event.target.value);setIsEdited(true)}} disabled={crmMainOppId?true:false} className="maincrmselect">
                            <option value="" disabled>?</option>
                            <option>AUD</option>
                            <option>EUR</option>
                            <option>GBP</option>
                            <option>JPY</option>
                            <option>USD</option>
                          </Input>
                        </InputGroupAddon>
                      </InputGroup>  
                    </Col>
                    {!crmMainOppId && (
                      <Col md={2}> 
                        <FormGroup>
                          <Label for="crmMainOppDiscount"><small>Discount - {crmMainOppDiscount}%</small></Label>
                          <Input type="range" name="crmMainOppDiscount" value={crmMainOppDiscount} onChange={function(event){setCrmMainOppDiscount(event.target.value);setIsEdited(true)}} bsSize="sm" min="0" max="100" step="1" />
                        </FormGroup>
                      </Col>
                    )}
                    {crmMainOppId && (
                      <Col md={2}> 
                        <Label for="Discount"><small>Discount</small></Label>
                        <InputGroup name="Discount">
                          <Input type="number" name="crmMainOppDiscount" value={crmMainOppDiscount} bsSize="sm" readOnly className="maincrminput"/>
                          <InputGroupAddon addonType="append">
                          <InputGroupText className="maincrminput">%</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>  
                      </Col>
                    )}
                    <Col md={4}> 
                      <FormGroup>
                        <Label for="crmMainOppAccountAssignedTerritory"><small>Territory</small></Label>
                        <Input type="text" name="crmMainOppAccountAssignedTerritory" value={crmMainOppAccountAssignedTerritory} onChange={function(event){setCrmMainOppAccountAssignedTerritory(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId?true:false} className="maincrminput"/>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row form>
                    <Col md={3}> 
                    <FormGroup>
                        <Label for="crmMainOppStage"><small>Stage</small></Label>
                        <Input type="select" name="crmMainOppStage" value={crmMainOppStage} placeholder="Select" onChange={function(event){setCrmMainOppStage(event.target.value);setIsEdited(true)}} disabled={crmMainOppId?true:false} className="maincrmselect">
                         <option value="" disabled>Select</option>
                          <option>01 - Qualifying</option>
                          <option>02 - Discovery</option>
                          <option>03 - Solution Review</option>
                          <option>04 - Solution Validation</option>
                          <option>05 - Contracting / Verbal</option>
                          <option>06 - Signed</option>
                          <option>07 - Closed</option>
                          <option>Lost</option>
                          <option>Failed Finance</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmMainOppCloseDate"><small>Close Date</small></Label>
                        <Input type="date" name="crmMainOppCloseDate" value={crmMainOppCloseDate} onChange={function(event){setCrmMainOppCloseDate(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId?true:false} className="maincrminput"/>
                      </FormGroup>
                    </Col>
                    {!crmMainOppId && (
                      <Col md={3}> 
                        <FormGroup>
                          <Label for="crmMainOppProbability"><small>Sales Probability - {crmMainOppProbability}%</small></Label>
                          <Input type="range" name="crmMainOppProbability" value={crmMainOppProbability} onChange={function(event){setCrmMainOppProbability(event.target.value);setIsEdited(true)}} bsSize="sm" min="0" max="100" step="5"/>
                        </FormGroup>
                      </Col>
                    )}
                    {crmMainOppId && (
                      <Col md={3}> 
                        <Label for="salesProbability"><small>Sales Probability</small></Label>
                        <InputGroup name="salesProbability">
                          <Input type="number" name="crmMainOppProbability" value={crmMainOppProbability} bsSize="sm" readOnly className="maincrminput"/>
                          <InputGroupAddon addonType="append">
                          <InputGroupText className="maincrminput">%</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>  
                      </Col>
                    )}
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmMainOppForecastCat"><small>Forecast</small></Label>
                        <Input type="select" name="crmMainOppForecastCat" value={crmMainOppForecastCat} placeholder="Select" onChange={function(event){setCrmMainOppForecastCat(event.target.value);setIsEdited(true)}} disabled={crmMainOppId?true:false} className="maincrmselect">
                          <option value="" disabled>Select</option>
                          <option>Omitted</option>
                          <option>Pipeline</option>
                          <option>Best Case</option>
                          <option>Commit</option>
                          <option>Closed</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row form>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmMainOppOwnerName"><small>Account Executive</small></Label>
                        <Input type="text" name="crmMainOppOwnerName" value={crmMainOppOwnerName} onChange={function(event){setCrmMainOppOwnerName(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId?true:false} className="maincrminput"/>
                      </FormGroup>
                    </Col>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmMainOppMEDDPICC"><small>MEDDPICC</small></Label>
                        <Input type="number" name="crmMainOppMEDDPICC" value={crmMainOppMEDDPICC} onChange={function(event){setCrmMainOppMEDDPICC(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId?true:false} className="maincrminput"/>
                      </FormGroup>
                    </Col>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmMainOppSCName"><small>Solution Consultant</small></Label>
                        <Input type="text" name="crmMainOppSCName" value={crmMainOppSCName} onChange={function(event){setCrmMainOppSCName(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId?true:false} className="maincrminput"/>
                      </FormGroup>
                    </Col>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmMainOppDScore"><small>DScore</small></Label>
                        <Input type="number" name="crmMainOppDScore" value={crmMainOppDScore} onChange={function(event){setCrmMainOppDScore(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId?true:false} className="maincrminput"/>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row form>
                    {!crmServicesOppId && (
                      <Col md={3}> 
                        <FormGroup check>
                          <Label check>
                          <Input type="checkbox" name="crmMainOppServicesReq" checked={crmMainOppServicesReq} onChange={function(event){setCrmMainOppServicesReq(event.target.value);setIsEdited(true)}} />
                            &nbsp;&nbsp;Services Required
                          </Label>
                        </FormGroup>
                      </Col>
                    )}
                    {crmServicesOppId && (<Col md={3}/>)}
                    <Col md={3}/>
                    <Col md={3}/>  
                    {crmServicesOppId && (
                      <Col md={3}> 
                        <Badge color="light">Main Opp Modif:&nbsp;&nbsp;{crmMainOppLastModifDateLocal}</Badge>
                      </Col>
                    )}
                  </Row>
                  {crmServicesOppId && (<br/>)}
                  {crmServicesOppId && (
                    <InputGroup>
                      <InputGroupAddon addonType="prepend"><Button color="success" onClick={openServicesCrmLink}>Services Opportunity</Button></InputGroupAddon>
                      <Input type="text" name="crmServicesOppName" value={crmServicesOppName} className="servicescrminput" bsSize="sm" readOnly/>
                    </InputGroup> 
                  )}
                  <br/> 
                  {crmServicesOppId && (
                    <Row form>
                      <Col md={3}> 
                        <FormGroup>
                          <Label for="crmServicesOppStage"><small>Stage</small></Label>
                          <Input type="select" name="crmServicesOppStage" value={crmServicesOppStage} placeholder="Select" disabled className="servicescrmselect">
                          <option value="" disabled>Select</option>
                            <option>01 - Qualifying</option>
                            <option>02 - Discovery</option>
                            <option>03 - Solution Review</option>
                            <option>04 - Solution Validation</option>
                            <option>05 - Contracting / Verbal</option>
                            <option>06 - Signed</option>
                            <option>07 - Closed</option>
                            <option>Lost</option>
                            <option>Failed Finance</option>
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col md={3}> 
                        <FormGroup>
                          <Label for="crmServicesOppCloseDate"><small>Close Date</small></Label>
                          <Input type="date" name="crmServicesOppCloseDate" value={crmServicesOppCloseDate} bsSize="sm" readOnly className="servicescrminput"/>
                        </FormGroup>
                      </Col>
                      <Col md={3}> 
                        <Label for="salesSProbability"><small>Sales Probability</small></Label>
                        <InputGroup name="salesSProbability">
                          <Input type="number" name="crmServicesOppProbability" value={crmServicesOppProbability} bsSize="sm" readOnly className="servicescrminput"/>
                          <InputGroupAddon addonType="append">
                          <InputGroupText className="servicescrminput">%</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>  
                      </Col>
                    </Row> 
                  )} 
                  <Row form>
                    <Col md={3}> 
                      <Label for="servicesPlanSub"><small>Services Plan Subtotal</small></Label>
                      <InputGroup name="servicesPlanSub">
                        <Input type="number" name="crmServicesPlanSubTotal" value={crmServicesPlanSubTotal} onChange={function(event){setCrmServicesPlanSubTotal(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId||crmServicesOppId?true:false} className={crmServicesOppId?"servicescrminput":"maincrminput"}/>
                        <InputGroupAddon addonType="append">
                          <Input type="select" name="crmMainOppCurrency" value={crmMainOppCurrency} placeholder="?" onChange={function(event){setCrmMainOppCurrency(event.target.value);setIsEdited(true)}} disabled={crmMainOppId||crmServicesOppId?true:false} className={crmServicesOppId?"servicescrmselect":"maincrmselect"}>
                            <option value="" disabled>?</option>
                            <option>AUD</option>
                            <option>EUR</option>
                            <option>GBP</option>
                            <option>JPY</option>
                            <option>USD</option>
                          </Input>
                        </InputGroupAddon>
                      </InputGroup>  
                    </Col>
                    <Col md={3}> 
                      <Label for="ServicesDiscount"><small>Services Discount</small></Label>
                      <InputGroup name="ServicesDiscount">
                        <Input type="number" name="crmServicesDiscount" value={crmServicesDiscount} bsSize="sm" readOnly className={crmServicesOppId?"servicescrminput":"maincrminput"}/>
                        <InputGroupAddon addonType="append">
                        <InputGroupText className={crmServicesOppId?"servicescrminput":"maincrminput"}>%</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>  
                    </Col>
                    <Col md={3}> 
                    <Label for="servicesPlan"><small>Services Plan Total</small></Label>
                      <InputGroup name="servicesPlan">
                        <Input type="number" name="crmServicesPlanTotal" value={crmServicesPlanTotal} onChange={function(event){setCrmServicesPlanTotal(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId||crmServicesOppId?true:false} className={crmServicesOppId?"servicescrminput":"maincrminput"}/>
                        <InputGroupAddon addonType="append">
                          <Input type="select" name="crmMainOppCurrency" value={crmMainOppCurrency} placeholder="?" onChange={function(event){setCrmMainOppCurrency(event.target.value);setIsEdited(true)}} disabled={crmMainOppId||crmServicesOppId?true:false} className={crmServicesOppId?"servicescrmselect":"maincrmselect"}>
                            <option value="" disabled>?</option>
                            <option>AUD</option>
                            <option>EUR</option>
                            <option>GBP</option>
                            <option>JPY</option>
                            <option>USD</option>
                          </Input>
                        </InputGroupAddon>
                      </InputGroup>  
                    </Col>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmServicesSAName"><small>Solutions Architect</small></Label>
                        <Input type="text" name="crmServicesSAName" value={crmServicesSAName} onChange={function(event){setCrmServicesSAName(event.target.value);setIsEdited(true)}} bsSize="sm" readOnly={crmMainOppId||crmServicesOppId?true:false} className={crmServicesOppId?"servicescrminput":"maincrminput"}/>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row form>
                    <Col md={3}> 
                      <Label for="servicesEstimates"><small>Services Estimates</small></Label>
                      <InputGroup name="servicesEstimates">
                        <Input type="number" name="crmServicesEstimates" value={crmServicesEstimates} onChange={function(event){setCrmServicesEstimates(event.target.value);setIsEdited(true)}} bsSize="sm" className={crmServicesOppId?"servicessyncablecrminput":"mainsyncablecrminput"}/>
                        <InputGroupAddon addonType="append">
                          <Input type="select" name="crmMainOppCurrency" value={crmMainOppCurrency} placeholder="?" onChange={function(event){setCrmMainOppCurrency(event.target.value);setIsEdited(true)}} className={crmServicesOppId?"servicessyncablecrminput":"mainsyncablecrminput"}>
                            <option value="" disabled>?</option>
                            <option>AUD</option>
                            <option>EUR</option>
                            <option>GBP</option>
                            <option>JPY</option>
                            <option>USD</option>
                          </Input>
                        </InputGroupAddon>
                      </InputGroup>  
                    </Col>
                    <Col md={3}> 
                      <Label for="ServicesProbability"><small>Services Probability</small></Label>
                      <InputGroup name="ServicesProbability">
                        <Input type="select" name="crmServicesProbability" value={crmServicesProbability} placeholder="Select" onChange={function(event){setCrmServicesProbability(event.target.value);setIsEdited(true)}} className={crmServicesOppId?"servicessyncablecrminput":"mainsyncablecrminput"}>
                          <option value="" disabled>Select</option>
                          <option>5</option>
                          <option>25</option>
                          <option>50</option>
                          <option>75</option>
                          <option>90</option>
                        </Input>
                        <InputGroupAddon addonType="append">
                          <InputGroupText className={crmServicesOppId?"servicessyncablecrminput":"mainsyncablecrminput"}>%</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>  
                    </Col>
                    <Col md={3}> 
                      <Label for="ServicesPartnerDue"><small>Partner Due</small></Label>
                      <InputGroup name="ServicesPartnerDue">
                        <Input type="number" name="crmServicesPartnerDue" value={crmServicesPartnerDue} onChange={function(event){setCrmServicesPartnerDue(event.target.value);setIsEdited(true)}} bsSize="sm" className={crmServicesOppId?"servicessyncablecrminput":"mainsyncablecrminput"}/>
                        <InputGroupAddon addonType="append">
                          <Input type="select" name="crmMainOppCurrency" value={crmMainOppCurrency} placeholder="?" onChange={function(event){setCrmMainOppCurrency(event.target.value);setIsEdited(true)}} className={crmServicesOppId?"servicessyncablecrminput":"mainsyncablecrminput"}>
                            <option value="" disabled>?</option>
                            <option>AUD</option>
                            <option>EUR</option>
                            <option>GBP</option>
                            <option>JPY</option>
                            <option>USD</option>
                          </Input>
                        </InputGroupAddon>
                      </InputGroup>  
                    </Col>
                    <Col md={3}> 
                      <Label for="servicesDue"><small>Services Due</small></Label>
                      <InputGroup name="servicesDue">
                        <Input type="number" name="crmServicesDue" value={crmServicesDue} onChange={function(event){setCrmServicesDue(event.target.value);setIsEdited(true)}} bsSize="sm" className={crmServicesOppId?"servicessyncablecrminput":"mainsyncablecrminput"}/>
                        <InputGroupAddon addonType="append">
                          <Input type="select" name="crmMainOppCurrency" value={crmMainOppCurrency} placeholder="?" onChange={function(event){setCrmMainOppCurrency(event.target.value);setIsEdited(true)}} className={crmServicesOppId?"servicessyncablecrminput":"mainsyncablecrminput"}>
                            <option value="" disabled>?</option>
                            <option>AUD</option>
                            <option>EUR</option>
                            <option>GBP</option>
                            <option>JPY</option>
                            <option>USD</option>
                          </Input>
                        </InputGroupAddon>
                      </InputGroup>  
                    </Col>
                  </Row>
                  <Row>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmServicesSOWType"><small>SOW Type</small></Label>
                        <Input type="select" name="crmServicesSOWType" value={crmServicesSOWType} placeholder="Select" onChange={function(event){setCrmServicesSOWType(event.target.value);setIsEdited(true)}} className={crmServicesOppId?"servicessyncablecrminput":"mainsyncablecrminput"}>
                         <option value="" disabled>Select</option>
                          <option>Package</option>
                          <option>Custom</option>
                          <option>Change Order</option>
                          <option>Change Order - No Impact</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}> 
                      <FormGroup>
                        <Label for="crmServicesContractType"><small>Contract Type</small></Label>
                        <Input type="select" name="crmServicesContractType" value={crmServicesContractType} placeholder="Select" onChange={function(event){setCrmServicesContractType(event.target.value);setIsEdited(true)}} className={crmServicesOppId?"servicessyncablecrminput":"mainsyncablecrminput"}>
                         <option value="" disabled>Select</option>
                          <option>Fixed Fee</option>
                          <option>T&M</option>
                          <option>Managed Services</option>
                          <option>Fixed Fee Milestone</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  {crmServicesOppId && (
                    <Row>
                      <Col md={3}/><Col md={3}/><Col md={3}/>   
                      <Col md={3}> 
                          <Badge color="light" name="crmServicesOppLastModifDate">Service Opp Modif:&nbsp;&nbsp;{crmServicesOppLastModifDateLocal}</Badge>
                      </Col>
                    </Row>
                  )}
                   {crmMainOppId && !crmServicesOppId && (
                    <Row>
                      <Col md={3}/><Col md={3}/><Col md={3}/>   
                      <Col md={3}> 
                          <Badge color="light" name="crmMainOppLastModifDate">Main Opp Modif:&nbsp;&nbsp;{crmMainOppLastModifDateLocal}</Badge>
                      </Col>
                    </Row>
                  )}
                  <br/>
                  {crmMainOppId && (
                    <Row form>
                      <Col md={4}>
                        <FormGroup>
                          <Label for="crmMainOppManagerNotes"><small>Sales Manager Notes</small></Label>
                          <Input type="textarea" name="crmMainOppManagerNotes" value={crmMainOppManagerNotes} bssize="sm" readOnly className="maincrmtextarea"/>
                        </FormGroup>
                      </Col>
                      <Col md={4}>
                        <FormGroup>
                          <Label for="crmMainOppAENextSteps"><small>AE Next Steps</small></Label>
                          <Input type="textarea" name="crmMainOppAENextSteps" value={crmMainOppAENextSteps} bsSize="sm" readOnly className="maincrmtextarea"/>
                        </FormGroup>
                      </Col>
                      <Col md={4}>
                        <FormGroup>
                          <Label for="crmMainOppSCNotes"><small>SC Notes</small></Label>
                          <Input type="textarea" name="crmMainOppSCNotes" value={crmMainOppSCNotes} bsSize="sm" readOnly className="maincrmtextarea"/>
                        </FormGroup>
                      </Col>
                    </Row>
                  )}
                  <br/> 
                </TabPane>
                <TabPane tabId="scoping">
                  <br/>
                  <FormGroup>
                    <Card>
                      <CardHeader>Account Logo&nbsp;&nbsp;&nbsp;<Badge color="secondary" pill>{(fileValid && file.current)? ("New picture"):(scope.attachment?(formatFilename(scope.attachment)):("No picture uploaded"))}</Badge></CardHeader>
                      <CardBody>
                        <AvatarEditor
                          ref={setAvatarEditorRef}
                          image={(fileValid && file.current)? (file.current):(logoURL)}
                          width={400}
                          height={100}
                          border={20}
                          color={[255, 255, 255, 0.6]} // RGBA
                          scale={parseFloat(avatarZoom)}
                          rotate={parseInt(avatarRotate)}
                          crossOrigin ="anonymous"
                        />
                        <Row>
                          <Col md={5}>
                            <CustomInput type="range" id="AvatarZoomRange" name="AvatarZoomRange" min="0.1" max="10" step="0.1" value={avatarZoom} onChange={handleAvatarZoomChange}/>
                          </Col>
                          <Col md={2}>
                            <Badge color="light">zoom:&nbsp;x{avatarZoom}</Badge>
                          </Col>
                        </Row> 
                        <br/>
                        <Input type="file" name="file" id="file" onChange={handleFileChange} />
                      </CardBody>
                    </Card>
                  </FormGroup>
                  
                </TabPane>
                <TabPane tabId="services">
                  <Row>
                    <Col sm="12">
                      <h4>Services Contents</h4>
                    </Col>
                  </Row>
                </TabPane>
              </TabContent>
              
              <Button block color="primary" type="submit" disabled={isLoading||!isEdited}>               
                {isLoading && <Spinner as="span" color="light" />}
                &nbsp;&nbsp;Save
              </Button>
              <Button block color="secondary" disabled={isLoading} onClick={handleLeaveRequest}>               
                &nbsp;&nbsp;Back Home
              </Button>
            
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
}