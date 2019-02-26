import { Firestore } from '../lib/firebase';
const { map } = require('p-iteration');

export const getParticipantById = async id =>
  new Promise((resolve, reject) => {
    let participantDoc = Firestore.collection('participant_groups').doc(id);
    participantDoc.onSnapshot(async snapshot => {
      let participantData = snapshot.data();
      resolve(participantData);
    });
  });

export const getParticipants = async () => {
  let clientsCollection = Firestore.collection('clients');

  try {
    let participants = [];
    let clientsSnapshot = await clientsCollection.get();

    await map(clientsSnapshot.docs, async clientDoc => {
      let clientData = await clientDoc.data();

      if (
        clientData &&
        clientData.participant_group_ids &&
        clientData.participant_group_ids.length > 0
      ) {
        await map(clientData.participant_group_ids, async participantId => {
          let participantsGroupSnapshot = await Firestore.collection(
            'participant_groups'
          )
            .doc(participantId)
            .get();

          let participantsGroupData = await participantsGroupSnapshot.data();

          if (
            participantsGroupData.participant_list &&
            participantsGroupData.participant_list.length > 0
          ) {
            await map(participantsGroupData.participant_list, async data => {
              let participant = {
                name: data.name || '',
                email: data.email || '',
                organization: clientData.org || '',
                division: participantsGroupData.division || '',
                group: participantsGroupData.name || ',',
                status: data.status || false,
                participants_group_id: participantId
              };

              await participants.push(participant);
            });
          }
        });
      }
    });

    return participants;
  } catch (error) {
    throw error;
  }
};

export const changeParticipantStatus = async participant => {
  try {
    let participantsDoc = await Firestore.collection('participant_groups')
      .doc(participant.participants_group_id)
      .get();

    let data = await participantsDoc.data();

    await data.participant_list.map(async item => {
      if (item.email === participant.email) {
        item.status = !participant.status;
      }
    });

    return Firestore.collection('participant_groups')
      .doc(participant.participants_group_id)
      .set(data);
  } catch (error) {
    throw error;
  }
};
