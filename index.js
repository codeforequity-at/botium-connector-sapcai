const util = require('util')
const debug = require('debug')('botium-connector-sapcai')

const SimpleRestContainer = require('botium-core/src/containers/plugins/SimpleRestContainer.js')
const CoreCapabilities = require('botium-core/src/Capabilities')

const URL = 'https://api.cai.tools.sap/build/v1/dialog'
const METHOD = 'POST'

const Capabilities = {
  SAPCAI_TOKEN: 'SAPCAI_TOKEN',
  SAPCAI_LANGUAGE: 'SAPCAI_LANGUAGE'
}

class BotiumConnectorSAPCAI {
  constructor ({ queueBotSays, caps }) {
    this.queueBotSays = queueBotSays
    this.caps = caps
    this.delegateContainer = null
    this.delegateCaps = null
  }

  Validate () {
    debug('Validate called')

    // if (!this.caps[Capabilities.SAPCAI_TOKEN]) throw new Error('SAPCAI_TOKEN capability required')

    if (!this.delegateContainer) {
      // default values
      this.delegateCaps = {
        [CoreCapabilities.SIMPLEREST_URL]: URL,
        [CoreCapabilities.SIMPLEREST_METHOD]: METHOD,
        [CoreCapabilities.SIMPLEREST_RESPONSE_JSONPATH]: '$.results.messages[?(@.type=="text")].content',
        [CoreCapabilities.SIMPLEREST_MEDIA_JSONPATH]: '$.results.messages[?(@.type=="video" || @.type=="picture")].content',
        [CoreCapabilities.SIMPLEREST_BUTTONS_JSONPATH]: '$.results.messages..buttons..title'
      }
      if (this.caps[Capabilities.SAPCAI_TOKEN]) {
        this.delegateCaps[CoreCapabilities.SIMPLEREST_HEADERS_TEMPLATE] = `{ "Authorization": "Token ${this.caps[Capabilities.SAPCAI_TOKEN]}"}`
      }

      this.delegateCaps[CoreCapabilities.SIMPLEREST_BODY_TEMPLATE] =
        this.caps[Capabilities.SAPCAI_LANGUAGE]
          ? `{ 
          "message": {"type": "text", "content": "{{msg.messageText}}"}, 
          "conversation_id": "{{botium.conversationId}}",
          "language": "${this.caps[Capabilities.SAPCAI_LANGUAGE]}"
        }`
          : `{ 
          "message": {"type": "text", "content": "{{msg.messageText}}"}, 
          "conversation_id": "{{botium.conversationId}}"
        }`

      this.delegateCaps[CoreCapabilities.SIMPLEREST_RESPONSE_HOOK] = ({ botMsg }) => {
        if (botMsg.sourceData.results.nlp) {
          botMsg.nlp = {
          }
          const intents = botMsg.sourceData.results.nlp.intents
          const entities = botMsg.sourceData.results.nlp.entities
          if (intents && intents.length > 0) {
            botMsg.nlp.intent = {
              name: intents[0].slug,
              confidence: intents[0].confidence,
              intents: intents.map(i => ({
                name: i.slug,
                confidence: i.confidence
              }))
            }
          }
          if (entities && Object.keys(entities).length > 0) {
            botMsg.nlp.entities = Object.keys(entities).reduce((agg, ename) => {
              return agg.concat(entities[ename].map(e => ({
                name: ename,
                value: e.raw,
                confidence: e.confidence
              })))
            }, [])
          }
        }
      }

      this.delegateCaps = Object.assign({}, this.caps, this.delegateCaps)

      debug(`Validate delegateCaps ${util.inspect(this.delegateCaps)}`)
      this.delegateContainer = new SimpleRestContainer({ queueBotSays: this.queueBotSays, caps: this.delegateCaps })
    }

    debug(`Validate delegate`)
    return this.delegateContainer.Validate()
  }

  Build () {
    if (this.delegateContainer.Build) {
      this.delegateContainer.Build()
    }

    debug('Build called')
    return Promise.resolve()
  }

  Start () {
    debug('Start called')

    if (this.delegateContainer.Start) {
      this.delegateContainer.Start()
    }

    return Promise.resolve()
  }

  UserSays (msg) {
    debug('UserSays called')
    return this.delegateContainer.UserSays(msg)
  }

  Stop () {
    debug('Stop called')

    if (this.delegateContainer.Stop) {
      this.delegateContainer.Stop()
    }

    return Promise.resolve()
  }

  Clean () {
    debug('Clean called')
    if (this.delegateContainer.Clean) {
      this.delegateContainer.Clean()
    }

    return Promise.resolve()
  }
}

module.exports = {
  PluginVersion: 1,
  PluginClass: BotiumConnectorSAPCAI
}
