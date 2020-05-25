import React from "react";
import { Route, Switch } from "react-router-dom";
import AppliedRoute from "./components/AppliedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import AuthenticatedAdminRoute from "./components/AuthenticatedAdminRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import Home from "./containers/Home";
import Login from "./containers/Login";
import ResetPassword from "./containers/ResetPassword";
import Settings from "./containers/Settings";
import UserProfile from "./containers/UserProfile";
import Stripe from "./containers/Stripe";
import ChangePassword from "./containers/ChangePassword";
import ChangeEmail from "./containers/ChangeEmail";
import Signup from "./containers/Signup";
import NewScope from "./containers/NewScope";
import Scopes from "./containers/Scopes";
import Admin from "./containers/Admin";
import AdminUsers from "./containers/AdminUsers";
import NotFound from "./containers/NotFound";

export default function Routes({ appProps }) {
    return (
      <Switch>
        <AppliedRoute path="/" exact component={Home} appProps={appProps} />
        <UnauthenticatedRoute path="/login" exact component={Login} appProps={appProps} />
        <UnauthenticatedRoute path="/login/reset" exact component={ResetPassword} appProps={appProps}/>
        <UnauthenticatedRoute path="/signup" exact component={Signup} appProps={appProps} />
        <AuthenticatedRoute path="/settings" exact component={Settings} appProps={appProps} />
        <AuthenticatedRoute path="/settings/profile" exact component={UserProfile} appProps={appProps} />
        <AuthenticatedRoute path="/settings/billing" exact component={Stripe} appProps={appProps} />
        <AuthenticatedRoute path="/settings/password" exact component={ChangePassword} appProps={appProps} />
        <AuthenticatedRoute path="/settings/email" exact component={ChangeEmail} appProps={appProps} />
        <AuthenticatedRoute path="/scopes/new" exact component={NewScope} appProps={appProps} />
        <AuthenticatedRoute path="/scopes/:id" exact component={Scopes} appProps={appProps} />
        <AuthenticatedAdminRoute path="/admin" exact component={Admin} appProps={appProps} />
        <AuthenticatedAdminRoute path="/admin/users" exact component={AdminUsers} appProps={appProps} />
        { /* Finally, catch all unmatched routes */ }
        <Route component={NotFound} />
      </Switch>
    );
  }