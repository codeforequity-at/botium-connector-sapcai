const util = require('util')
const debug = require('debug')('botium-connector-sapcai')

const SimpleRestContainer = require('botium-core/src/containers/plugins/SimpleRestContainer.js')
const CoreCapabilities = require('botium-core/src/Capabilities')

const URL = 'https://api.cai.tools.sap/build/v1/dialog'
const METHOD = 'POST'

const Capabilities = {
  SAPCAI_TOKEN: 'SAPCAI_TOKEN',
  SAPCAI_LANGUAGE: 'SAPCAI_LANGUAGE',
  SAPCAI_MEMORY: 'SAPCAI_MEMORY'
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

    if (!this.caps[Capabilities.SAPCAI_TOKEN]) throw new Error('SAPCAI_TOKEN capability required')

    if (!this.delegateContainer) {
      // default values
      this.delegateCaps = {
        [CoreCapabilities.SIMPLEREST_URL]: URL,
        [CoreCapabilities.SIMPLEREST_METHOD]: METHOD,
        [CoreCapabilities.SIMPLEREST_BODY_JSONPATH]: '$.results.messages[*]',
        [CoreCapabilities.SIMPLEREST_CONTEXT_JSONPATH]: '$.results.conversation.memory',
        [CoreCapabilities.SIMPLEREST_CONTEXT_MERGE_OR_REPLACE]: 'REPLACE',
        [CoreCapabilities.SIMPLEREST_HEADERS_TEMPLATE]: `{ "Authorization": "Token ${this.caps[Capabilities.SAPCAI_TOKEN]}"}`
      }
      if (this.caps[Capabilities.SAPCAI_MEMORY]) {
        this.delegateCaps[CoreCapabilities.SIMPLEREST_INIT_CONTEXT] = this.caps[Capabilities.SAPCAI_MEMORY]
      }

      const bodyTemplate = {
        message: {
          type: 'text',
          content: '{{msg.messageText}}'
        },
        conversation_id: '{{botium.conversationId}}'
      }
      if (this.caps[Capabilities.SAPCAI_LANGUAGE]) {
        bodyTemplate.language = this.caps[Capabilities.SAPCAI_LANGUAGE]
      }
      this.delegateCaps[CoreCapabilities.SIMPLEREST_BODY_TEMPLATE] = JSON.stringify(bodyTemplate, null, 2)

      this.delegateCaps[CoreCapabilities.SIMPLEREST_REQUEST_HOOK] = ({ msg, requestOptions, context }) => {
        if (context) {
          requestOptions.body.memory = context
        }
        if (msg.buttons && msg.buttons.length > 0) {
          requestOptions.body.message.content = msg.buttons[0].payload || msg.buttons[0].text
        }
      }
      this.delegateCaps[CoreCapabilities.SIMPLEREST_RESPONSE_HOOK] = ({ botMsg, botMsgRoot }) => {
        if (botMsgRoot.type === 'text') {
          botMsg.messageText = botMsgRoot.content
        }
        if (botMsgRoot.type === 'card') {
          botMsg.cards = [{
            text: botMsgRoot.content.title,
            subtext: botMsgRoot.content.subtitle,
            image: { mediaUri: botMsgRoot.content.imageUrl },
            buttons: (botMsgRoot.content.buttons && botMsgRoot.content.buttons.map(b => ({ text: b.title, payload: b.value }))) || []
          }]
        }
        if (botMsgRoot.type === 'buttons') {
          botMsg.cards = [{
            text: botMsgRoot.content.title,
            buttons: (botMsgRoot.content.buttons && botMsgRoot.content.buttons.map(b => ({ text: b.title, payload: b.value }))) || []
          }]
        }
        if (botMsgRoot.type === 'quickReplies') {
          botMsg.cards = [{
            text: botMsgRoot.content.title,
            buttons: (botMsgRoot.content.buttons && botMsgRoot.content.buttons.map(b => ({ text: b.title, payload: b.value }))) || []
          }]
        }
        if (botMsgRoot.type === 'carousel') {
          botMsg.cards = botMsgRoot.content.map(card => ({
            text: card.title,
            subtext: card.subtitle,
            image: { mediaUri: card.imageUrl },
            buttons: (card.buttons && card.buttons.map(b => ({ text: b.title, payload: b.value }))) || []
          }))
        }
        if (botMsgRoot.type === 'list') {
          botMsg.cards = botMsgRoot.content.elements.map(li => ({
            text: li.title,
            subtext: li.subtitle,
            image: { mediaUri: li.imageUrl },
            buttons: (li.buttons && li.buttons.map(b => ({ text: b.title, payload: b.value }))) || []
          }))
        }
        if (botMsgRoot.type === 'picture' || botMsgRoot.type === 'video') {
          botMsg.media = [{
            mediaUri: botMsgRoot.content
          }]
        }

        botMsg.nlp = {}
        if (botMsg.sourceData.results.nlp) {
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
        if (!botMsg.nlp.intent) {
          botMsg.nlp.intent = { incomprehension: true }
        }
      }

      this.delegateCaps = Object.assign({}, this.caps, this.delegateCaps)

      debug(`Validate delegateCaps ${util.inspect(this.delegateCaps)}`)
      this.delegateContainer = new SimpleRestContainer({ queueBotSays: this.queueBotSays, caps: this.delegateCaps })
    }

    debug('Validate delegate')
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
  PluginClass: BotiumConnectorSAPCAI,
  PluginDesc: {
    name: 'SAP Conversational AI',
    provider: 'SAP',
    capabilities: [
      {
        name: 'SAPCAI_TOKEN',
        label: 'Token',
        type: 'secret',
        required: true
      },
      {
        name: 'SAPCAI_LANGUAGE',
        label: 'Language',
        description: 'A valid language isocode like "en". If not provided a language detection will be performed.',
        type: 'string',
        required: false
      },
      {
        name: 'SAPCAI_MEMORY',
        label: 'Conversation Memory',
        description: 'Initial conversation memory',
        type: 'json',
        required: false
      }
    ]
  }
}
