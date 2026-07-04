(function () {
  var el = document.getElementById('countdown');
  if (!el) return;
  var expires = new Date(el.getAttribute('data-expires')).getTime();

  function tick() {
    var remaining = expires - Date.now();
    if (remaining <= 0) {
      el.textContent = 'expired';
      el.style.color = '#dc2626';
      clearInterval(timer);
      return;
    }
    var m = Math.floor(remaining / 60000);
    var s = Math.floor((remaining % 60000) / 1000);
    el.textContent = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  }
  tick();
  var timer = setInterval(tick, 1000);
})();
