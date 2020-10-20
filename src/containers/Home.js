import React, { useState, useEffect } from "react";
import { Badge, Button, Col, Collapse, DropdownToggle, DropdownMenu, DropdownItem, Input, ListGroup, Nav, Navbar, NavbarBrand, NavbarToggler, Pagination, PaginationItem, PaginationLink, Row, Table, UncontrolledDropdown } from "reactstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import "./Home.css";

export default function Home(props) {
  

  
  // Navbar
  const [isNavbarOpen, setNavbarOpen] = useState(false);
  const toggle = () => setNavbarOpen(!isNavbarOpen);

  // All Scopes table
  const [scopes, setScopes] = useState([]);
  // Filtered Scopes table
  const [viewableScopes, setViewableScopes] = useState([]);
  // Filter Input Scopes table
  const [filterInput, setFilterInput] = useState("");
  // Sort Config Scopes table
  const [sortConfig, setSortConfig] = React.useState({ key:"lastname", direction:"ascending" });
  // Paginated scopes table
  const pageSize = 10;
  const [pagesCount, setPagesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    async function onLoad() {
      if (!props.isAuthenticated) {
        return;
      }
  
      try {
        // Loading Scopes
        const scopes = await loadScopes();
        

        // Iterate through Scopes to get attachments from vault
        for(let i in scopes){
          if(scopes[i].attachment){
          scopes[i].logoUrl = await Storage.vault.get(scopes[i].attachment);
          }
        }

        // Defines full Scopes list and the filtered one
        setScopes(scopes);
        setViewableScopes(scopes);

        // Init Paginated Scopes table
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

  // Table pagination request
  function handleClick(e, index) {
    
    e.preventDefault();
    setCurrentPage(index);
  }

  //  Table filter request
  function handleTableChange (filter) { 
    if(filter!==filterInput) {
      setFilterInput(filter);
      handleTableRefresh (filter, sortConfig.key, sortConfig.direction);
    } 
  }

  // Table sorting request
  function requestSort (key) { 
    
    let direction = 'ascending';
    if (sortConfig != null && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    handleTableRefresh (filterInput, key, direction)
  }

  function handleTableRefresh (filter, key, direction)  {

    alert("handleTableRefresh >> filter: " + filter + ", key: " + key + ", direction: "+ direction);

    // filter
    let filteredTable;
    if(filter.length>0){
      filteredTable = scopes.filter(n => (n.scopeName + " " + n.crmMainOppAccountName).toUpperCase().includes(filter.toUpperCase()));
    } else {
      filteredTable = scopes;
    }

    // sort
    if (key !== null) {
      filteredTable.sort((a, b) => {
        if (a[key] < b[key]) {
          return direction === 'ascending' ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    // reset pagination
    setPagesCount(Math.ceil(filteredTable.length / pageSize));
    setCurrentPage(0);

    setViewableScopes(filteredTable);
  }

  // Paginated Scopes table
  function renderScopesList(scopes) {

    return (
      
      <React.Fragment>
        <div className="pagination-wrapper">
          <Row form>
            <Col md={3}>
              <Input type="text" id="filterInput" placeholder="Search Name" 
                value={filterInput} 
                onChange={ e => handleTableChange(e.target.value)} 
              />
            </Col>
            <Col md={7}>
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
            </Col>
          </Row>
        </div>

        <Table responsive hover>
          <thead>
            <tr>
              <th><Button color="link" block onClick={() => requestSort('crmMainOppAccountName')}>Account</Button></th>
              <th><Button color="link" block onClick={() => requestSort('scopeName')}>Scope</Button></th>
              <th><Button color="link" block onClick={() => requestSort('geography')}>Close Date</Button></th>
              <th><Button color="link" block onClick={() => requestSort('job')}>Stage</Button></th>
              <th><Button color="link" block onClick={() => requestSort('profile')}>%</Button></th>
              <th><Button color="link" block onClick={() => requestSort('lastLogin')}>MRR</Button></th>
              <th><Button color="link" block onClick={() => requestSort('userActive')}>Services</Button></th>
              <th><Button color="link" block onClick={() => requestSort('userActive')}>MEDDPICC</Button></th>
              <th><Button color="link" block onClick={() => requestSort('userActive')}>DScore</Button></th>
              <th><Button color="link" block onClick={() => requestSort('userActive')}>Fresh</Button></th>
             </tr>
          </thead>
          <tbody>
          {viewableScopes.slice(
              currentPage * pageSize,
              (currentPage + 1) * pageSize
            ).map((data, i) =>  
            <LinkContainer key={data.scopeId} to={`/scopes/${data.scopeId}`}>
              <tr>
                <th scope="row"><center>{data.attachment? 
                  <img alt="" src={data.logoUrl} crossOrigin="anonymous" width="100" height="25"/>
                  :<font className="badgeheader"><Badge color="light">{data.crmMainOppAccountName}</Badge></font>
                }</center>
                </th>
                <td >{data.scopeName}</td>
                <td><center>{data.crmMainOppCloseDate}</center></td>
                <td><center>{data.crmMainOppStage}</center></td>
                <td> <center>{data.crmMainOppProbability}</center></td>
                <td><center>{data.crmMainOppMRR}&nbsp;{data.crmMainOppCurrency}</center></td>
                <td><center>{data.crmServicesEstimates}&nbsp;{data.crmMainOppCurrency}</center></td>
                <td><center>{data.crmMainOppMEDDPICC}</center></td>
                <td><center>{data.crmMainOppDScore}</center></td>
                <td><center>{data.crmMainOppLastModifDate}</center></td>
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
              <Nav className="ml-auto" navbar>
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
          {!isLoading && renderScopesList(viewableScopes)}
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