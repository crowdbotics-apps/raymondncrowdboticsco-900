import moment from 'moment';
import { Firestore, Storage } from '../lib/firebase';

let collection = Firestore.collection('campaigns');

export const addCampaign = async payload => {
  let questions = [];
  let tasks = payload.questions.map(
    (question, index) =>
      new Promise((resolve, reject) => {
        questions.push({
          type: question.type,
          question: question.question,
          answers: question.answers,
          media_type: question.media.type
        });
        if (question.media) {
          let ref = Storage.ref(`media/${moment().unix()}`);
          let task = ref.put(question.media);
          task.on(
            'state_changed',
            snapshot => {},
            error => {},
            () => {
              task.snapshot.ref.getDownloadURL().then(downloadUrl => {
                questions[index].media = downloadUrl;
                resolve(downloadUrl);
              });
            }
          );
        }
      })
  );
  await Promise.all(tasks);
  console.log(questions);
  try {
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
      questions
    });
  } catch (error) {
    throw error;
  }
};
