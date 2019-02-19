import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { ButtonToolbar, Button } from 'react-bootstrap';
import Checkbox from 'rc-checkbox';
import 'rc-checkbox/assets/index.css';

import { ReportController, ClientController } from 'controllers';
import styles from './ReportContainer.module.scss';

var _ = require('lodash');

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
];

class ReportContainer extends React.Component {
  constructor(props) {
    super(props);

    this.columns = [
      'Select',
      'Campaign',
      'Completions',
      'Participants Group',
      'Divisions / Locations'
    ];

    this.state = {
      orgSelected: null,
      filterSelected: null,
      bulkActionSelected: null,
      loading: true,
      data: [
        {
          id: 1,
          checked: false,
          category: 'Greetings',
          campaign: 'Buddy activity',
          completions: '10 out of 50',
          employee_group: 'Cashiers',
          division: 'Macon'
        },
        {
          id: 2,
          checked: false,
          category: 'Greetings',
          campaign: 'Buddy activity',
          completions: '10 out of 50',
          employee_group: 'Cashiers',
          division: 'Macon'
        },
        {
          id: 3,
          checked: false,
          category: 'Greetings',
          campaign: 'Buddy activity',
          completions: '10 out of 50',
          employee_group: 'Cashiers',
          division: 'Macon'
        },
        {
          id: 4,
          checked: false,
          category: 'Greetings',
          campaign: 'Buddy activity',
          completions: '10 out of 50',
          employee_group: 'Cashiers',
          division: 'Macon'
        },
        {
          id: 5,
          checked: false,
          category: 'Greetings',
          campaign: 'Buddy activity',
          completions: '10 out of 50',
          employee_group: 'Cashiers',
          division: 'Macon'
        }
      ]
    };
  }

  handleOrgChange = async orgSelected => {
    await this.setState({ orgSelected });
    console.log('Option selected:', orgSelected);

    await this.getCampaigns();
    let filterCampaings = _.map(this.state.campaigns, function(o) {
      if (o.client_id === orgSelected.value) return o;
    });
    await this.setState({ campaigns: filterCampaings });
  };

  // handleFilterChange = filterSelected => {
  //   this.setState({ filterSelected });
  //   console.log('Option selected:', filterSelected);
  // };

  // handlebulkActionChange = bulkActionSelected => {
  //   this.setState({ bulkActionSelected });
  //   console.log('Option selected:', bulkActionSelected);
  // };

  async componentDidMount() {
    await this.reload();
  }

  reload = async () => {
    await this.setState({ loading: true });
    let orgs = await ClientController.getClients();
    let orgList = [];

    if (orgs && orgs.length > 0) {
      await orgs.map(item => {
        let org = {
          label: item.org,
          value: item.id
        };
        orgList.push(org);
      });
    }

    await this.setState({ orgList });

    await this.getCampaigns();
    this.setState({ loading: false });
  };

  async getCampaigns() {
    await this.setState({ loading: true });
    let campaigns = await ReportController.getCampaigns();
    await this.setState({ campaigns });
    console.log(campaigns);
    await this.setState({ loading: false });
  }

  async select(selectedData) {
    console.log('select', selectedData.id);
    let { campaigns } = this.state;

    await campaigns.map(item => {
      if (item.id === selectedData.id) {
        item.checked = !selectedData.checked;
      }
    });

    this.setState({ campaigns });
  }

  downloadData() {
    alert('download data');
  }

  downloadMedia() {
    alert('download media');
  }

  createRow() {
    const { campaigns } = this.state;
    let children = [];
    for (var i = 0; i < campaigns.length; i++) {
      let item = campaigns[i];
      children.push(
        _.isEmpty(item) ? null : (
          <tr key={item.id}>
            <td>
              <Checkbox
                checked={item.checked}
                onChange={() => this.select(item)}
              />
            </td>
            <td>{item.name}</td>
            <td>{`${item.answers} out of ${item.completion}`}</td>
            <td>{item.participant_group_name}</td>
            <td>{item.division}</td>
          </tr>
        )
      );
    }
    return children;
  }

  render() {
    const {
      orgSelected,
      bulkActionSelected,
      filterSelected,
      orgList,
      campaigns,
      loading
    } = this.state;

    return (
      <div className={styles.wrapper}>
        <div className={styles.selector}>
          <span>Organization:</span>
          <div className={styles.select}>
            <Select
              value={orgSelected}
              onChange={this.handleOrgChange}
              options={orgList}
            />
          </div>
        </div>
        {/* <div className={styles.selector}>
          <span>Market filter By:</span>
          <div className={styles.select}>
            <Select
              value={filterSelected}
              onChange={this.handleFilterChange}
              options={options}
            />
          </div>
        </div>
        <div className={styles.selector}>
          <span>Bulk Action:</span>
          <div className={styles.select}>
            <Select
              value={bulkActionSelected}
              onChange={this.handlebulkActionChange}
              options={options}
            />
          </div>
        </div> */}
        {!loading && campaigns.length ? (
          <table>
            <thead>
              <tr className={styles.header}>
                {this.columns.map(item => (
                  <th key={item}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>{this.createRow()}</tbody>
          </table>
        ) : (
          <h3>No Result</h3>
        )}
        <div className={styles.buttonContainer}>
          <ButtonToolbar>
            <Button
              variant='primary'
              size='md'
              className={styles.button}
              onClick={() => this.downloadData()}
            >
              Download data file
            </Button>
            {/* <Button
              variant='primary'
              size='md'
              onClick={() => this.downloadMedia()}
            >
              Download Media
            </Button> */}
          </ButtonToolbar>
        </div>
      </div>
    );
  }
}

ReportContainer.propTypes = {
  history: PropTypes.object
};

export default ReportContainer;
