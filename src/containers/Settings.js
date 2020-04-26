import React, { Component } from "react";
import { Button } from "reactstrap";
import { Link } from "react-router-dom";
import "./Settings.css";

export default class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
        <div className="Settings">
            <h3><center>Settings</center></h3>
            <p><Button block color="primary" tag={Link} to="/settings/profile">Edit Profile</Button></p>
            <p><Button block disabled color="secondary" tag={Link} to="/settings/billing">Billing</Button></p>
            <p><Button block color="primary" tag={Link} to="/settings/email">Change Email</Button></p>
            <p><Button block color="primary" tag={Link} to="/settings/password">Change Password</Button></p>  
            <hr/>
            <p><Button block color="success" tag={Link} to="/">Back Home</Button></p>  
      </div>
    );
  }
}