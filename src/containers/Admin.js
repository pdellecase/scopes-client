import React, { useEffect } from "react";
import { Button } from "reactstrap";
import { Link } from "react-router-dom";
import "./Admin.css";

export default function Admin(props) {

  useEffect(() => {
    props.setAlertVisible(false);
  }, [props]);
  
  return (
    <div className="Admin">
      <h3><center>Admin</center></h3>
      <p><Button block color="primary" tag={Link} to="/admin/users">Manage Users</Button></p> 
      <hr/>
      <br/>
      <p><Button block color="secondary" tag={Link} to="/">Back Home</Button></p>  
    </div>
  );
}
