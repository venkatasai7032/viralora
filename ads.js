/* Viralora ads: Slot 1 (home banner) + Slot 3 (footer native banner) */
(function () {
  function init() {
    var css = document.createElement('style');
    css.textContent =
      '.ad-wrap{max-width:760px;margin:2rem auto;padding:0 1rem;text-align:center;overflow:hidden}' +
      '.ad-label{font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:#7a8499;margin-bottom:6px}' +
      '.ad-wrap iframe{border:0;max-width:100%}';
    document.head.appendChild(css);

    // Slot 1: banner on the home page, between hero and tools section
    var desktop = window.innerWidth >= 768;
    var home = document.getElementById('page-home');
    var tools = home && home.querySelector('.section');
    if (tools) {
      var w1 = document.createElement('div');
      w1.className = 'ad-wrap';
      w1.innerHTML = '<div class="ad-label">Advertisement</div>' +
        '<iframe src="' + (desktop ? '/ad-728.html' : '/ad-320.html') + '" ' +
        'width="' + (desktop ? 728 : 320) + '" height="' + (desktop ? 90 : 50) + '" ' +
        'scrolling="no" frameborder="0" title="Advertisement"></iframe>';
      tools.parentNode.insertBefore(w1, tools);
    }

    // Slot 3: native banner above the footer (shows on every page)
    var footer = document.querySelector('footer');
    if (footer) {
      var w3 = document.createElement('div');
      w3.className = 'ad-wrap';
      w3.innerHTML = '<div class="ad-label">Advertisement</div>' +
        '<div id="container-f5750e1875284f5d7ca40726eb6b79cf"></div>';
      footer.parentNode.insertBefore(w3, footer);
      var s = document.createElement('script');
      s.async = true;
      s.setAttribute('data-cfasync', 'false');
      s.src = 'https://bicea.org/21/f5750e1875284f5d7ca40726eb6b79cf';
      w3.appendChild(s);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
