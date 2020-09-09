import React, { useState, useEffect } from "react";
import { Button, Collapse, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledDropdown, ListGroup, Nav, Navbar, NavbarBrand, NavbarToggler, Pagination, PaginationItem, PaginationLink, Table } from "reactstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import { API } from "aws-amplify";
import "./Home.css";

export default function Home(props) {
  const [scopes, setScopes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navbar
  const [isNavbarOpen, setNavbarOpen] = useState(false);
  const toggle = () => setNavbarOpen(!isNavbarOpen);

  // Paginated scopes table
  const pageSize = 10;
  const [pagesCount, setPagesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  


  useEffect(() => {
    async function onLoad() {
      if (!props.isAuthenticated) {
        return;
      }
  
      try {
        const scopes = await loadScopes();
        setScopes(scopes);

        // Paginated scopes table
        setPagesCount(Math.ceil(scopes.length / pageSize));

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

  // Paginated scopes table
  function handleClick(e, index) {
    
    e.preventDefault();
    setCurrentPage(index);
  }

  // Paginated scopes table
  function renderScopesList(scopes) {

    return (
    
      <React.Fragment>
        <div className="pagination-wrapper">
          <Pagination aria-label="Page navigation example">
            <PaginationItem disabled={currentPage <= 0}>
              <PaginationLink
                onClick={e => handleClick(e, currentPage - 1)}
                previous
                href="#"
              /> 
            </PaginationItem>
            {[...Array(pagesCount)].map((page, i) => 
              <PaginationItem active={i === currentPage} key={i}>
                <PaginationLink onClick={e => handleClick(e, i)} href="#">
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem disabled={currentPage >= pagesCount - 1}>
              <PaginationLink
                onClick={e => handleClick(e, currentPage + 1)}
                next
                href="#"
              />
            </PaginationItem> 
          </Pagination>
        </div>

        <Table responsive hover>
        <tbody>
          <tr>
            <th>Scope Id</th>
            <th>Content</th>
            <th>Created at</th>
          </tr>
          {scopes.slice(
              currentPage * pageSize,
              (currentPage + 1) * pageSize
            ).map((data, i) =>  
            <LinkContainer key={data.scopeId} to={`/scopes/${data.scopeId}`}>
              <tr>
                <th scope="row">{data.scopeId}</th>
                <td>{data.content}</td>
                <td>{new Date(data.createdAt).toLocaleString()}</td>
              </tr>
              </LinkContainer>
            )
          }

          </tbody>
        </Table>
      </React.Fragment>
    
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Let's scope it!</h1>
        <p>Scoping App</p>
        <div>
          <Button color="primary" tag={Link} to="/login">Login</Button>
          <Button color="success" tag={Link} to="/signup">Signup</Button>
        </div>
      </div>
    );
  }

  function renderScopes() {
    return (
      <div className="scopes">
        <br></br>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">My scopes</NavbarBrand>
          <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isNavbarOpen} navbar>
              <Nav className="mr-auto" navbar>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    Create a new scope
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem tag={Link} to="/scopes/new">
                      Launch Services
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem disabled>
                      Custom App Add-on
                    </DropdownItem>
                    <DropdownItem disabled>
                      Data Migration Add-on
                    </DropdownItem>
                    <DropdownItem disabled>
                      Agent Training Add-on
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Nav>
            </Collapse>
        </Navbar>
        
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