import React from 'react';
import PropTypes from 'prop-types';
import { CSVLink, CSVDownload } from 'react-csv';
import { AppContext } from 'components';
import { CampaignReportController } from 'controllers';

import styles from './CampaignReportContainer.module.scss';

var _ = require('lodash');
const { map } = require('p-iteration');

class CampaignReportContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      keyword: '',
      campaign_id: props.match.params.id
    };
  }

  async componentDidMount() {
    await this.reload();
    this.state.campaign_id && this.showCampaignbyId();
  }

  reload = async () => {
    await this.setState({ loading: true });
    this.context.showLoading();
    await this.getCampaigns();
    this.context.hideLoading();
    this.setState({ loading: false });
  };

  async getCampaigns() {
    this.context.showLoading();

    await this.setState({ loading: true });

    let recepCampaigns = [];
    let campaigns = await CampaignReportController.getCampaigns();
    console.log(campaigns);

    await map(campaigns, async campaign => {
      let headers = ['User name', 'Email'];
      let rows = [];
      (await campaign.campaign_questions) &&
        campaign.campaign_questions.length &&
        map(campaign.campaign_questions, async question => {
          headers.push(question.question);
        });

      (await campaign.participant_group.participant_list) &&
        campaign.participant_group.participant_list.length &&
        map(
          campaign.participant_group.participant_list,
          async (user, userIndex) => {
            let row = [user.name, user.email];

            (await campaign.campaign_questions) &&
              campaign.campaign_questions.length &&
              map(campaign.campaign_questions, async (question, index) => {
                let que_answer = '';
                if (campaign.answers[userIndex]) {
                  switch (question.type) {
                  case 0:
                    que_answer =
                        campaign.answers[userIndex].answers[`${index}`];
                    break;
                  case 1:
                    que_answer =
                        question.answers[
                          campaign.answers[userIndex].answers[`${index}`]
                        ];
                    break;
                  case 2: {
                    let answers = [];
                    answers = campaign.answers[userIndex].answers[
                      `${index}`
                    ].map(answerindex => {
                      return question.answers[answerindex];
                    });
                    que_answer = answers.join(', ');
                    break;
                  }
                  default:
                    break;
                  }
                }
                row.push(que_answer);
              });

            rows.push(row);
          }
        );

      let receptCampaign = {
        id: campaign.id,
        name: campaign.campaign_name,
        headers: headers,
        rows: rows,
        show: false
      };
      recepCampaigns.push(receptCampaign);
    });

    await this.setState({ recepCampaigns });

    this.context.hideLoading();

    await this.setState({ loading: false });
  }

  async showCampaign(campaign) {
    let { recepCampaigns } = this.state;

    await map(recepCampaigns, async data => {
      if (data.name === campaign.name) {
        data.show = !campaign.show;
      }
    });

    this.setState({ recepCampaigns });
  }

  async showCampaignbyId() {
    let { recepCampaigns, campaign_id } = this.state;
    let campaign = [];

    await map(recepCampaigns, async data => {
      if (data.id === campaign_id) {
        data.show = true;
        campaign.push(data);
        this.setState({ keyword: data.name });
      }
    });

    this.setState({ recepCampaigns: campaign });
  }

  searchInputChanged = e => {
    this.setState(
      {
        keyword: e.target.value
      },
      async () => {
        if (!this.state.keyword) {
          await this.reload();
        }
      }
    );
  };

  searchInputKeyPressed = async e => {
    let filterData = [];

    if (e.charCode === 13) {
      if (!this.state.keyword) {
        return this.reload();
      } else {
        await this.reload();
        let { recepCampaigns } = this.state;
        if (recepCampaigns && recepCampaigns.length > 0) {
          await recepCampaigns.map(async item => {
            if (item.name.toLowerCase().includes(this.state.keyword)) {
              filterData.push(item);
            }
          });
        }
      }

      return this.setState({ recepCampaigns: filterData });
    }
  };

  renderCampaign(campaign, index) {
    return (
      <div key={campaign.id} className={styles.campaign}>
        <div className={styles.tab} onClick={() => this.showCampaign(campaign)}>
          <span>
            {campaign.name}
            <i
              className={!campaign.show ? 'fa fa-arrow-down' : 'fa fa-arrow-up'}
            />
          </span>
        </div>
        {campaign.show && (
          <table key={index}>
            <thead>
              <tr className={styles.header}>
                {campaign.headers.map(item => (
                  <th key={item}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaign.rows.map((row, index1) => (
                <tr key={index1}>
                  {row &&
                    row.map((column, index2) => <td key={index2}>{column}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {campaign.show && (
          <div className={styles.buttonContainer}>
            <div className={styles.button}>
              <CSVLink
                data={campaign.rows}
                headers={campaign.headers}
                style={{
                  color: '#ffffff',
                  padding: 8,
                  backgroundColor: '#03a9f4',
                  borderRadius: 4
                }}
              >
                Download csv
              </CSVLink>
            </div>
          </div>
        )}
      </div>
    );
  }

  render() {
    const { recepCampaigns, loading } = this.state;

    return (
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <div className={styles.searchbar}>
            <i className={`fa fa-search ${styles.iconSearch}`} />
            <input
              type='text'
              placeholder='Type campaign name here and press enter to get the result...'
              value={this.state.keyword}
              onChange={this.searchInputChanged}
              onKeyPress={this.searchInputKeyPressed}
            />
          </div>
        </div>
        {!loading &&
          recepCampaigns.length &&
          recepCampaigns.map((campaign, index) => {
            return this.renderCampaign(campaign);
          })}
      </div>
    );
  }
}

CampaignReportContainer.contextType = AppContext;

CampaignReportContainer.propTypes = {
  history: PropTypes.object
};

export default CampaignReportContainer;
