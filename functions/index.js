const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendQueuedNotifications = onSchedule(
  "every 1 minutes",
  async () => {

    console.log("通知チェック");

    const now = new Date();

    const snapshot = await admin.firestore()
      .collection("notificationQueue")
      .where("sent", "==", false)
      .where("sendAt", "<=", now)
      .get();

    if (snapshot.empty) {
      return null;
    }


    for (const docSnap of snapshot.docs) {

      const data = docSnap.data();

      console.log(
        `${data.count}件処理`
      );


      await docSnap.ref.update({
        sent: true
      });
    }


    return null;
  }
);
