import { Firestore } from '../lib/firebase';

export const addClient = async payload => {
  try {
    let groupIds = [];
    let tasks = payload.groups.map(group => {
      let groupDoc = Firestore.collection('employee_groups').doc();
      let employee_list = group.employee_list.map(employee => {
        return {
          name: employee[0],
          email: employee[1]
        };
      });
      groupIds.push(groupDoc.id);
      return groupDoc.set({
        id: groupDoc.id,
        name: group.name,
        division: group.division,
        number_of_employees: group.number_of_employees,
        employee_list
      });
    });
    await Promise.all(tasks);

    let clientDoc = Firestore.collection('clients').doc();
    await clientDoc.set({
      id: clientDoc.id,
      org: payload.basic.org,
      contact: payload.basic.contact,
      status: 'active',
      employee_group_ids: groupIds
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
        groupDoc = Firestore.collection('employee_groups').doc();
      } else {
        groupDoc = Firestore.collection('employee_groups').doc(group.id);
      }

      let employee_list = group.employee_list.map(employee => {
        return {
          name: employee[0],
          email: employee[1]
        };
      });
      groupIds.push(groupDoc.id);
      if (group.newlyAdded) {
        return groupDoc.set({
          id: groupDoc.id,
          name: group.name,
          division: group.division,
          number_of_employees: group.number_of_employees,
          employee_list
        });
      } else {
        return groupDoc.update({
          id: groupDoc.id,
          name: group.name,
          division: group.division,
          number_of_employees: group.number_of_employees,
          employee_list
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
      employee_group_ids: groupIds
    });
  } catch (error) {
    throw error;
  }
};

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

      let tasks = clientData.employee_group_ids.map(
        groupId =>
          new Promise((resolve, reject) => {
            let employee_group_doc = Firestore.collection(
              'employee_groups'
            ).doc(groupId);
            employee_group_doc.onSnapshot(group_snapshot => {
              let employee_group_data = group_snapshot.data();
              resolve(employee_group_data);
            });
          })
      );
      clientData.employee_groups = await Promise.all(tasks);
      resolve(clientData);
    });
  });

// search clients with the criteria
export const getClients = async payload => {
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
