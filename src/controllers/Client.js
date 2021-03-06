import { Firestore } from '../lib/firebase';

import { getParticipantById } from './Participants';

export const addClient = async payload => {
  try {
    let groupIds = [];
    let tasks = payload.groups.map(group => {
      let groupDoc = Firestore.collection('participant_groups').doc();
      let participant_list = group.participant_list.map(participant => {
        return {
          name: participant[0],
          email: participant[1],
          status: true
        };
      });
      groupIds.push(groupDoc.id);
      return groupDoc.set({
        id: groupDoc.id,
        name: group.name,
        division: group.division,
        number_of_participants: group.number_of_participants,
        participant_list
      });
    });
    await Promise.all(tasks);

    let clientDoc = Firestore.collection('clients').doc();
    await clientDoc.set({
      id: clientDoc.id,
      org: payload.basic.org,
      contact: payload.basic.contact,
      status: true,
      participant_group_ids: groupIds
    });
  } catch (error) {
    throw error;
  }
};

export const updateClient = async payload => {
  try {
    let groupIds = [];
    let tasks = payload.groups.map(group => {
      let groupDoc;
      if (group.newlyAdded) {
        //newly added
        groupDoc = Firestore.collection('participant_groups').doc();
      } else {
        groupDoc = Firestore.collection('participant_groups').doc(group.id);
      }

      let participant_list = group.participant_list.map(participant => {
        return {
          name: participant[0],
          email: participant[1],
          status: true
        };
      });
      groupIds.push(groupDoc.id);
      if (group.newlyAdded) {
        return groupDoc.set({
          id: groupDoc.id,
          name: group.name,
          division: group.division,
          number_of_participants: group.number_of_participants,
          participant_list
        });
      } else {
        return groupDoc.update({
          id: groupDoc.id,
          name: group.name,
          division: group.division,
          number_of_participants: group.number_of_participants,
          participant_list
        });
      }
    });
    await Promise.all(tasks);

    let clientDoc = Firestore.collection('clients').doc(payload.clientId);
    await clientDoc.update({
      id: payload.clientId,
      org: payload.basic.org,
      contact: payload.basic.contact,
      status: payload.basic.status,
      participant_group_ids: groupIds
    });
  } catch (error) {
    throw error;
  }
};

export const deactivateClient = async clientId => {
  try {
    let clientCollection = Firestore.collection('clients');
    await clientCollection.doc(clientId).update({
      status: false
    });
  } catch (error) {
    throw error;
  }
};

export const activateClient = async clientId => {
  try {
    let clientCollection = Firestore.collection('clients');
    await clientCollection.doc(clientId).update({
      status: true
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
      let query = Firestore.collection('campaigns').where(
        'client_id',
        '==',
        clientId
      );
      let docSnapshots = await query.get();
      clientData.campaign = docSnapshots.docs.length;
      resolve(clientData);
    });
  });

// search clients with the criteria
export const getClients = async () => {
  let clientCollection = Firestore.collection('clients');

  try {
    let snapshot = await clientCollection.get();
    let tasks = snapshot.docs.map(clientDoc => getClientById(clientDoc.id));
    let clients = Promise.all(tasks);
    return clients;
  } catch (error) {
    throw error;
  }
};

export const getParticipantGroupsByClientId = async clientId => {
  try {
    let client = await getClientById(clientId);
    let tasks = client.participant_group_ids.map(groupId => {
      return getParticipantById(groupId);
    });
    let participant_groups = await Promise.all(tasks);
    return participant_groups;
  } catch (error) {
    throw error;
  }
};
