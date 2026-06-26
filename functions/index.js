const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendQueuedNotifications = onSchedule(
  "every 1 minutes",
  async () => {

    const now = new Date();

    const snapshot = await admin.firestore()
      .collection("notificationQueue")
      .where("sent", "==", false)
      .where("sendAt", "<=", now)
      .get();


    if (snapshot.empty) {
      console.log("通知なし");
      return null;
    }


    const usersSnapshot = await admin.firestore()
      .collection("users")
      .get();


    for (const docSnap of snapshot.docs) {

      const data = docSnap.data();

      const tokens = [];

      usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data();

        if (userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      });


      if (tokens.length > 0) {

        await admin.messaging().sendEachForMulticast({
          notification: {
            title: "ふらっとCafe",
            body:
              `${data.author}さんが予定を${data.count}件追加しました`
          },
          tokens
        });

      }


      await docSnap.ref.update({
        sent: true
      });

    }


    return null;
  }
);
