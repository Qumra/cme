import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import './index.css';
import axios from 'axios';
import App from './App';
import './resources/css/main.css';
import './resources/css/eview.css'; // 别动这个，全局覆盖eView有问题的样式
import setAxiosDefault from './util/axiosDefaults';
//import registerServiceWorker from './registerServiceWorker';
import registerProtalMenu from './registerPortalMenu';
import ModalDialog from './component/ModalDialog/index';

const {
  warn
} = ModalDialog;

const init = () => {
  window.Prel.start('cme_init_home', '1.0.0', ['$dom', 'user', 'locale', 'session'], (piu, st) => {
    window.Cme = {};
    window.Cme.piu = piu;
    piu.attach(piu, {
      updateMenu: updateMenuInfos,
      userAction: {
        logout: clearDatas
      }
    });

    const { id, name, roles } = st.user;
    const { csrfToken } = st.session;
    const showedrand = csrfToken;
    const userInfo = { id, name, showedrand };
    const userInfoStr = window.sessionStorage.getItem('CME_userInfo');
    if (userInfoStr) { // 进入主页时判断是否有历史数据，并且对应的crsfToken是否一致，不一致则清除历史数据
      const origUserInfo = JSON.parse(userInfoStr);
      if (origUserInfo && origUserInfo.showedrand && showedrand !== origUserInfo.showedrand) {
        clearDatas();
      }
    }

    setAxiosDefault(userInfo);
    const language = getLaguange();
    // 对Guests(来宾组)用户，无权限访问CME的拦截提示
    if (roles && typeof roles.find === 'function' && roles.find(element => element.id === '16')) {
      warn({
        content: language === 'Zh' ? '没有访问权限。' : 'No access permission.',
        onOk: () => {
          window.location.href = '/mbbportalwebsite/index.html?currentApp=U2020-M#/';
        },
        onClose: () => {
          window.location.href = '/mbbportalwebsite/index.html?currentApp=U2020-M#/';
        }
      });
    }
    window.sessionStorage.setItem('CME_userInfo', JSON.stringify(userInfo));
    window.sessionStorage.setItem('CME_language', language);
    window.sessionStorage.setItem('CME_userRoles', JSON.stringify(roles));
    renderRoot(language, []);

    let webswingHeartBeat = null;

    webswingHeartBeat = window.setInterval(checkWebswingConnect, 60000);

    window.addEventListener('beforeunload', () => {
      if (webswingHeartBeat) {
        clearInterval(webswingHeartBeat);
      }
    })

    function readCookie(name) {
      const namePattern = `${escape(name)}=`;
      const cookieArr = document.cookie.split(';');
      let param = null;
      cookieArr.forEach(item => {
        let tmpCookie = item;
        while (tmpCookie.charAt(0) === ' ') {
          tmpCookie = tmpCookie.substring(1, tmpCookie.length);
        }
        if (tmpCookie.indexOf(namePattern) === 0) {
          param = unescape(tmpCookie.substring(namePattern.length, tmpCookie.length));
        }
      })
      return param;
    }

    function checkWebswingConnect() {
      const clientId = readCookie('webswingID');
      const heartbeatUrl = `https://127.0.0.1:31942/rest/webswing/heartbeat/${clientId}`;
      if (clientId) {
        axios
          .get(heartbeatUrl)
          .then(
            //TODO::
          );
      }
    }

    function updateMenuInfos(menu) {
      renderRoot(getLaguange(), menu.menuInfos);
    }

    function clearDatas() {
      window.sessionStorage.removeItem('CME_storeData');
    }

    function getLaguange() {
      return st.locale === 'zh-cn' ? 'Zh' : 'En';
    }

    function renderRoot(language, menuInfos) {
      ReactDOM.render(
        <IntlProvider locale={language === 'Zh' ? 'zh' : 'en'}>
          <App language={language} menuInfos={menuInfos}/>
        </IntlProvider>,
        document.getElementById('root')
      );
    }
  });
}

init();
registerProtalMenu();
