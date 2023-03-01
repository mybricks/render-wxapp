import pkg from "../package.json";
import executor from "./executor";
import {defaultObservable} from "./observable";
import {compareVersion} from "./utils";

console.log(`%c ${pkg.name} %c@${pkg.version}`, `color:#FFF;background:#fa6400`, ``, ``);

export default function render(json, opts: { events?, env?, comDefs, observable?, ref? } = {}) {
  const env = Object.assign({
    runtime: {},
    i18n(text: any) {
      return text
    },
    canvasElement: document.body
  }, opts.env)

  const onError = (e) => {
    console.error(e)
  }

  const logger = {
    ...console,
    error: (e) => {
      console.error(e)
    },
  }

  const comDefs = opts.comDefs

  const getComDef = (def) => {
    const rtn = comDefs[def.namespace + '-' + def.version]
    if (!rtn) {
      const ary = []
      for (let ns in comDefs) {
        if (ns.startsWith(def.namespace + '-')) {
          ary.push(comDefs[ns])
        }
      }

      if (ary && ary.length > 0) {
        ary.sort((a, b) => {
          return compareVersion(a.version, b.version)
        })

        const rtn0 = ary[0]
        console.warn(`【Mybricks】组件${def.namespace + '@' + def.version}未找到，使用${rtn0.namespace}@${rtn0.version}代替.`)

        return rtn0
      } else {
        console.log(comDefs)

        throw new Error(`组件${def.namespace + '@' + def.version}未找到，请确定是否存在该组件以及对应的版本号.`)
      }
    }
    return rtn
  }

  let refs
  const context = executor({
    json,
    getComDef,
    events: opts.events,
    env,
    ref(_refs) {
      refs = _refs
      if (opts.ref) {
        opts.ref(_refs)
      }
    },
    onError,
    logger
  }, {
    observable: opts.observable || defaultObservable
  })

  refs.run()

  return context
}
