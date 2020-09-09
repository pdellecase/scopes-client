import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { withRouter, Link } from "react-router-dom";
import { API, Auth, Storage} from "aws-amplify";
import { Alert, Collapse, Dropdown, DropdownMenu, DropdownItem, DropdownToggle, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from "reactstrap";
import LoadingOverlay from 'react-loading-overlay'
import CircleLoader from 'react-spinners/CircleLoader'
import { css } from "@emotion/core";
import "./App.css";
import Routes from "./Routes";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

function App(props) {
  const [isAuthenticating, setIsAuthenticating] = useState(true); 
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPict, setUserPict] = useState(null);


  const [collapsed, setCollapsed] = useState(true);
  const toggleNavbar = () => setCollapsed(!collapsed);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(!dropdownOpen);


  // Global Alert Management
  const [alertVisible, setAlertVisible] = useState(false);
  const onDismissAlert = () => setAlertVisible(false);
  const [alertMessage, setAlertMessage] = useState("Error!");

  // Global Loading Spinner Overlay
  const [loadingSpinnerVisible, setLoadingSpinnerVisible] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Please Wait ...");

 
  useEffect(() => {
    onLoad();
  }, []);

  async function onLoad() {
    try {
      // Checking if user session exists
      await Auth.currentSession();
      userHasAuthenticated(true);

      // Reload User Profile through API and get key profile info
     
      const userProfile = await API.get("users", "/login");
      if((userProfile) && (userProfile.userActive)) {
        setProfile(userProfile.profile);
        setUserName(userProfile.firstname + " " + userProfile.lastname);
        if(userProfile.attachment){
          let attachmentURL = await Storage.vault.get(userProfile.attachment);
          setUserPict(attachmentURL);
        } else {
          setUserPict("/assets/gen-avatar.png");
        }
      }
      else {
        await Auth.signOut();
        userHasAuthenticated(false);
        alert("Sorry but your account is not active, contact your administrator!");
      }
    }
    catch(e) {
      if (e !== 'No current user') {
        alert("Your account is compromised, contact your administrator: " + e);
      }
    }
  
    setIsAuthenticating(false);
  }

  async function handleLogout() {
    await Auth.signOut();
    userHasAuthenticated(false);
    props.history.push("/login");
  }

  return (
    !isAuthenticating && (
      <div className="App container">
        <LoadingOverlay active={loadingSpinnerVisible} 
          spinner={<CircleLoader css={override} size={100} color={"#4A90E2"} />} 
          text={loadingMessage} 
        >
         <Navbar dark expand="md">
            <NavbarBrand href="/">
              <img alt="" src="/favicon-32x32.png" width="32" height="32" className="d-inline-block align-top"/>
              {' '}&nbsp;&nbsp;Let's scope it!
            </NavbarBrand>
            <NavbarToggler onClick={toggleNavbar}>
             {/* Close mark */}
             <div id="close-icon" className={!collapsed ? "open" : "" }>
                <span></span>
                <span></span>
                <span></span>
              </div>
              {/* close mark ends */}
            </NavbarToggler>
            <Collapse isOpen={!collapsed} navbar>
              <Nav navbar className="ml-auto">
                {isAuthenticated ? (
                  <>
                    {profile==="Administrator" ? (
                      <NavItem>
                        <NavLink href="/admin">Admin</NavLink>
                      </NavItem>
                    ) : (
                    <></>
                    )}
                     <NavItem>
                        <NavLink>&nbsp;</NavLink>
                    </NavItem>
                    <Dropdown nav isOpen={dropdownOpen} toggle={toggle}>
                      <DropdownToggle nav caret>
                        <img alt="" src={userPict} width="30" height="30" className="d-inline-block align-top"/>
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem header>{userName}</DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem tag={Link} to="/settings">My Settings</DropdownItem>
                        <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </>
                ) : (
                  <>
                    <NavItem>
                        <NavLink href="/signup">Signup</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="/login">Login</NavLink>
                    </NavItem>
                  </>
                )}
              </Nav>
            </Collapse>
          </Navbar>

          <Alert color="danger" isOpen={alertVisible} toggle={onDismissAlert}>
          {alertMessage}
          </Alert>

          <Routes appProps={{ isAuthenticated, userHasAuthenticated, profile, setProfile, userName, setUserName, userPict, setUserPict, 
            setAlertVisible, setAlertMessage, setLoadingSpinnerVisible, setLoadingMessage}} />
        
        </LoadingOverlay>

      </div>
    )
  );

}

export default withRouter(App);
