import React from 'react';
import cn from 'classnames';
import { Link, Switch, Route, Redirect } from 'react-router-dom';

import ClientListContainer from 'containers/Clients/List';
import ClientAddContainer from 'containers/Clients/Add';

import styles from './Router.module.scss';

class Router extends React.Component {
  render() {
    let selectedMenuItem = 0;
    if (window.location.pathname.startsWith('/clients')) {
      selectedMenuItem = 0;
    } else if (window.location.pathname.startsWith('/campaigns')) {
      selectedMenuItem = 1;
    } else {
      selectedMenuItem = 2;
    }
    return (
      <div className={styles.wrapper}>
        <header>Sociallens Admin</header>
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <Link
              to='/clients'
              className={cn(
                styles.menuitem,
                selectedMenuItem === 0 && styles['menuitem-selected']
              )}
            >
              Clients
            </Link>
            <Link
              to='/campaigns'
              className={cn(
                styles.menuitem,
                selectedMenuItem === 1 && styles['menuitem-selected']
              )}
            >
              Campaigns
            </Link>
            <Link
              to='/reporting'
              className={cn(
                styles.menuitem,
                selectedMenuItem === 2 && styles['menuitem-selected']
              )}
            >
              Reporting
            </Link>
          </div>
          <div className={styles.content}>
            <Switch>
              <Route path='/clients/add' component={ClientAddContainer} />
              <Route path='/clients' component={ClientListContainer} />
              <Redirect to='/clients' />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default Router;
