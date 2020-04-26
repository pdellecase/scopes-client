import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { Auth } from "aws-amplify";
import { Alert, Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from "reactstrap";
import "./App.css";
import Routes from "./Routes";



function App(props) {
  const [isAuthenticating, setIsAuthenticating] = useState(true); 
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const toggleNavbar = () => setCollapsed(!collapsed);

  // Global Alert Management
  const [alertVisible, setAlertVisible] = useState(false);
  const onDismissAlert = () => setAlertVisible(false);
  const [alertMessage, setAlertMessage] = useState("Error!");
 
  useEffect(() => {
    onLoad();
  }, []);
  
  async function onLoad() {
    try {
      await Auth.currentSession();
      userHasAuthenticated(true);
    }
    catch(e) {
      if (e !== 'No current user') {
        alert(e);
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
                     <NavItem>
                        <NavLink href="/settings">Settings</NavLink>
                    </NavItem>
                    <NavItem onClick={handleLogout}>
                        <NavLink href="/login">Logout</NavLink>
                    </NavItem>
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
        <Routes appProps={{ isAuthenticated, userHasAuthenticated, setAlertVisible, setAlertMessage }} />
      </div>
    )
  );

}

export default withRouter(App);
