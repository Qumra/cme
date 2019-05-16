import axios from 'axios';
import openCmeMenuCommand from './views/desktop/openCmeMenu/OpenCmeMenu';
import openCmeHelp from './views/desktop/help/OpenCmeHelp';

const prel = window.Prel;

const initMenuCtrlPiu = () => {
  prel.start('u2020_cme_portal_menu_ctrl', '1.0.0', ['$dom', 'user', 'locale', 'session'], (piu) => {

    piu.set('currentApp', 'U2020-M_CME_App');
    axios.get(`/rest/oss/cme/v1/menus`)
      .then(res => {
        const { data } = res;
        if (!window.Cme) {
          window.Cme = {};
        }
        window.Cme.menus = data.menus;
        piu.emit('updateAppContext', { cme_menu_ctrl: data.menus });
        // piu.emit('initCme', {});
        piu.emit('updateMenu', {menuInfos: data.menus});
      }).catch(() => {
        // TODO::
      })
  });
}

const initMenuHandlePiu = () => {
  prel.start('u2020_cme_portal_menu_handler', '1.0.0', ['$dom', 'user', 'locale', 'session'], (piu) => {
    function onCmeMenuClicked(menu) {
      const jMenu = JSON.parse(menu.replace(/'/g, '"'));
      if (jMenu.key) {
        openCmeMenuCommand(jMenu.key);
      }
    }

    window.Cme = window.Cme || {};
    window.Cme.piuAttacheds = window.Cme.piuAttacheds || [];
    const piuAttached = {
      userAction: {
        cmeMenu: onCmeMenuClicked
      }
    };
    window.Cme.piuAttacheds.push(piuAttached);
    piu.attach(piu, piuAttached);
  });
}

const initOverflowFebStylePiu = () => {
  try {
    let bodys = document.getElementsByTagName('body');
    if (bodys && bodys[0]) {
      bodys[0].style.setProperty('overflow-y', 'hidden', 'important');
    }
    bodys = null;
  } catch (error) {
    // TODO::
  }
}

let intervalIds = [];

const initHelpBtnListener = (intervalId) => {
  const helpElement = document.querySelector("[data-measure='refr.mm-sys'] [data-opener='url']");
  if (helpElement && helpElement.onclick) { // 覆盖U2000对平台帮助的处理
    if (intervalId) {
      clearInterval(intervalId);
      for (let index = 0; index < intervalIds.length; index++) {
        if (intervalIds[index] === intervalId) {
          intervalIds.splice(index, 1);
          break;
        }
      }
    }
    helpElement.onclick = (event) => {
      event.preventDefault();
      openCmeHelp();
    }
    if (window.Cme.changePageSize) {
      window.Cme.changePageSize();
    }
  }
}


const beforeUnload = () => {
  intervalIds.forEach((intervalId) => window.clearInterval(intervalId));
  intervalIds.length = 0;
  intervalIds = null;
  window.removeEventListener('beforeunload', beforeUnload);
}

const registerMenu = () => {
  initMenuCtrlPiu();
  initMenuHandlePiu();
  initOverflowFebStylePiu();
  const intervalId = window.setInterval(() => {initHelpBtnListener(intervalId)}, 500);
  if (intervalId) {
    intervalIds.push(intervalId);
    window.addEventListener('beforeunload', beforeUnload);
  }
}

export default registerMenu;
