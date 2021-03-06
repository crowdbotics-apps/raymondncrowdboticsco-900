import React from 'react';
import cn from 'classnames';
import { Link, Switch, Route, Redirect } from 'react-router-dom';

// clients
import ClientListContainer from 'containers/Clients/List';
import ClientAddContainer from 'containers/Clients/Add';
import ClientEditContainer from 'containers/Clients/Edit';

// campaigns
import CampaignListContainer from 'containers/Campaigns/List';
import CampaignAddContainer from 'containers/Campaigns/Add';
import CampaignEditContainer from 'containers/Campaigns/Edit';

// campaign details
import CampaignReportContainer from 'containers/CampaignReport/List';

//report
import ReportContainer from 'containers/Report';

//participants
import ParticipantListContainer from 'containers/Participants/List';

import styles from './Router.module.scss';

class Router extends React.Component {
  render() {
    let selectedMenuItem = 0;
    if (window.location.pathname.startsWith('/clients')) {
      selectedMenuItem = 0;
    } else if (window.location.pathname.startsWith('/campaigns')) {
      selectedMenuItem = 1;
    } else if (
      window.location.pathname.startsWith('/report') ||
      window.location.pathname.startsWith('/campaign-report')
    ) {
      selectedMenuItem = 2;
    } else if (window.location.pathname.startsWith('/participants')) {
      selectedMenuItem = 3;
    } else {
      selectedMenuItem = 0; // default
    }
    return (
      <div className={styles.wrapper}>
        <header>Lens Engage</header>
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
              to='/report'
              className={cn(
                styles.menuitem,
                selectedMenuItem === 2 && styles['menuitem-selected']
              )}
            >
              Reporting
            </Link>
            <Link
              to='/participants'
              className={cn(
                styles.menuitem,
                selectedMenuItem === 3 && styles['menuitem-selected']
              )}
            >
              Participants
            </Link>
          </div>
          <div className={styles.content}>
            <Switch>
              <Route path='/clients/add' component={ClientAddContainer} />
              <Route path='/clients/edit/:id' component={ClientEditContainer} />
              <Route path='/clients' component={ClientListContainer} />
              <Route path='/campaigns/add' component={CampaignAddContainer} />
              <Route
                path='/campaigns/edit/:id'
                component={CampaignEditContainer}
              />
              <Route path='/campaigns' component={CampaignListContainer} />
              <Route path='/report' component={ReportContainer} />
              <Route
                path='/campaign-report/:id'
                component={CampaignReportContainer}
              />
              <Route
                path='/participants'
                component={ParticipantListContainer}
              />
              <Redirect to='/clients' />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default Router;
