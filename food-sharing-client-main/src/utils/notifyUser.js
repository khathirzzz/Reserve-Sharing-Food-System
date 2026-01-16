export const notifyUser = async ({ title, body }) => {
  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/logo.png",
    });

    // 🔊 Play sound
    const audio = new Audio("/pingnoti.mp3");
    audio.volume = 0.8;
    audio.play().catch(() => {});
  }
};