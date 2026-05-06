(() => {
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (!isLocal) return;

  let lastToken = "";

  async function checkReloadToken() {
    try {
      const response = await fetch(`/__reload?ts=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (!lastToken) {
        lastToken = data.token;
        return;
      }
      if (data.token !== lastToken) {
        location.reload();
      }
    } catch {
      return;
    }
  }

  checkReloadToken();
  window.setInterval(checkReloadToken, 1000);
})();
