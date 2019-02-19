import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { ButtonToolbar, Button } from 'react-bootstrap';
import Checkbox from 'rc-checkbox';
import 'rc-checkbox/assets/index.css';
import { AppContext } from 'components';
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
      loading: true
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

  async componentDidMount() {
    await this.reload();
  }

  reload = async () => {
    await this.setState({ loading: true });
    this.context.showLoading();
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
    this.context.hideLoading();
    this.setState({ loading: false });
  };

  async getCampaigns() {
    this.context.showLoading();
    await this.setState({ loading: true });
    let campaigns = await ReportController.getCampaigns();
    await this.setState({ campaigns });
    this.context.hideLoading();
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
          </ButtonToolbar>
        </div>
      </div>
    );
  }
}

ReportContainer.contextType = AppContext;

ReportContainer.propTypes = {
  history: PropTypes.object
};

export default ReportContainer;
