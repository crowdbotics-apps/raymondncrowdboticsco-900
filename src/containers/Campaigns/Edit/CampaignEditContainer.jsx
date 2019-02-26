import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import uuid from 'uuid/v4';

import { AppContext } from 'components';
import { ClientController, CampaignController } from 'controllers';
import QuestionType from '../../../constants/questionType';

import styles from './CampaignEditContainer.module.scss';
import 'react-datepicker/dist/react-datepicker.css';

import selectStyles from '../Add/select.styles';

class CampaignEditContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      campaignId: props.match.params.id,
      clients: [],
      participant_groups: [],
      orgList: [],
      groupList: [],
      selectedOrg: {},
      selectedGroup: {},
      // campaign data
      basic: {
        name: '',
        marketing_name: '',
        org: '',
        contact: '',
        from: new Date(),
        to: new Date(),
        participant_group: '',
        location: '',
        total_points: 0,
        description: '',
        status: 'active',
        logo: null
      },
      questions: [this.generateNewQuestion()]
    };

    this.fileInputs = {};
    this.logoInput = {};
  }

  async componentDidMount() {
    this.context.showLoading();

    let clients = await ClientController.getClients();
    let participant_groups = await ClientController.getParticipantGroups();
    let orgList = clients.map(client => ({
      value: client.id,
      label: client.org
    }));
    let groupList = participant_groups.map(group => ({
      value: group.id,
      label: group.name
    }));

    let { basic, questions } = this.state;
    let data = await CampaignController.getCampaignById(this.state.campaignId);
    // setting basic info
    basic.name = data.name;
    basic.marketing_name = data.marketing_name;
    basic.org = data.client_id;
    let index = clients.findIndex(client => client.id === data.client_id);
    if (index > -1) {
      basic.contact = clients[index].contact;
    }
    let selectedOrg = orgList[index];

    basic.from = new Date(data.from);
    basic.to = new Date(data.to);
    basic.participant_group = data.participant_group_id;
    index = participant_groups.findIndex(
      group => group.id === data.participant_group_id
    );
    if (index > -1) {
      basic.location = participant_groups[index].division;
    }
    let selectedGroup = groupList[index];

    basic.total_points = data.total_points;
    basic.description = data.description;
    basic.status = data.status;
    basic.logo = data.logo;

    // setting questions
    questions = data.questions.map(question => ({
      id: uuid(),
      ...question
    }));

    this.setState({
      clients,
      participant_groups,
      basic,
      questions,
      orgList,
      groupList,
      selectedOrg,
      selectedGroup
    });

    this.context.hideLoading();
  }

  generateNewQuestion = () => {
    return {
      id: uuid(),
      type: QuestionType.OPEN_TEXT_QUESTION,
      question: '',
      answers: [],
      media: null
    };
  };

  updateClicked = async () => {
    // validation for basic info
    let { basic, questions } = this.state;
    basic['description'] = this.description.innerHTML;

    this.context.showLoading();
    if (!basic.name) {
      alert('Name is empty or invalid!');
      return;
    }
    if (!basic.marketing_name) {
      alert('Marketing Name is empty or invalid!');
      return;
    }
    if (!basic.org) {
      alert('Please select Organization!');
      return;
    }
    if (!basic.participant_group) {
      alert('Please select Participant Group!');
      return;
    }
    if (parseInt(basic.total_points) <= 0) {
      alert('Total point is not valid!');
      return;
    }
    if (!basic.description) {
      alert('Description is empty or invalid!');
      return;
    }

    // validation for questions
    for (var i = 0; i < questions.length; i++) {
      if (!questions[i].question) {
        alert(`Question${i + 1}'s Question Text is empty or invalid!`);
        return;
      }
      if (questions[i].type !== QuestionType.OPEN_TEXT_QUESTION) {
        for (let j = 0; j < questions[i].answers.length; j++) {
          if (!questions[i].answers[j]) {
            alert(`Question${i + 1}'s Question Answers are not completed!`);
            return;
          }
        }
      }
    }

    // updating a campaign
    try {
      await CampaignController.updateCampaign({
        campaignId: this.state.campaignId,
        basic: this.state.basic,
        questions: this.state.questions
      });
      this.props.history.goBack();
    } catch (error) {
      alert(error.message);
    }

    this.context.hideLoading();
  };

  cancelClicked = () => {
    this.props.history.goBack();
  };

  basicInfoChanged = key => e => {
    let { basic } = this.state;

    if (key === 'participant_group') {
      let selectedGroup = e;
      basic[key] = e.value;
      let index = this.state.participant_groups.findIndex(
        group => group.id === e.value
      );
      basic['location'] = this.state.participant_groups[index].division;
      this.setState({
        selectedGroup,
        basic
      });
    } else if (key === 'org') {
      let selectedOrg = e;
      basic[key] = e.value;
      let index = this.state.clients.findIndex(client => client.id === e.value);
      basic['contact'] = this.state.clients[index].contact;
      this.setState({
        selectedOrg,
        basic
      });
    } else if (key === 'from' || key === 'to') {
      basic[key] = e;
      this.setState({ basic });
    } else {
      basic[key] = e.target.value;
      this.setState({ basic });
    }
  };

  uploadLogoClicked = () => {
    this.logoInput.click();
  };

  logoFileUploadChange = e => {
    let files = e.target.files;
    if (files.length > 0) {
      let { basic } = this.state;
      basic.logo = files[0];
      this.setState({ basic });
    }
  };

  uploadClicked = id => () => {
    this.fileInputs[id].click();
  };

  fileUploadChange = index => e => {
    let files = e.target.files;
    if (files.length > 0) {
      let { questions } = this.state;
      questions[index].media = files[0];
      this.setState({ questions });
    }
  };

  selectQuestonType = (qtype, index) => () => {
    let { questions } = this.state;
    questions[index].type = qtype;
    if (qtype === QuestionType.OPEN_TEXT_QUESTION) {
      questions[index].answers = [];
    } else {
      questions[index].answers = [''];
    }
    this.setState({ questions });
  };

  questionChanged = (key, index) => e => {
    let { questions } = this.state;
    questions[index][key] = e.target.value;
    this.setState({ questions });
  };

  addAnswer = index => () => {
    // multiple option
    let { questions } = this.state;
    questions[index].answers.push('');
    this.setState({ questions });
  };

  removeAnswer = (questionIndex, answerIndex) => () => {
    let { questions } = this.state;
    questions[questionIndex].answers.splice(answerIndex, 1);
    this.setState({ questions });
  };

  answerChanged = (questionIndex, answerIndex) => e => {
    let { questions } = this.state;
    questions[questionIndex].answers[answerIndex] = e.target.value;
    this.setState({ questions });
  };

  addQuestion = () => {
    let { questions } = this.state;
    // question validation
    const last = questions[questions.length - 1];
    if (!last.question) {
      alert('Question Text is empty or invalid!');
      return;
    }
    if (last.type !== QuestionType.OPEN_TEXT_QUESTION) {
      for (let i = 0; i < last.answers.length; i++) {
        if (!last.answers[i]) {
          alert('Question Answer can\'t be empty');
          return;
        }
      }
    }
    questions.push(this.generateNewQuestion());
    this.setState({ questions });
  };

  removeQuestion = index => () => {
    if (window.confirm('Are you sure to remove?')) {
      let { questions } = this.state;
      questions.splice(index, 1);
      this.setState({ questions });
    }
  };

  renderQuestion = (question, index) => {
    return (
      <div key={`${index}`} className={styles.questionContainer}>
        <div className={styles.title}>
          <h2> Question {index + 1} </h2>
          {this.state.questions.length > 1 && (
            <span onClick={this.removeQuestion(index)}>
              <i className='fa fa-minus-circle' />
            </span>
          )}
        </div>

        <div className={styles.qtypeContainer}>
          <div
            className={styles.qtypeRadio}
            onClick={this.selectQuestonType(
              QuestionType.OPEN_TEXT_QUESTION,
              index
            )}
          >
            <input
              type='radio'
              value={`open${index}`}
              checked={question.type === QuestionType.OPEN_TEXT_QUESTION}
              onChange={this.selectQuestonType(
                QuestionType.OPEN_TEXT_QUESTION,
                index
              )}
            />
            Open Text Question
          </div>
          <div
            className={styles.qtypeRadio}
            onClick={this.selectQuestonType(QuestionType.ONE_CHOICE, index)}
          >
            <input
              type='radio'
              value={`truefalse${index}`}
              checked={question.type === QuestionType.ONE_CHOICE}
              onChange={this.selectQuestonType(QuestionType.ONE_CHOICE, index)}
            />
            One Choice Question
          </div>
          <div
            className={styles.qtypeRadio}
            onClick={this.selectQuestonType(
              QuestionType.MULTIPLE_CHOICE,
              index
            )}
          >
            <input
              type='radio'
              value={`multiple${index}`}
              checked={question.type === QuestionType.MULTIPLE_CHOICE}
              onChange={this.selectQuestonType(
                QuestionType.MULTIPLE_CHOICE,
                index
              )}
            />
            Multiple Choice Question
          </div>
        </div>
        <div className={styles.inputItem}>
          <span>Question Text</span>
          <input
            placeholder='Type Question here'
            value={question.question}
            onChange={this.questionChanged('question', index)}
          />
        </div>
        <div className={styles.medias}>
          <div className={styles.mediaContainer}>
            <span>Media</span>
            <div>
              <div
                className={styles.btnUpload}
                onClick={this.uploadClicked(question.id)}
              >
                Upload Image/Video
              </div>
              {question.media ? (
                question.media.type ? (
                  <div>
                    {question.media.type.includes('image/') ? (
                      <img
                        className={styles.media}
                        alt='media'
                        src={URL.createObjectURL(question.media)}
                      />
                    ) : (
                      <video
                        width='200'
                        controls
                        className={styles.media}
                        src={URL.createObjectURL(question.media)}
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    {question.media_type.includes('image/') ? (
                      <img
                        className={styles.media}
                        alt='media'
                        src={question.media}
                      />
                    ) : (
                      <video
                        width='200'
                        controls
                        className={styles.media}
                        src={question.media}
                      />
                    )}
                  </div>
                )
              ) : (
                <div className={styles.nomedia}>
                  No image or video is uploaded
                </div>
              )}
              <input
                ref={ref => (this.fileInputs[question.id] = ref)}
                type='file'
                className={styles.file}
                accept='video/*,image/*'
                onChange={this.fileUploadChange(index)}
              />
            </div>
          </div>
        </div>
        <div className={styles.answers}>
          {question.type !== QuestionType.OPEN_TEXT_QUESTION && (
            <div className={styles.answerContainer}>
              <span>Answers</span>
              <div>
                {question.answers.map((answer, answerIndex) => (
                  <div key={`${answerIndex}`} className={styles.answerItem}>
                    <input
                      placeholder='Type answer here'
                      value={answer}
                      onChange={this.answerChanged(index, answerIndex)}
                    />
                    {question.answers.length > 1 && (
                      <span onClick={this.removeAnswer(index, answerIndex)}>
                        <i className='fa fa-minus-circle' />
                      </span>
                    )}
                  </div>
                ))}
                <div className={styles.btnAdd} onClick={this.addAnswer(index)}>
                  <i className='fa fa-plus' />
                  Add
                </div>
              </div>
            </div>
          )}
        </div>
        {index === this.state.questions.length - 1 && (
          <div className={styles.btnAddMore} onClick={this.addQuestion}>
            Add More Question
          </div>
        )}
      </div>
    );
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <h1> Edit campaign </h1>
        <table>
          <thead>
            <tr>
              <td>
                <h2>Basic Information</h2>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className={styles.inputItem}>
                  <span>Name</span>
                  <input
                    value={this.state.basic.name}
                    onChange={this.basicInfoChanged('name')}
                  />
                </div>
              </td>
              <td>
                <div className={styles.inputItem}>
                  <span>Marketing Name</span>
                  <input
                    value={this.state.basic.marketing_name}
                    onChange={this.basicInfoChanged('marketing_name')}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.inputItem}>
                  <span>Organization</span>
                  <div className={styles.select}>
                    <Select
                      styles={selectStyles}
                      value={this.state.selectedOrg}
                      onChange={this.basicInfoChanged('org')}
                      options={this.state.orgList}
                    />
                  </div>
                </div>
              </td>
              <td>
                <div className={styles.inputItem}>
                  <span>Contact</span>
                  <input disabled value={this.state.basic['contact']} />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.inputItem}>
                  <span>Starting Date</span>
                  <DatePicker
                    className={styles.datepicker}
                    selected={this.state.basic.from}
                    onChange={this.basicInfoChanged('from')}
                  />
                </div>
              </td>
              <td>
                <div className={styles.inputItem}>
                  <span>Ending Date</span>
                  <DatePicker
                    className={styles.datepicker}
                    selected={this.state.basic.to}
                    onChange={this.basicInfoChanged('to')}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.inputItem}>
                  <span>Participant Group</span>
                  <div className={styles.select}>
                    <Select
                      styles={selectStyles}
                      value={this.state.selectedGroup}
                      onChange={this.basicInfoChanged('participant_group')}
                      options={this.state.groupList}
                    />
                  </div>
                </div>
              </td>
              <td>
                <div className={styles.inputItem}>
                  <span>Division / Location</span>
                  <input disabled value={this.state.basic['location']} />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.inputItem}>
                  <span>Total Points</span>
                  <input
                    value={this.state.basic['total_points']}
                    onChange={this.basicInfoChanged('total_points')}
                  />
                </div>
              </td>
              <td>
                <div className={styles.textareaItem}>
                  <span>Description</span>
                  <div
                    ref={ref => (this.description = ref)}
                    className={styles.textContainer}
                    contentEditable
                    dangerouslySetInnerHTML={{
                      __html: this.state.basic['description']
                    }}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className={styles.logoItem}>
                  <span>Logo</span>
                  <div className={styles.logoContainer}>
                    <div
                      className={styles.btnUpload}
                      onClick={this.uploadLogoClicked}
                    >
                      Upload Logo
                    </div>
                    {this.state.basic.logo ? (
                      this.state.basic.logo.type ? (
                        <img
                          src={URL.createObjectURL(this.state.basic.logo)}
                          alt='logo'
                        />
                      ) : (
                        <img src={this.state.basic.logo} alt='logo' />
                      )
                    ) : (
                      <span>No logo is uploaded</span>
                    )}
                    <input
                      ref={ref => (this.logoInput = ref)}
                      type='file'
                      className={styles.file}
                      accept='image/*'
                      onChange={this.logoFileUploadChange}
                    />
                  </div>
                </div>
              </td>
              <td />
            </tr>
          </tbody>
        </table>
        {this.state.questions.map((question, index) =>
          this.renderQuestion(question, index)
        )}
        <div className={styles.btnGroup}>
          <div className={styles.btnSave} onClick={this.updateClicked}>
            Update
          </div>
          <div className={styles.btnCancel} onClick={this.cancelClicked}>
            Cancel
          </div>
        </div>
      </div>
    );
  }
}

CampaignEditContainer.contextType = AppContext;

CampaignEditContainer.propTypes = {
  history: PropTypes.object
};

export default CampaignEditContainer;
