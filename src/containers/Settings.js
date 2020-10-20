import React, { useEffect } from "react";
import { Button } from "reactstrap";
import { Link } from "react-router-dom";
import "./Settings.css";

export default function Settings (props) {
  
  useEffect(() => {
    props.setAlertVisible(false);
  }, [props]);

  return (
    <div className="Settings">
      <h3><center>My Settings</center></h3>
      <p><Button block color="primary" tag={Link} to="/settings/profile">Edit Profile</Button></p>
      <p><Button block disabled color="primary" tag={Link} to="/settings/billing">Billing</Button></p>
      <p><Button block color="primary" tag={Link} to="/settings/email">Change Email</Button></p>
      <p><Button block color="primary" tag={Link} to="/settings/password">Change Password</Button></p>  
      <hr/>
      <br/>
      <p><Button block color="secondary" tag={Link} to="/">Back Home</Button></p>  
    </div>
  );
  
}