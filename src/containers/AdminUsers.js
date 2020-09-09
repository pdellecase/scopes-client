import React, { useState, useEffect } from "react";
import { Badge, Button, Col, Collapse, DropdownToggle, DropdownMenu, DropdownItem, Input, ListGroup, Nav, Navbar, NavbarBrand, NavbarToggler, Pagination, PaginationItem, PaginationLink, Row, Table, UncontrolledDropdown } from "reactstrap";
import { Link } from "react-router-dom";
import { API } from "aws-amplify";
import "./AdminUsers.css";


export default function AdminUsers(props) {

  // Navbar
  const [isNavbarOpen, setNavbarOpen] = useState(false);
  const toggle = () => setNavbarOpen(!isNavbarOpen);

  // All users table
  const [users, setUsers] = useState([]); 
  // Filtered user table
  const [viewableUsers, setViewableUsers] = useState([]);
  // Filter Input users table
  const [filterInput, setFilterInput] = useState("");

  // Sort Config users table
  const [sortConfig, setSortConfig] = React.useState({ key:"lastname", direction:"ascending" });
  
  // Pagination users table
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

        // Loading Users
        const users = await loadUsers();
        setUsers(users);
        setViewableUsers(users);

        // Paginated users table
        setPagesCount(Math.ceil(users.length / pageSize));

      } catch (e) {
        alert(e);
      }
  
      setIsLoading(false);
    }
  
    onLoad();
  }, [props.isAuthenticated]);


  function loadUsers() {
    return API.get("users", "/users");
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
      filteredTable = users.filter(n => (n.initials + " " + n.lastname + ", " + n.firstname).toUpperCase().includes(filter.toUpperCase()));
    } else {
      filteredTable = users;
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

    setViewableUsers(filteredTable);
  }


  // Paginated users table
  function renderUsersTable(viewableUsers) {

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
            <tr>
              <th><Button color="link" block onClick={() => requestSort('lastname')}>Name</Button></th>
              <th><Button color="link" block onClick={() => requestSort('geography')}>Region</Button></th>
              <th><Button color="link" block onClick={() => requestSort('job')}>Role</Button></th>
              <th><Button color="link" block onClick={() => requestSort('profile')}>Profile</Button></th>
              <th><Button color="link" block onClick={() => requestSort('lastLogin')}>Last Login</Button></th>
              <th><Button color="link" block onClick={() => requestSort('userActive')}>Status</Button></th>
             </tr>
          <tbody>
          {viewableUsers.slice(
              currentPage * pageSize,
              (currentPage + 1) * pageSize
            ).map((data, i) =>  
           
              <tr>
                <th scope="row"><Badge color="dark">{data.initials}</Badge>&nbsp;<a href={'mailto:' + data.email + '?subject=Lets scope it - Admin message&body=Hello'} target="_blank" rel="noopener noreferrer">{data.lastname},&nbsp;{data.firstname}</a></th>
                <td><center>{data.geography}</center></td>
                <td><center>{data.job}</center></td>
                <td> <center>
                  {data.profile==="Administrator" ? (
                      <Badge color="warning">Admin</Badge>
                    ) : (
                      data.profile==="Standard User" ? (
                          <Badge color="primary">User</Badge>
                        ) : (
                          <Badge color="danger">Ext.</Badge>
                      )
                  )}</center>
                </td>
                <td>{new Date(data.lastLogin).toLocaleString()}</td>
                <td><center>
                  {data.userActive ? (
                      <Badge color="success">Active</Badge>
                    ) : (
                      <Badge color="danger">Disabled</Badge>
                    )}</center>
                </td>
              </tr>
             
            )
          }

          </tbody>
        </Table>
      </React.Fragment>
    
    );
  }

  return (
    <div className="AdminUsers">
      <br></br>
      <Navbar color="light" light expand="md">
        <NavbarBrand href="/">Users</NavbarBrand>
        <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isNavbarOpen} navbar>
            <Nav className="mr-auto" navbar>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Mass Action
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to="/scopes/new">
                    Commercial Launch Services
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
      </Navbar>
      
      <ListGroup>
        {!isLoading && renderUsersTable(viewableUsers)}
      </ListGroup>
    </div>
  );
}