import React, { useState, useEffect } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { API } from "aws-amplify";
import "./Home.css";

export default function Home(props) {
  const [scopes, setScopes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!props.isAuthenticated) {
        return;
      }
  
      try {
        const scopes = await loadScopes();
        setScopes(scopes);
      } catch (e) {
        alert(e);
      }
  
      setIsLoading(false);
    }
  
    onLoad();
  }, [props.isAuthenticated]);
  
  function loadScopes() {
    return API.get("scopes", "/scopes");
  }

  function renderScopesList(scopes) {
    return [{}].concat(scopes).map((scope, i) =>
      i !== 0 ? (
        <LinkContainer key={scope.scopeId} to={`/scopes/${scope.scopeId}`}>
          <ListGroupItem header={scope.content.trim().split("\n")[0]}>
            {"Created: " + new Date(scope.createdAt).toLocaleString()}
          </ListGroupItem>
        </LinkContainer>
      ) : (
        <LinkContainer key="new" to="/scopes/new">
          <ListGroupItem>
            <h4>
              <b>{"\uFF0B"}</b> Create a new scope
            </h4>
          </ListGroupItem>
        </LinkContainer>
      )
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Let's scope it!</h1>
        <p>Scoping App</p>
        <div>
          <Link to="/login" className="btn btn-info btn-lg">
            Login
          </Link>
          <Link to="/signup" className="btn btn-success btn-lg">
            Signup
          </Link>
        </div>
      </div>
    );
  }

  function renderScopes() {
    return (
      <div className="scopes">
        <PageHeader>Your Scopes</PageHeader>
        <ListGroup>
          {!isLoading && renderScopesList(scopes)}
        </ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {props.isAuthenticated ? renderScopes() : renderLander()}
    </div>
  );
}