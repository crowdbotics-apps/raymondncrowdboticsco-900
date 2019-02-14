import { Firestore } from '../lib/firebase';

export const deactivateClient = async clientId => {
  try {
    let clientCollection = Firestore.collection('clients');
    await clientCollection.doc(clientId).update({
      status: 'inactive'
    });
  } catch (error) {
    throw error;
  }
};

export const activateClient = async clientId => {
  try {
    let clientCollection = Firestore.collection('clients');
    await clientCollection.doc(clientId).update({
      status: 'active'
    });
  } catch (error) {
    throw error;
  }
};

export const getClientById = clientId =>
  new Promise((resolve, reject) => {
    let clientDoc = Firestore.collection('clients').doc(clientId);
    clientDoc.onSnapshot(async snapshot => {
      let clientData = snapshot.data();

      let tasks = clientData.participant_group_ids.map(
        groupId =>
          new Promise((resolve, reject) => {
            let participant_group_doc = Firestore.collection(
              'participant_groups'
            ).doc(groupId);
            participant_group_doc.onSnapshot(group_snapshot => {
              let participant_group_data = group_snapshot.data();
              resolve(participant_group_data);
            });
          })
      );
      clientData.participant_groups = await Promise.all(tasks);
      resolve(clientData);
    });
  });

// search clients with the criteria
export const getParticipants = async () => {
  let participantsCollection = Firestore.collection('participant_groups');

  try {
    let snapshot = await participantsCollection.get();
    let participants = [];
    await snapshot.docs.map(async participantsGroupDoc => {
      let participantsGroupData = await participantsGroupDoc.data();
      if (
        participantsGroupData.participant_list &&
        participantsGroupData.participant_list.length > 0
      ) {
        await participantsGroupData.participant_list.map(async data => {
          let participant = {
            name: data.name || '',
            email: data.email || '',
            organization: participantsGroupData.name || '',
            division: participantsGroupData.division || '',
            group: participantsGroupData.name || ',',
            status: data.status || false,
            participants_group_id: participantsGroupDoc.id
          };
          participants.push(participant);
        });
      }
    });
    return participants;
  } catch (error) {
    throw error;
  }
};
