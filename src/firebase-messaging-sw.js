importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp(
  {
    apiKey: "AIzaSyB0n6NYQuSGCN2weIPLpSeaA8VDvjmI4N8",
    authDomain: "contabilidade-project.firebaseapp.com",
    projectId: "contabilidade-project",
    storageBucket: "contabilidade-project.firebasestorage.app",
    messagingSenderId: "693672376611",
    appId: "1:693672376611:web:de9b789d04b89554d1f496",
    measurementId: "G-Z00XG5DZDJ",
    vapidKey: "BOXxhSzg-ib3GQrvhVbjDKpuitFszpZrtimGxHXAD7PHMZ3LUhZ5YoqQoeKSXzqCw-J2PicL4R3mtYG44yp3lPw" // Substitua por sua chave VAPID real
  }
);

const messaging = firebase.messaging();

// Manipula mensagens em background
messaging.onBackgroundMessage((payload) => {
  console.log('Recebida mensagem em background:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icons/icon-72x72.png',
    badge: '/assets/icons/icon-72x72.png',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
}); 