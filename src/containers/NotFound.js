import React from "react";
import { Button, Spinner} from "reactstrap";
import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="NotFound">
      <h2>
          <Spinner type="grow" color="danger" />&nbsp;&nbsp;Sorry, page not found! <b>(404)</b>
      </h2>
      <br/><br/><br/>
      <p><Button  color="primary" tag={Link} to="/">Go to Home Page</Button></p>
    </div>
  );
}