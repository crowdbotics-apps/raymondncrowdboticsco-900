import moment from 'moment';
import { Firestore, Storage } from '../lib/firebase';

let collection = Firestore.collection('campaigns');

export const addCampaign = async payload => {
  try {
    let questions = [];
    let tasks = payload.questions.map(
      (question, index) =>
        new Promise((resolve, reject) => {
          questions.push({
            type: question.type,
            question: question.question,
            answers: question.answers
          });
          if (question.media) {
            let ref = Storage.ref(`media/${moment().valueOf()}`);
            let task = ref.put(question.media);
            task.on(
              'state_changed',
              snapshot => {},
              error => {},
              () => {
                task.snapshot.ref.getDownloadURL().then(downloadUrl => {
                  questions[index].media = downloadUrl;
                  questions[index].media_type = question.media.type;
                  resolve(downloadUrl);
                });
              }
            );
          }
        })
    );
    await Promise.all(tasks);

    let campaignDoc = collection.doc();
    await campaignDoc.set({
      id: campaignDoc.id,
      name: payload.basic.name,
      marketing_name: payload.basic.marketing_name,
      client_id: payload.basic.org,
      from: payload.basic.from,
      to: payload.basic.to,
      participant_group_id: payload.basic.participant_group,
      total_points: payload.basic.total_points,
      description: payload.basic.description,
      status: 'active',
      questions
    });
  } catch (error) {
    throw error;
  }
};

export const updateCampaign = async payload => {
  try {
    let questions = [];
    let tasks = payload.questions.map(
      (question, index) =>
        new Promise((resolve, reject) => {
          questions.push({
            type: question.type,
            question: question.question,
            answers: question.answers
          });
          if (question.media && question.media.type) {
            let ref = Storage.ref(`media/${moment().valueOf()}`);
            let task = ref.put(question.media);
            task.on(
              'state_changed',
              snapshot => {},
              error => {},
              () => {
                task.snapshot.ref.getDownloadURL().then(downloadUrl => {
                  questions[index].media = downloadUrl;
                  questions[index].media_type = question.media.type;
                  resolve(downloadUrl);
                });
              }
            );
          } else if (question.media && question.media_type) {
            questions[index].media = question.media;
            questions[index].media_type = question.media_type;
            resolve();
          }
        })
    );
    await Promise.all(tasks);

    let campaignDoc = collection.doc(payload.campaignId);
    campaignDoc.update({
      name: payload.basic.name,
      marketing_name: payload.basic.marketing_name,
      client_id: payload.basic.org,
      from: payload.basic.from,
      to: payload.basic.to,
      participant_group_id: payload.basic.participant_group,
      total_points: payload.basic.total_points,
      description: payload.basic.description,
      status: payload.basic.status,
      questions
    });
  } catch (error) {
    throw error;
  }
};

export const getCampaignById = async campaignId =>
  new Promise((resolve, reject) => {
    let campaignDoc = collection.doc(campaignId);
    campaignDoc.onSnapshot(async snapshot => {
      let campaignData = snapshot.data();

      let clientDoc = Firestore.collection('clients').doc(
        campaignData.client_id
      );
      clientDoc.onSnapshot(client_snapshot => {
        let client_data = client_snapshot.data();
        campaignData.client = client_data;

        resolve(campaignData);
      });
    });
  });

export const getCampaigns = async () => {
  try {
    let snapshot = await collection.get();
    let tasks = snapshot.docs.map(campaignDoc =>
      getCampaignById(campaignDoc.id)
    );
    let campaigns = Promise.all(tasks);
    return campaigns;
  } catch (error) {
    throw error;
  }
};

export const deactivateCampaign = async campaignId => {
  try {
    await collection.doc(campaignId).update({
      status: 'inactive'
    });
  } catch (error) {
    throw error;
  }
};

export const activateCampaign = async campaignId => {
  try {
    await collection.doc(campaignId).update({
      status: 'active'
    });
  } catch (error) {
    throw error;
  }
};
