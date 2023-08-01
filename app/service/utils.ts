
import { Service } from 'egg';
import { createSSRApp } from 'vue';
import LegoComponents from 'lego-components';
import { renderToString } from '@vue/server-renderer';
export default class UtilsService extends Service {
  propsToStyle(props = {}) {
    const keys = Object.keys(props);
    const styleArr = keys.map(key => {
      const formatKey = key.replace(/[A-Z]/g, c => `-${c.toLocaleLowerCase()}`);
      // fontSize --> font-size
      const value = props[key];
      return `${formatKey}: ${value}`;
    });
    return styleArr.join(';');
  }
  px2vw(components = []) {
    // '10px' '9.5px'
    const reg = /^(\d+(\.\d+)?)px$/;
    components.forEach((component: any = {}) => {
      const props = component.props || {};
      // 遍历组件的属性
      Object.keys(props).forEach(key => {
        const val = props[key];
        if (typeof val !== 'string') {
          return;
        }
        // value 中没有 px，不是一个距离的属性
        if (reg.test(val) === false) {
          return;
        }
        const arr = val.match(reg) || [];
        const numStr = arr[1];
        const num = parseFloat(numStr);
        // 计算出 vw，重新赋值
        // 编辑器的画布宽度是 375
        const vwNum = (num / 375) * 100;
        props[key] = `${vwNum.toFixed(2)}vw`;
      });
    });
  }
  async renderToPageData(query: { id: number, uuid: string }) {
    const work = await this.app.model.Work.findOne(query).lean();
    if (!work) {
      throw new Error('work not exist');
    }
    const { title, desc, content } = work;
    this.px2vw(content && content.components);
    const vueApp = createSSRApp({
      data: () => {
        return {
          components: (content && content.components) || [],
        };
      },
      template: '<final-page :components="components"></final-page>',
    });
    // 把组件添加到vue里面
    vueApp.use(LegoComponents);
    const html = await renderToString(vueApp);
    const bodyStyle = this.propsToStyle(content && content.props);
    return {
      html,
      title,
      desc,
      bodyStyle,
    };
  }

}
