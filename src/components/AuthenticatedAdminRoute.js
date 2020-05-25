import React from "react";
import { Route, Redirect } from "react-router-dom";

export default function AuthenticatedAdminRoute({ component: C, appProps, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        (appProps.isAuthenticated)&&(appProps.profile==="Administrator")
          ? <C {...props} {...appProps} />
          : <Redirect
              to={"/"}
            />}
    />
  );
}